import { useContext } from 'react'
import { RoomsContext } from '@/context/RoomsContext'

export function useRooms() {
  const ctx = useContext(RoomsContext)
  if (!ctx) throw new Error('useRooms waa in RoomsProvider gudihiisa la isticmaalaa')
  return ctx
}
