import { useContext } from 'react'
import { SearchContext } from '@/context/SearchContext'

export function useSearch() {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearch waa in SearchProvider gudihiisa la isticmaalaa')
  return ctx
}
