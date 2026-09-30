import { createContext, useCallback, useState } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/useToast'

// eslint-disable-next-line react-refresh/only-export-components
export const ExamResultsContext = createContext(null)

// `exams`: dhammaan exam-yada ("terms") ee sanadka la doortay.
// `results`: xogta fasal+section+exam la doortay ugu dambeeyay — hal wac
// (loadResults) ayaa go'aaminaya midda hadda socota, isla habka Attendance/Fees.
export function ExamResultsProvider({ children }) {
  const [exams, setExams] = useState([])
  const [examsLoading, setExamsLoading] = useState(false)
  const [examsYearId, setExamsYearId] = useState(null)
  const [results, setResults] = useState(null) // { exam, isCurrentYear, allPublished, canPublish, rows }
  const [resultsLoading, setResultsLoading] = useState(false)
  const [current, setCurrent] = useState(null) // { examId, classId, sectionId }
  const { showToast } = useToast()

  const loadExams = useCallback(
    async (academicYearId) => {
      setExamsYearId(academicYearId)
      if (!academicYearId) {
        setExams([])
        return
      }
      setExamsLoading(true)
      try {
        setExams(await api.get('/exams', { academicYearId }))
      } catch (err) {
        showToast(err.message, 'error')
        setExams([])
      } finally {
        setExamsLoading(false)
      }
    },
    [showToast]
  )

  // name + isFinal — waxaa la abuuraa sanadka HADDA socda kaliya (backend-ku
  // sidaas ayuu qabtaa); admin ayaa kaliya samayn kara.
  async function createExam(name, isFinal) {
    try {
      await api.post('/exams', { name: name.trim(), isFinal, order: exams.length })
      await loadExams(examsYearId)
      return true
    } catch (err) {
      showToast(err.message, 'error')
      return false
    }
  }

  async function deleteExam(examId) {
    try {
      await api.delete(`/exams/${examId}`)
      await loadExams(examsYearId)
      return true
    } catch (err) {
      showToast(err.message, 'error')
      return false
    }
  }

  const loadResults = useCallback(
    async (examId, classId, sectionId) => {
      if (!examId || !classId) {
        setResults(null)
        setCurrent(null)
        return
      }
      setCurrent({ examId, classId, sectionId })
      setResultsLoading(true)
      try {
        setResults(await api.get(`/exams/${examId}/results`, { classId, sectionId: sectionId || undefined }))
      } catch (err) {
        showToast(err.message, 'error')
        setResults(null)
      } finally {
        setResultsLoading(false)
      }
    },
    [showToast]
  )

  // Isbeddel ku dhaqma (optimistic) — haddii backend-ku diido (tusaale
  // macalinku maadadan uma qorayo, ama natiijadu horeyba waa published),
  // dib ayaa loo soo qaadayaa xaqiiqada oo khaladka waa la muujiyaa.
  async function setMark(enrollmentId, subjectId, mark) {
    if (!current) return
    setResults((prev) =>
      prev
        ? {
            ...prev,
            rows: prev.rows.map((r) =>
              r.enrollmentId === enrollmentId ? { ...r, marks: { ...r.marks, [subjectId]: mark } } : r
            ),
          }
        : prev
    )
    try {
      await api.put(`/exams/${current.examId}/results`, { enrollmentId, subjectId, mark })
    } catch (err) {
      showToast(err.message, 'error')
      loadResults(current.examId, current.classId, current.sectionId)
    }
  }

  async function publishClass() {
    if (!current) return false
    try {
      await api.post(`/exams/${current.examId}/publish`, {
        classId: current.classId,
        sectionId: current.sectionId,
      })
      await loadResults(current.examId, current.classId, current.sectionId)
      return true
    } catch (err) {
      showToast(err.message, 'error')
      return false
    }
  }

  return (
    <ExamResultsContext.Provider
      value={{
        exams,
        examsLoading,
        loadExams,
        createExam,
        deleteExam,
        results,
        resultsLoading,
        loadResults,
        setMark,
        publishClass,
      }}
    >
      {children}
    </ExamResultsContext.Provider>
  )
}
