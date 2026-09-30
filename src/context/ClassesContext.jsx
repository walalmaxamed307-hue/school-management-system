import { createContext } from 'react'
import { api } from '@/lib/api'
import { classNumber } from '@/lib/grading'
import { useStaffResource } from '@/lib/useStaffResource'

// eslint-disable-next-line react-refresh/only-export-components
export const ClassesContext = createContext(null)

const EMPTY = []

// Backend-ka: Class { _id, name, level, hasSections, sections: [{_id,name}] }.
// Pages-ka (StudentsPage, Attendance, Fees...) weli waxay isticmaalaan
// MAGACYO (class.name, sections = ['A','B']), sidaas darteed waxaan halkan
// ku ilaalinaynaa qaabkaas — laakiin fasal kasta wuxuu hadda sidoo kale
// leeyahay `id` iyo `sectionItems` [{id,name}] (loo baahan yahay marka
// ardayda/attendance/fees la isku xiro backend-ka: waxay u baahan yihiin ids).
async function loadClasses() {
  const list = await api.get('/classes')
  return list.map((c) => {
    const sectionItems = (c.sections || [])
      .map((s) => ({ id: s._id, name: s.name }))
      .sort((a, b) => a.name.localeCompare(b.name))
    return {
      id: c._id,
      name: c.name,
      level: c.level,
      hasSections: c.hasSections,
      sections: sectionItems.map((s) => s.name),
      sectionItems,
    }
  })
}

// level = tirada ku jirta magaca ("Fasalka 5" -> 5). Haddii magacu tiro
// lahayn (tusaale "KG"), waxaa la siinayaa level ka weyn kii ugu badnaa.
function levelFor(name, classes) {
  const n = classNumber(name)
  if (Number.isFinite(n)) return n
  return classes.reduce((max, c) => Math.max(max, c.level ?? 0), 0) + 1
}

export function ClassesProvider({ children }) {
  const { data: classes, loading, run } = useStaffResource(loadClasses, EMPTY)

  function getClass(name) {
    return classes.find((c) => c.name === name) ?? null
  }

  function getClassById(id) {
    return classes.find((c) => c.id === id) ?? null
  }

  function getSectionId(className, sectionName) {
    return getClass(className)?.sectionItems.find((s) => s.name === sectionName)?.id ?? null
  }

  async function addClass(name) {
    const trimmed = name.trim()
    if (!trimmed || classes.some((c) => c.name === trimmed)) return false
    return run(() => api.post('/classes', { name: trimmed, level: levelFor(trimmed, classes) }))
  }

  async function removeClass(name) {
    const c = getClass(name)
    if (!c) return false
    return run(() => api.delete(`/classes/${c.id}`))
  }

  async function updateClass(oldName, newName) {
    const trimmed = newName.trim()
    const c = getClass(oldName)
    if (!c || !trimmed || classes.some((x) => x.name === trimmed)) return false
    const body = { name: trimmed }
    const n = classNumber(trimmed)
    if (Number.isFinite(n)) body.level = n
    return run(() => api.patch(`/classes/${c.id}`, body))
  }

  // Ma jirto "disable sections" — waxay khatar gelin lahayd ardayda horeyba
  // section loo qoondeeyay.
  async function enableSections(className) {
    const c = getClass(className)
    if (!c) return false
    return run(() => api.patch(`/classes/${c.id}/enable-sections`))
  }

  async function addSection(className, sectionName) {
    const c = getClass(className)
    const trimmed = sectionName.trim()
    if (!c || !trimmed || c.sections.includes(trimmed)) return false
    return run(() => api.post(`/classes/${c.id}/sections`, { name: trimmed }))
  }

  async function removeSection(className, sectionName) {
    const c = getClass(className)
    const sectionId = getSectionId(className, sectionName)
    if (!c || !sectionId) return false
    return run(() => api.delete(`/classes/${c.id}/sections/${sectionId}`))
  }

  return (
    <ClassesContext.Provider
      value={{
        classes,
        loading,
        addClass,
        removeClass,
        updateClass,
        getClass,
        getClassById,
        getSectionId,
        enableSections,
        addSection,
        removeSection,
      }}
    >
      {children}
    </ClassesContext.Provider>
  )
}
