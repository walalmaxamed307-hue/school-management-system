import { useContext } from 'react'
import { AuthContext } from '@/lib/auth'

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth waa in AuthProvider gudihiisa la isticmaalaa')
  return ctx
}
