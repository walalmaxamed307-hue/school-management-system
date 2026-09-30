import { createContext } from 'react'
import { api } from '@/lib/api'
import { useStaffResource } from '@/lib/useStaffResource'

// eslint-disable-next-line react-refresh/only-export-components
export const TeachersContext = createContext(null)

const EMPTY = []

async function loadTeachers() {
  const list = await api.get('/teachers')
  return list.map((t) => {
    const assignments = t.assignments || []
    return {
      id: t.id,
      name: t.name,
      email: t.email ?? '',
      phone: t.phone ?? '',
      // Homeroom (horjoogaha attendance-ka): hal fasal (+section)
      class: t.class,
      section: t.section ?? null,
      classId: t.classId ?? null,
      sectionId: t.sectionId ?? null,
      // Maadooyinka uu dhigo: [{ classId, sectionId, subjectId, class, section, subject }]
      assignments,
      subjects: [...new Set(assignments.map((a) => a.subject).filter(Boolean))],
    }
  })
}

// Macallimiinta waxay ka yimaadaan backend-ka. `form` = qiimaha TeacherForm:
// { name, email, phone, password?, homeroom: {classId, sectionId}|null,
//   assignments: [{classId, sectionId|null, subjectId}] }
export function TeachersProvider({ children }) {
  const { data: teachers, loading, reload, run } = useStaffResource(loadTeachers, EMPTY)

  async function addTeacher(form) {
    return run(() => api.post('/teachers', form))
  }

  async function updateTeacher(id, form) {
    return run(() => api.patch(`/teachers/${id}`, form))
  }

  // Macalinka waa la xidhaa (deactivate) — taariikhdiisa waa sii jirtaa.
  async function deleteTeacher(id) {
    return run(() => api.delete(`/teachers/${id}`))
  }

  return (
    <TeachersContext.Provider
      value={{ teachers, loading, reload, addTeacher, updateTeacher, deleteTeacher }}
    >
      {children}
    </TeachersContext.Provider>
  )
}
