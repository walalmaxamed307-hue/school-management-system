import { useContext } from 'react'
import { ClassesContext } from '@/context/ClassesContext'

export function useClasses() {
  const ctx = useContext(ClassesContext)
  if (!ctx) throw new Error('useClasses waa in ClassesProvider gudihiisa la isticmaalaa')
  return ctx
}
