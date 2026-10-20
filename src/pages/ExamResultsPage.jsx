import { useEffect, useState } from 'react'
import { Plus, Trash2, CheckCircle2, Printer, Info } from 'lucide-react'
import { useClasses } from '@/hooks/useClasses'
import { useSubjects } from '@/hooks/useSubjects'
import { useExamResults } from '@/hooks/useExamResults'
import { useAuth } from '@/hooks/useAuth'
import { useSchoolSettings } from '@/hooks/useSchoolSettings'
import { useSearch } from '@/hooks/useSearch'
import StudentInfoModal from '@/components/StudentInfoModal'
import { Card, Button, Input, Modal } from '@/components/ui'

function selectClass() {
  return 'rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500'
}

function ExamResultsPage() {
  const { classes } = useClasses()
  const { subjectItems } = useSubjects()
  const {
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
  } = useExamResults()
  const { settings, academicYears } = useSchoolSettings()
  const { query } = useSearch()
  const { user } = useAuth()
  const isTeacher = user?.role === 'teacher'

  // Macalinku maadooyinka uu la xiriira (fasal+section+subject gaar ah)
  // ayuu kaliya wax ka beddeli karaa — backend-ku sidoo kale wuu xaqiijiyaa,
  // halkan waa kaliya UI-ga si loo joojiyo isku-dayga aan micnaha lahayn.
  function canEditSubject(classId, sectionId, subjectId) {
    if (!isTeacher) return true
    return (user.assignments ?? []).some(
      (a) =>
        String(a.classId) === String(classId) &&
        String(a.subjectId) === String(subjectId) &&
        (!a.sectionId || String(a.sectionId) === String(sectionId ?? ''))
    )
  }

  // Macalinku kaliya wuxuu arki karaa fasallada uu dhab ahaan la xiriiro:
  // horjoogahiisa (homeroom) AMA fasal uu maado ku dhigo — isla xeerka
  // backend-ku (canViewResults) ku dabaqo. Admin-ku wuxuu arkaa dhammaan.
  const teacherClassNames = isTeacher
    ? [...new Set([...(user.class ? [user.class] : []), ...(user.assignments ?? []).map((a) => a.class)])]
    : null
  const visibleClasses = isTeacher ? classes.filter((c) => teacherClassNames.includes(c.name)) : classes

  // Section-yada macalinku la xiriiro fasalkan gudihiisa (homeroom section-kiisa
  // + section-yada uu maado ku dhigo; assignment sectionId=null macnaheedu waa
  // "dhammaan sections-ka fasalkan").
  function allowedSectionNames(className) {
    if (!isTeacher) return null // null = dhammaan (admin)
    const names = new Set()
    if (user.class === className && user.section) names.add(user.section)
    for (const a of user.assignments ?? []) {
      if (a.class !== className) continue
      if (!a.sectionId) return null // dhammaan sections-ka fasalkan
      if (a.section) names.add(a.section)
    }
    return names
  }

  const sortedYears = [...academicYears].sort((a, b) => b.startYear - a.startYear)
  const [yearId, setYearId] = useState(settings.academicYearId ?? '')
  const selectedYear = sortedYears.find((y) => y._id === yearId)
  const isCurrentYear = selectedYear?.status === 'active'

  const [selectedClass, setSelectedClass] = useState(
    isTeacher && user.class ? user.class : (classes[0]?.name ?? '')
  )
  const selectedClassObj = classes.find((c) => c.name === selectedClass)
  const [selectedSection, setSelectedSection] = useState(
    isTeacher && user.section ? user.section : ''
  )
  const selectedSectionId = selectedClassObj?.sectionItems.find((s) => s.name === selectedSection)?.id ?? null
  const [examId, setExamId] = useState('')
  const [infoStudent, setInfoStudent] = useState(null)
  const [unlocked, setUnlocked] = useState(false)
  const [addTermOpen, setAddTermOpen] = useState(false)
  const [newTermName, setNewTermName] = useState('')
  const [newTermFinal, setNewTermFinal] = useState(false)
  const [newTermHasParts, setNewTermHasParts] = useState(false)
  const [newTermPartOneMax, setNewTermPartOneMax] = useState('')
  const [newTermPartTwoMax, setNewTermPartTwoMax] = useState('')
  const [savingTerm, setSavingTerm] = useState(false)
  const [selectedPart, setSelectedPart] = useState('1')

  // Ka hor fasallada in ay ka soo daahaan (async), dib ugu celi fasalka
  // koowaad haddii kii la doortay uusan (weli) jirin — isla saxitaanka
  // Attendance/Fees pages.
  useEffect(() => {
    if (visibleClasses.length === 0) {
      if (selectedClass) setSelectedClass('')
      return
    }
    if (!visibleClasses.some((c) => c.name === selectedClass)) {
      setSelectedClass(visibleClasses[0].name)
      setSelectedSection('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleClasses.map((c) => c.name).join(',')])

  useEffect(() => {
    if (!yearId && sortedYears.length > 0) setYearId(sortedYears[0]._id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [academicYears])

  useEffect(() => {
    loadExams(yearId)
    setExamId('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearId])

  useEffect(() => {
    if (exams.length > 0 && !exams.some((e) => e._id === examId)) setExamId(exams[0]._id)
    if (exams.length === 0) setExamId('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exams])

  useEffect(() => {
    setSelectedPart('1')
  }, [examId])

  const sectionOk = !selectedClassObj?.hasSections || !!selectedSection
  useEffect(() => {
    if (examId && selectedClassObj && sectionOk) {
      loadResults(examId, selectedClassObj.id, selectedSectionId, selectedPart)
      setUnlocked(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, selectedClassObj?.id, selectedSectionId, sectionOk, selectedPart])

  async function handleAddTerm(e) {
    e.preventDefault()
    if (!newTermName.trim()) return
    setSavingTerm(true)
    const ok = await createExam(newTermName, newTermFinal, newTermHasParts, newTermPartOneMax, newTermPartTwoMax)
    setSavingTerm(false)
    if (ok) {
      setNewTermName('')
      setNewTermFinal(false)
      setNewTermHasParts(false)
      setNewTermPartOneMax('')
      setNewTermPartTwoMax('')
      setAddTermOpen(false)
    }
  }

  async function handleDeleteTerm() {
    const exam = exams.find((e) => e._id === examId)
    if (!exam) return
    if (
      !confirm(
        `Ma hubtaa inaad tirtirto "${exam.name}"? Dhammaan dhibcaha iyo qaybinta qolalka (room-split) ee term-kan ayaa la tirtiri doonaa. Tan dib looma celin karo.`
      )
    )
      return
    await deleteExam(examId)
  }

  async function handlePublish() {
    const ok = await publishClass()
    if (ok) setUnlocked(false)
  }

  const rows = (results?.rows ?? []).filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
  const maxMark = results?.exam?.inputMaxMark ?? results?.exam?.examMaxMark ?? settings.examMaxMark
  const isFinal = results?.exam?.isFinal ?? false
  const hasParts = results?.exam?.hasParts ?? false
  const allPublished = results?.allPublished ?? false
  const partOnePublished = results?.partOnePublished ?? false
  const canManageResults = (results?.canPublish ?? false) && isCurrentYear
  const canPublish = canManageResults
  const activePartPublished = hasParts && selectedPart === '1' ? partOnePublished : allPublished
  const showCombinedPartResults = hasParts && selectedPart === '2' && allPublished && !unlocked

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-medium text-ink">Exam results</h1>
        <div className="flex flex-wrap gap-2">
          <select value={yearId} onChange={(e) => setYearId(e.target.value)} className={selectClass()}>
            {sortedYears.map((y) => (
              <option key={y._id} value={y._id}>
                {y.label}
              </option>
            ))}
          </select>
          <select
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            disabled={exams.length === 0}
            className={selectClass()}
          >
            {exams.length === 0 && <option value="">Wali term lama darin</option>}
            {exams.map((e) => (
              <option key={e._id} value={e._id}>
                {e.name}{e.hasParts ? ' (Parts)' : ''}
              </option>
            ))}
          </select>
          {!isTeacher && examId && (
            <button
              type="button"
              onClick={handleDeleteTerm}
              className="no-print flex items-center justify-center rounded-lg border border-border px-2.5 text-ink-muted hover:border-danger-500 hover:text-danger-500"
              aria-label="Tirtir term-kan"
              title="Tirtir term-kan"
            >
              <Trash2 size={16} />
            </button>
          )}
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value)
              setSelectedSection('')
            }}
            disabled={visibleClasses.length === 0}
            className={`${selectClass()} disabled:opacity-60`}
          >
            {visibleClasses.length === 0 && <option value="">Fasal kaaga ma jiro</option>}
            {visibleClasses.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          {selectedClassObj?.hasSections && (
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className={`${selectClass()} disabled:opacity-60`}
            >
              <option value="">-- Dooro section --</option>
              {selectedClassObj.sections
                .filter((s) => {
                  const allowed = allowedSectionNames(selectedClass)
                  return allowed === null || allowed.has(s)
                })
                .map((s) => (
                  <option key={s} value={s}>
                    Section {s}
                  </option>
                ))}
            </select>
          )}
          {!isTeacher && (
            <Button variant="secondary" size="md" onClick={() => setAddTermOpen(true)} className="no-print">
              <Plus size={16} />
              Term
            </Button>
          )}
          <Button variant="secondary" size="md" onClick={() => window.print()} className="no-print">
            <Printer size={16} />
          </Button>
        </div>
      </div>

      {!isCurrentYear && selectedYear && (
        <p className="mb-4 rounded-lg bg-canvas px-3 py-2 text-xs text-ink-muted">
          Waxaad eegaysaa sanad hore ({selectedYear.label}) — akhris-kaliya, wax lama beddeli karo.
        </p>
      )}

      <p className="mb-4 text-xs text-ink-muted">
        Ugu badnaan dhibcaha maado kasta{hasParts ? ` ee Part ${selectedPart}` : ''}: <strong>{maxMark}</strong>
        {isTeacher && ' (admin-ka ayaa dejiya, akhris-kaliya)'}
      </p>

      {hasParts && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-3">
          <span className="mr-1 text-sm font-medium text-ink">Qaybta:</span>
          <button type="button" onClick={() => setSelectedPart('1')} className={`rounded-lg px-3 py-2 text-sm font-medium ${selectedPart === '1' ? 'bg-primary-500 text-white' : 'bg-canvas text-ink-muted'}`}>
            Part 1 · {results?.exam?.partOneMaxMark} dhibcood
          </button>
          <button type="button" onClick={() => setSelectedPart('2')} className={`rounded-lg px-3 py-2 text-sm font-medium ${selectedPart === '2' ? 'bg-primary-500 text-white' : 'bg-canvas text-ink-muted'}`}>
            Part 2 · {results?.exam?.partTwoMaxMark} dhibcood
          </button>
          <span className="text-xs text-ink-muted">Part 2 publish-keeda ayaa isku daraya labada qaybood.</span>
        </div>
      )}

      {isTeacher && visibleClasses.length === 0 ? (
        <p className="rounded-lg bg-canvas px-3 py-6 text-center text-sm text-ink-muted">
          Wali ma lihid fasal aad horjoogaha u tahay ama maado aad ku dhigto — la xiriir admin-ka.
        </p>
      ) : exams.length === 0 ? (
        <p className="rounded-lg bg-canvas px-3 py-6 text-center text-sm text-ink-muted">
          {isTeacher
            ? 'Admin-ka weli wax term (exam) ah kuma darin sanadkan.'
            : 'Marka hore ku dar term (tusaale: Term 1) badhanka "Term" ee kore.'}
        </p>
      ) : !sectionOk ? (
        <p className="rounded-lg bg-canvas px-3 py-6 text-center text-sm text-ink-muted">
          Fasalkan sections buu leeyahay — dooro section marka hore.
        </p>
      ) : (
        <>
          {/* Table hal ah dhammaan cabbirrada: arday = hal saf (row), maadooyinkiisu saf-ka ku daba socdaan. Telefoonka: farta way yartahay, horizontal scroll */}
          <Card className="print-area overflow-x-auto p-0">
            <div className="hidden p-4 print:block">
              <p className="text-sm text-ink-muted">{results?.exam?.name}</p>
            </div>
            <table className="w-full min-w-max text-xs md:text-sm">
              <thead>
                <tr className="border-b border-border bg-canvas text-left">
                  <th className="sticky left-0 z-10 bg-canvas px-2 py-2 font-medium md:px-4 md:py-3 text-ink-muted">
                    Magaca
                  </th>
                  {subjectItems.map((subj) => (
                    <th key={subj.id} className="whitespace-nowrap px-2 py-2 font-medium md:px-4 md:py-3 text-ink-muted">
                      {subj.name}{showCombinedPartResults ? ' (P1+P2)' : ''}
                    </th>
                  ))}
                  <th className="whitespace-nowrap px-2 py-2 font-medium md:px-4 md:py-3 text-ink-muted">{showCombinedPartResults ? 'Total (P1+P2)' : hasParts ? `Part ${selectedPart} total` : 'Total'}</th>
                  <th className="whitespace-nowrap px-2 py-2 font-medium md:px-4 md:py-3 text-ink-muted">Kaalinta</th>
                  {isFinal && (!hasParts || selectedPart === '2') && <th className="whitespace-nowrap px-2 py-2 font-medium md:px-4 md:py-3 text-ink-muted">Xaalad</th>}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={subjectItems.length + (isFinal && (!hasParts || selectedPart === '2') ? 4 : 3)} className="px-4 py-8 text-center text-ink-muted">
                      {resultsLoading ? 'Waa la soo rarayaa...' : 'Fasalkan arday kuma jiro'}
                    </td>
                  </tr>
                )}
                {rows.map((row) => (
                  <tr key={row.enrollmentId} className="border-b border-border last:border-0">
                    <td className="sticky left-0 z-10 whitespace-nowrap bg-surface px-2 py-1.5 text-ink md:px-4 md:py-2">
                      <span className="flex items-center gap-1.5">
                        {row.name}
                        <button
                          onClick={() => setInfoStudent(row.studentId)}
                          className="no-print text-ink-muted hover:text-primary-600"
                          aria-label="Xogta ardayga"
                        >
                          <Info size={14} />
                        </button>
                      </span>
                    </td>
                    {subjectItems.map((subj) => (
                      <td key={subj.id} className="px-1 py-1.5 md:px-2 md:py-2">
                        {showCombinedPartResults ? (
                          <span className="inline-flex min-w-12 justify-center rounded-md bg-primary-50 px-2 py-1 font-medium text-primary-700 md:min-w-16">
                            {row.combinedMarks?.[subj.id] ?? 0}
                          </span>
                        ) : (
                          <input
                            type="number"
                            min="0"
                            max={maxMark}
                            disabled={
                              !canEditSubject(selectedClassObj.id, selectedSectionId, subj.id) ||
                              !isCurrentYear ||
                              (row.published && !unlocked && (!hasParts || (selectedPart === '1' ? row.publishedPart >= 1 : row.publishedPart >= 2)))
                            }
                            value={row.marks[subj.id] ?? ''}
                            onChange={(e) => {
                              const clamped = Math.max(0, Math.min(Number(e.target.value), maxMark))
                              setMark(row.enrollmentId, subj.id, clamped)
                            }}
                            className="w-12 rounded-md border border-border px-1 py-1 text-xs outline-none focus:border-primary-500 disabled:opacity-50 md:w-16 md:px-2 md:text-sm"
                          />
                        )}
                      </td>
                    ))}
                    <td className="px-2 py-1.5 font-medium text-ink md:px-4 md:py-2">{showCombinedPartResults ? row.combinedTotal : row.total}</td>
                    <td className="px-2 py-1.5 text-ink md:px-4 md:py-2">#{showCombinedPartResults ? row.combinedRank : row.rank}</td>
                    {isFinal && (!hasParts || selectedPart === '2') && (
                      <td className="px-2 py-1.5 md:px-4 md:py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          (showCombinedPartResults ? row.combinedTotal : row.total) >= settings.passMark ? 'bg-primary-50 text-primary-600' : 'bg-danger-50 text-danger-500'
                          }`}
                        >
                          {(showCombinedPartResults ? row.combinedTotal : row.total) >= settings.passMark ? 'Gudbay' : 'Dhacay'}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

        </>
      )}

      {exams.length > 0 && sectionOk && (
        <div className="mt-4 flex flex-col gap-3 no-print sm:flex-row sm:items-center sm:justify-between">
          {activePartPublished ? (
            <span className="flex items-center gap-1 text-sm font-medium text-primary-600">
              <CheckCircle2 size={16} /> {hasParts && selectedPart === '1' ? 'Part 1 waa la published — ardaydu way arki karaan' : 'waa la published'}
              {unlocked && ' — hadda editable, republish marka aad dhammaysato'}
            </span>
          ) : (
            <span className="text-sm text-ink-muted">
              {hasParts && selectedPart === '1'
                ? 'Marka macalimiinta dhammaystiraan Part 1, fasalka horjoogaha ayaa publish gareeya si ardaydu u arkaan.'
                : 'Marka macalimiinta dhammaystiraan maadooyinka, fasalka horjoogaha ayaa publish gareeya'}
            </span>
          )}
          {activePartPublished && !unlocked ? (
            <Button variant="secondary" onClick={() => setUnlocked(true)} disabled={!canPublish} className="w-full sm:w-auto">
              {hasParts && selectedPart === '1' ? 'Edit Part 1' : 'Edit'}
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={rows.length === 0 || !canPublish} className="w-full sm:w-auto">
              {activePartPublished ? `Republish${hasParts ? ` Part ${selectedPart}` : ''}` : `Publish${hasParts ? ` Part ${selectedPart}` : ''}`}
            </Button>
          )}
        </div>
      )}

      {isTeacher && exams.length > 0 && sectionOk && !canManageResults && isCurrentYear && (
        <p className="mt-2 text-xs text-ink-muted">
          Fasalka horjoogihiisu kaliya ayaa publish gareyn kara fasalkan.
        </p>
      )}

      <p className="mt-3 text-xs text-ink-muted">
        Ardaydu waxay natiijadooda ka arki karaan bogga Login-ka, tab-ka <strong>&ldquo;Arday&rdquo;</strong>,
        iyagoo geliya Student ID-gooda + taariikhda dhalashada.
      </p>

      <Modal open={addTermOpen} onClose={() => setAddTermOpen(false)} title="Ku dar term/exam cusub">
        <form onSubmit={handleAddTerm} className="flex flex-col gap-4">
          <Input
            label="Magaca (tusaale: Term 1, Final Exam)"
            value={newTermName}
            onChange={(e) => setNewTermName(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={newTermFinal} onChange={(e) => setNewTermFinal(e.target.checked)} />
            Kani waa Final Exam-ka (kaliya mid ayaa sanad kasta la yeelan karaa)
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={newTermHasParts} onChange={(e) => setNewTermHasParts(e.target.checked)} />
            Imtixaankani ma leeyahay Part 1 iyo Part 2?
          </label>
          {newTermHasParts && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Part 1 — dhibcaha ugu badan" type="number" min="1" value={newTermPartOneMax} onChange={(e) => setNewTermPartOneMax(e.target.value)} />
              <Input label="Part 2 — dhibcaha ugu badan" type="number" min="1" value={newTermPartTwoMax} onChange={(e) => setNewTermPartTwoMax(e.target.value)} />
              <p className="text-xs leading-5 text-ink-muted sm:col-span-2">Marka Part 2 la publish-gareeyo, dhibcaha labada qayb ayaa maado kasta la isu darayaa.</p>
            </div>
          )}
          <Button type="submit" disabled={!newTermName.trim() || savingTerm || (newTermHasParts && (!Number(newTermPartOneMax) || !Number(newTermPartTwoMax)))}>
            {savingTerm ? 'Waa la keydinayaa...' : 'Ku dar'}
          </Button>
        </form>
      </Modal>

      <StudentInfoModal studentId={infoStudent} onClose={() => setInfoStudent(null)} />
    </div>
  )
}

export default ExamResultsPage
