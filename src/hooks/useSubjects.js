import { useContext } from 'react'
import { SubjectsContext } from '@/context/SubjectsContext'

export function useSubjects() {
  const ctx = useContext(SubjectsContext)
  if (!ctx) throw new Error('useSubjects waa in SubjectsProvider gudihiisa la isticmaalaa')
  return ctx
}
