import { createContext, useMemo } from 'react'
import { api } from '@/lib/api'
import { useStaffResource } from '@/lib/useStaffResource'

// eslint-disable-next-line react-refresh/only-export-components
export const SubjectsContext = createContext(null)

const EMPTY = []

async function loadSubjects() {
  const list = await api.get('/subjects')
  return list.map((s) => ({ id: s._id, name: s.name, code: s.code ?? null }))
}

export function SubjectsProvider({ children }) {
  const { data: subjectItems, loading, run } = useStaffResource(loadSubjects, EMPTY)

  // `subjects` waa liis magacyo ah (sida hore — pages-ka weli sidaas
  // isticmaalaan); `subjectItems` wuxuu leeyahay ids-ka.
  const subjects = useMemo(() => subjectItems.map((s) => s.name), [subjectItems])

  function getSubjectId(name) {
    return subjectItems.find((s) => s.name === name)?.id ?? null
  }

  async function addSubject(name) {
    const trimmed = name.trim()
    if (!trimmed || subjects.includes(trimmed)) return false
    return run(() => api.post('/subjects', { name: trimmed }))
  }

  async function updateSubject(oldName, newName) {
    const trimmed = newName.trim()
    const id = getSubjectId(oldName)
    if (!id || !trimmed || subjects.includes(trimmed)) return false
    return run(() => api.patch(`/subjects/${id}`, { name: trimmed }))
  }

  async function removeSubject(name) {
    const id = getSubjectId(name)
    if (!id) return false
    return run(() => api.delete(`/subjects/${id}`))
  }

  return (
    <SubjectsContext.Provider
      value={{ subjects, subjectItems, loading, getSubjectId, addSubject, updateSubject, removeSubject }}
    >
      {children}
    </SubjectsContext.Provider>
  )
}
