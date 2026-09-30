import { useContext } from 'react'
import { FeesContext } from '@/context/FeesContext'

export function useFees() {
  const ctx = useContext(FeesContext)
  if (!ctx) throw new Error('useFees waa in FeesProvider gudihiisa la isticmaalaa')
  return ctx
}
