import { useContext } from 'react'
import { TeacherAttendanceContext } from '@/context/TeacherAttendanceContext'

export function useTeacherAttendance() {
  const ctx = useContext(TeacherAttendanceContext)
  if (!ctx)
    throw new Error('useTeacherAttendance waa in TeacherAttendanceProvider gudihiisa la isticmaalaa')
  return ctx
}
