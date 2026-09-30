import { useContext } from 'react'
import { ExamResultsContext } from '@/context/ExamResultsContext'

export function useExamResults() {
  const ctx = useContext(ExamResultsContext)
  if (!ctx)
    throw new Error('useExamResults waa in ExamResultsProvider gudihiisa la isticmaalaa')
  return ctx
}
