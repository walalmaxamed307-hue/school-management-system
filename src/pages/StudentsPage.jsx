import { useEffect, useMemo, useState } from 'react'
import { Pencil, Trash2, Plus, Settings2, Printer, Shuffle } from 'lucide-react'
import { useStudents } from '@/hooks/useStudents'
import { useClasses } from '@/hooks/useClasses'
import { useTeachers } from '@/hooks/useTeachers'
import { useSchoolSettings } from '@/hooks/useSchoolSettings'
import { useSearch } from '@/hooks/useSearch'
import { useToast } from '@/hooks/useToast'
import { api } from '@/lib/api'
import { Button, Input, Table, Modal } from '@/components/ui'
import StudentForm from '@/features/students/StudentForm'
import ManageClassesModal from '@/features/students/ManageClassesModal'
import BulkAssignSectionModal from '@/features/students/BulkAssignSectionModal'
import PendingTransfersCard from '@/features/students/PendingTransfersCard'

const statusStyles = {
  active: 'bg-primary-50 text-primary-600',
  withdrawn: 'bg-canvas text-ink-muted',
  graduated: 'bg-warning-50 text-warning-500',
  transferred: 'bg-warning-50 text-warning-500',
}

function StudentsPage() {
  const { students, loading, reload: reloadStudents, addStudent, updateStudent, deleteStudent, bulkAssignSection, transferStudent } = useStudents()
  const { classes, addClass, removeClass, updateClass, enableSections, addSection, removeSection } = useClasses()
  const { reload: reloadTeachers } = useTeachers()

  // Backend-ku magaca fasalka ka soo qaadaa ID-ga (ma jiro string is-nakhsiya),
  // sidaas darteed marka la magac-bedelo kaliya xogta ardayda/macallimiinta ayaa
  // dib loo soo qaadaa si magaca cusub u muuqdo.
  async function handleRenameClass(oldName, newName) {
    const ok = await updateClass(oldName, newName)
    if (!ok) return
    reloadStudents()
    reloadTeachers()
  }
  const { settings } = useSchoolSettings()
  const { query: search, setQuery: setSearch } = useSearch()
  const { showToast } = useToast()
  const [classFilter, setClassFilter] = useState('all')
  const [sectionFilter, setSectionFilter] = useState('all')
  const [modalMode, setModalMode] = useState(null) // null | 'add' | 'edit'
  const [activeStudent, setActiveStudent] = useState(null)
  const [classesModalOpen, setClassesModalOpen] = useState(false)
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [schools, setSchools] = useState([])

  // Iskuullada kale (wareejinta) — kaliya marka foomka edit la furo.
  useEffect(() => {
    if (modalMode !== 'edit') return
    api
      .get('/schools-directory')
      .then((list) => setSchools(list.map((s) => ({ id: s._id, name: s.name }))))
      .catch(() => setSchools([]))
  }, [modalMode])

  const filterOptions = useMemo(() => ['all', ...classes.map((c) => c.name)], [classes])
  const selectedClassObj = classes.find((c) => c.name === classFilter)

  function handleClassFilterChange(name) {
    setClassFilter(name)
    setSectionFilter('all')
  }

  // Haddii fasalku hadda sections lahayn (la tiray), filter-kii section ee hore
  // waa la iska indha tirayaa — haddii kale ardayda oo dhan waa la qarin lahaa.
  const activeSectionFilter = selectedClassObj?.hasSections ? sectionFilter : 'all'

  const filtered = students.filter((s) => {
    if (s.status === 'graduated') return false // qaybta Graduates ayay ku jiraan kaliya
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase())
    const matchesClass = classFilter === 'all' || s.class === classFilter
    const matchesSection =
      activeSectionFilter === 'all' ||
      (activeSectionFilter === 'none' ? !s.section : s.section === activeSectionFilter)
    return matchesSearch && matchesClass && matchesSection
  })

  // Ardayda fasalka la doortay ee weli section lama qoondeynin — halkan
  // ayaa laga bilaabayaa bulk-split-ka.
  const unsectionedInSelectedClass =
    selectedClassObj?.hasSections
      ? students.filter(
          (s) => s.class === selectedClassObj.name && s.status !== 'graduated' && !s.section
        )
      : []

  function openAdd() {
    setActiveStudent(null)
    setModalMode('add')
  }

  function openEdit(student) {
    setActiveStudent(student)
    setModalMode('edit')
  }

  function closeModal() {
    setModalMode(null)
    setActiveStudent(null)
  }

  async function handleSubmit(data) {
    if (modalMode === 'edit') {
      const ok = await updateStudent(activeStudent.id, data)
      if (ok) closeModal()
    } else {
      const created = await addStudent(data)
      if (created) closeModal()
    }
  }

  // Wareejin: iskuul kale oo systemka ku jira -> waxay u baahan tahay in
  // admin-ka iskuulkaas ansixiyo (review), ma aha mid isla markiiba dhamaystirmaya.
  async function handleTransfer(school) {
    const target = school ? school.name : 'iskuul aan systemka ku jirin'
    if (!confirm(`Ma hubtaa inaad ${activeStudent.name} u wareejiso ${target}? Tan dib looma celin karo.`)) return
    const res = await transferStudent(activeStudent.id, school?.id)
    if (!res) return
    showToast(
      school
        ? `${activeStudent.name} waa la wareejiyay — sugaya in admin-ka ${school.name} ansixiyo.`
        : `${activeStudent.name} waxaa loo calaamadiyay Transferred (Other).`,
      'success'
    )
    closeModal()
  }

  function handleDelete(student) {
    if (confirm(`Ma hubtaa inaad tirtirto ${student.name}? Waxaa la tirtiri karaa kaliya haddii aanu wax taariikh ah lahayn.`)) {
      deleteStudent(student.id)
    }
  }

  return (
    <div>
      <PendingTransfersCard onAccepted={reloadStudents} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-medium text-ink">Students</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => setClassesModalOpen(true)}>
            <Settings2 size={16} />
            Maamul fasallada
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus size={16} />
            Ku dar arday
          </Button>
          <Button variant="secondary" size="sm" onClick={() => window.print()} className="no-print">
            <Printer size={16} />
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Raadi magaca ardayga..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <select
          value={classFilter}
          onChange={(e) => handleClassFilterChange(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500"
        >
          {filterOptions.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? 'Dhammaan fasallada' : c}
            </option>
          ))}
        </select>
        {selectedClassObj?.hasSections && (
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500"
          >
            <option value="all">Dhammaan sections</option>
            {selectedClassObj.sections.map((s) => (
              <option key={s} value={s}>
                Section {s}
              </option>
            ))}
            <option value="none">Section lama qoondeynin</option>
          </select>
        )}
      </div>

      {unsectionedInSelectedClass.length > 0 && (
        <div className="mb-4 flex flex-col gap-2 rounded-lg bg-warning-50 px-3 py-2 text-sm text-warning-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {unsectionedInSelectedClass.length} arday oo {selectedClassObj.name} ku jira weli
            section lama qoondeynin.
          </span>
          <Button size="sm" variant="secondary" onClick={() => setBulkModalOpen(true)}>
            <Shuffle size={14} />
            Qaybi sections
          </Button>
        </div>
      )}

      <p className="mb-3 text-xs text-ink-muted">
        Ardayda guud: <strong>{students.filter((s) => s.status === 'active').length}</strong>
        {classFilter !== 'all' && (
          <>
            {' '}
            · {classFilter}: <strong>{filtered.length}</strong>
          </>
        )}
      </p>

      <div className="print-area">
        <div className="hidden print:block">
          <p className="text-lg font-medium">{settings.name}</p>
          <p className="mb-2 text-sm text-ink-muted">
            Students — {classFilter === 'all' ? 'Dhammaan fasallada' : classFilter}
          </p>
        </div>
        <Table
        columns={[
          { key: 'studentCode', label: 'ID' },
          { key: 'name', label: 'Magaca' },
          { key: 'class', label: 'Fasalka' },
          {
            key: 'section',
            label: 'Section',
            render: (row) => row.section ?? '—',
          },
          { key: 'parentPhone', label: 'Telefoonka waalidka' },
          {
            key: 'status',
            label: 'Xaalad',
            render: (row) => (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[row.status]}`}
              >
                {row.status}
              </span>
            ),
          },
          {
            key: 'actions',
            label: '',
            render: (row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(row)}
                  className="text-ink-muted hover:text-primary-600"
                  aria-label="Wax ka beddel"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(row)}
                  className="text-ink-muted hover:text-danger-500"
                  aria-label="Tirtir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ),
          },
        ]}
        data={filtered}
        emptyMessage={loading ? 'Waa la soo rarayaa...' : 'Arday lama helin'}
      />
      </div>

      <Modal
        open={modalMode !== null}
        onClose={closeModal}
        title={modalMode === 'edit' ? 'Wax ka beddel ardayga' : 'Ku dar arday cusub'}
      >
        <StudentForm
          defaultValues={activeStudent}
          classes={classes}
          schools={schools}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          onTransfer={modalMode === 'edit' ? handleTransfer : undefined}
        />
      </Modal>

      <ManageClassesModal
        open={classesModalOpen}
        onClose={() => setClassesModalOpen(false)}
        classes={classes}
        onAdd={addClass}
        onRemove={removeClass}
        onRename={handleRenameClass}
        onEnableSections={enableSections}
        onAddSection={addSection}
        onRemoveSection={removeSection}
        unsectionedCounts={Object.fromEntries(
          classes
            .filter((c) => c.hasSections)
            .map((c) => [
              c.name,
              students.filter((s) => s.class === c.name && s.status !== 'graduated' && !s.section)
                .length,
            ])
        )}
      />

      {selectedClassObj?.hasSections && (
        <BulkAssignSectionModal
          open={bulkModalOpen}
          onClose={() => setBulkModalOpen(false)}
          className={selectedClassObj.name}
          sections={selectedClassObj.sectionItems}
          unsectionedStudents={unsectionedInSelectedClass}
          onAssign={async (ids, sectionId) => {
            const ok = await bulkAssignSection(ids, selectedClassObj.id, sectionId)
            if (ok) setBulkModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

export default StudentsPage
