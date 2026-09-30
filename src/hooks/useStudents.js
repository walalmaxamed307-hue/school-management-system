import { useContext } from 'react'
import { StudentsContext } from '@/context/StudentsContext'

export function useStudents() {
  const ctx = useContext(StudentsContext)
  if (!ctx) throw new Error('useStudents waa in StudentsProvider gudihiisa la isticmaalaa')
  return ctx
}
