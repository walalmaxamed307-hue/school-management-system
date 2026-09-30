import { useContext } from 'react'
import { AttendanceContext } from '@/context/AttendanceContext'

export function useAttendance() {
  const ctx = useContext(AttendanceContext)
  if (!ctx) throw new Error('useAttendance waa in AttendanceProvider gudihiisa la isticmaalaa')
  return ctx
}
