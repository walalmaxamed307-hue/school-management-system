import { createContext } from 'react'
import { api } from '@/lib/api'
import { useStaffResource } from '@/lib/useStaffResource'
import { useToast } from '@/hooks/useToast'

// eslint-disable-next-line react-refresh/only-export-components
export const StudentsContext = createContext(null)

const INITIAL = { students: [], graduates: [] }

function mapStudent(s) {
  return {
    id: s.id, // Student._id
    enrollmentId: s.enrollmentId, // loo baahan yahay attendance/fees/exams
    studentCode: s.studentCode, // ID-ga ardayga (STU-000123)
    name: s.name,
    class: s.class,
    section: s.section ?? null,
    classId: s.classId ?? null,
    sectionId: s.sectionId ?? null,
    dob: s.dob ? String(s.dob).slice(0, 10) : '',
    parentName: s.parentName ?? '',
    parentPhone: s.parentPhone ?? '',
    status: s.status, // active | withdrawn | transferred (graduated -> graduates[])
    feeCategory: s.feeCategory,
    discountAmount: s.discountAmount ?? null,
  }
}

async function loadStudents() {
  const [list, grads] = await Promise.all([api.get('/students'), api.get('/students/graduates')])
  return {
    students: list.map(mapStudent),
    graduates: grads.map((g) => ({
      id: g.id,
      name: g.name,
      studentCode: g.studentCode,
      parentName: g.parentName ?? '',
      parentPhone: g.parentPhone ?? '',
      class: g.lastClass,
      section: g.lastSection ?? null,
      graduatedDate: g.graduatedAt ? String(g.graduatedAt).slice(0, 10) : null,
      status: 'graduated',
    })),
  }
}

// Ardayda waxay ka yimaadaan backend-ka (iskuulka user-ka login ah KALIYA).
// Forms-ka (StudentForm) waxay dirayaan classId/sectionId (ma aha magacyo).
export function StudentsProvider({ children }) {
  const { data, loading, reload, run } = useStaffResource(loadStudents, INITIAL)
  const { showToast } = useToast()

  // data: { name, classId, sectionId?, dob, parentName, parentPhone, feeCategory, discountAmount }
  async function addStudent(d) {
    try {
      const created = await api.post('/students', {
        fullName: d.name,
        classId: d.classId,
        sectionId: d.sectionId || undefined,
        dob: d.dob,
        parentName: d.parentName,
        parentPhone: d.parentPhone,
        feeCategory: d.feeCategory,
        discountAmount: d.feeCategory === 'discount' ? d.discountAmount : undefined,
      })
      await reload()
      return created
    } catch (err) {
      showToast(err.message, 'error')
      return null
    }
  }

  async function updateStudent(id, d) {
    const current = data.students.find((s) => s.id === id)
    const body = {
      fullName: d.name,
      dob: d.dob,
      parentName: d.parentName,
      parentPhone: d.parentPhone,
      feeCategory: d.feeCategory,
      discountAmount: d.feeCategory === 'discount' ? d.discountAmount : null,
    }
    // Fasal/xaaladda waxaa la dirayaa kaliya haddii la beddelay (ardayda
    // transferred/withdrawn fasalkooda lama beddeli karo).
    if (current?.status === 'active') {
      body.classId = d.classId
      body.sectionId = d.sectionId || null
    }
    if (d.status && current && d.status !== current.status) body.lifecycleStatus = d.status
    return run(() => api.patch(`/students/${id}`, body))
  }

  async function deleteStudent(id) {
    return run(() => api.delete(`/students/${id}`))
  }

  // Ardayda weli section aan lahayn u qaybi section (hal mar, hal section).
  async function bulkAssignSection(studentIds, classId, sectionId) {
    const enrollmentIds = data.students
      .filter((s) => studentIds.includes(s.id))
      .map((s) => s.enrollmentId)
    try {
      const res = await api.post(`/classes/${classId}/bulk-assign-section`, { sectionId, enrollmentIds })
      const failed = res.results.filter((r) => !r.ok)
      if (failed.length > 0) {
        showToast(`${res.results.length - failed.length} arday la qaybiyay, ${failed.length} way fashilmeen: ${failed[0].error}`, 'error')
      } else {
        showToast(`${res.results.length} arday ayaa la qaybiyay`, 'success')
      }
      await reload()
      return failed.length === 0
    } catch (err) {
      showToast(err.message, 'error')
      return false
    }
  }

  // Wareejin dhab ah: backend-ku wuxuu abuuraa arday CUSUB iskuulka kale.
  async function transferStudent(id, toSchoolId) {
    try {
      const res = await api.post(`/students/${id}/transfer`, toSchoolId ? { toSchoolId } : {})
      await reload()
      return res
    } catch (err) {
      showToast(err.message, 'error')
      return null
    }
  }

  return (
    <StudentsContext.Provider
      value={{
        students: data.students,
        graduates: data.graduates,
        loading,
        reload,
        addStudent,
        updateStudent,
        deleteStudent,
        bulkAssignSection,
        transferStudent,
      }}
    >
      {children}
    </StudentsContext.Provider>
  )
}
