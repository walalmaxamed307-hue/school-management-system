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

  // name + isFinal (+ parts haddii loo baahdo) — waxaa la abuuraa sanadka HADDA socda kaliya (backend-ku
  // sidaas ayuu qabtaa); admin ayaa kaliya samayn kara.
  async function createExam(name, isFinal, hasParts = false, partOneMaxMark, partTwoMaxMark) {
    try {
      await api.post('/exams', {
        name: name.trim(),
        isFinal,
        order: exams.length,
        hasParts,
        ...(hasParts ? { partOneMaxMark: Number(partOneMaxMark), partTwoMaxMark: Number(partTwoMaxMark) } : {}),
      })
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
    async (examId, classId, sectionId, part) => {
      if (!examId || !classId) {
        setResults(null)
        setCurrent(null)
        return
      }
      setCurrent({ examId, classId, sectionId, part: part || null })
      setResultsLoading(true)
      try {
        setResults(await api.get(`/exams/${examId}/results`, { classId, sectionId: sectionId || undefined, part: part || undefined }))
      } catch (err) {
        showToast(err.message, 'error')
        setResults(null)
      } finally {
        setResultsLoading(false)
      }
    },
    [showToast]
  )

  // Dhibcaha imtixaanka waa xog rasmi ah: request keliya ayaa loo diraa
  // marka cell-ku dhamaado (page-ku sidaas ayuu u wacaa), waxaana backend-ka
  // loo diraa version-kii uu macalinku arkay. Sidaas request duug ahi uma
  // dabooli karo dhibcaha cusub marka shabakadu kala hormarto.
  async function setMark(enrollmentId, subjectId, mark, expectedVersion) {
    if (!current) return false
    try {
      const saved = await api.put(`/exams/${current.examId}/results`, {
        enrollmentId,
        subjectId,
        mark,
        part: current.part,
        expectedVersion,
      })
      setResults((prev) =>
        prev
          ? {
              ...prev,
              rows: prev.rows.map((r) =>
                r.enrollmentId === enrollmentId
                  ? {
                      ...r,
                      marks: mark === null
                        ? Object.fromEntries(Object.entries(r.marks).filter(([id]) => id !== String(subjectId)))
                        : { ...r.marks, [subjectId]: mark },
                      markVersions: { ...r.markVersions, [subjectId]: saved.markVersion },
                    }
                  : r
              ),
            }
          : prev
      )
      return true
    } catch (err) {
      showToast(err.message, 'error')
      // 409 = qof ama request kale ayaa wax ka beddelay cell-kan. Dib ayaan
      // uga soo qaadnaa qiimaha database-ka halkii aan ku sii hayn lahayn
      // draft aan la kaydin.
      if (err.status === 409) {
        await loadResults(current.examId, current.classId, current.sectionId, current.part)
      }
      return false
    }
  }

  async function publishClass() {
    if (!current) return false
    try {
      await api.post(`/exams/${current.examId}/publish`, {
        classId: current.classId,
        sectionId: current.sectionId,
        part: current.part,
      })
      await loadResults(current.examId, current.classId, current.sectionId, current.part)
      return true
    } catch (err) {
      showToast(err.message, 'error')
      return false
    }
  }

  async function editPublishedClass() {
    if (!current) return false
    try {
      await api.post(`/exams/${current.examId}/unpublish`, {
        classId: current.classId,
        sectionId: current.sectionId,
      })
      await loadResults(current.examId, current.classId, current.sectionId, current.part)
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
        editPublishedClass,
      }}
    >
      {children}
    </ExamResultsContext.Provider>
  )
}
