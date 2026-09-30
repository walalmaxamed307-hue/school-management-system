import { useContext } from 'react'
import { AnnouncementsContext } from '@/context/AnnouncementsContext'

export function useAnnouncements() {
  const ctx = useContext(AnnouncementsContext)
  if (!ctx)
    throw new Error('useAnnouncements waa in AnnouncementsProvider gudihiisa la isticmaalaa')
  return ctx
}
