import { useContext } from 'react'
import { TeachersContext } from '@/context/TeachersContext'

export function useTeachers() {
  const ctx = useContext(TeachersContext)
  if (!ctx) throw new Error('useTeachers waa in TeachersProvider gudihiisa la isticmaalaa')
  return ctx
}
