import { useContext } from 'react'
import { SchoolSettingsContext } from '@/context/SchoolSettingsContext'

export function useSchoolSettings() {
  const ctx = useContext(SchoolSettingsContext)
  if (!ctx)
    throw new Error('useSchoolSettings waa in SchoolSettingsProvider gudihiisa la isticmaalaa')
  return ctx
}
