import { useEffect, useState } from 'react'
import { Pencil, Printer, Info } from 'lucide-react'
import { useClasses } from '@/hooks/useClasses'
import { useFees } from '@/hooks/useFees'
import { useSchoolSettings } from '@/hooks/useSchoolSettings'
import { useSearch } from '@/hooks/useSearch'
import StudentInfoModal from '@/components/StudentInfoModal'
import { Card, Table, Button, Modal, Input } from '@/components/ui'

function thisMonth() {
  return new Date().toISOString().slice(0, 7)
}

const statusStyle = {
  paid: 'bg-primary-50 text-primary-600',
  partial: 'bg-warning-50 text-warning-500',
  unpaid: 'bg-danger-50 text-danger-500',
}

const statusLabel = { paid: 'Paid', partial: 'Partial', unpaid: 'Unpaid' }

function FeesPage() {
  const { classes } = useClasses()
  const { rows, loading, loadFees, payFee, standardAmount } = useFees()
  const { settings } = useSchoolSettings()
  const { query } = useSearch()
  const [month, setMonth] = useState(thisMonth())
  const [selectedClass, setSelectedClass] = useState(classes[0]?.name ?? '')
  const selectedClassObj = classes.find((c) => c.name === selectedClass)
  const [selectedSection, setSelectedSection] = useState('')
  const selectedSectionId = selectedClassObj?.sectionItems.find((s) => s.name === selectedSection)?.id ?? null
  const [editingStudent, setEditingStudent] = useState(null)
  const [amountPaid, setAmountPaid] = useState('')
  const [payError, setPayError] = useState('')
  const [saving, setSaving] = useState(false)
  const [infoStudent, setInfoStudent] = useState(null)

  const sectionOk = !selectedClassObj?.hasSections || !!selectedSection

  // Isla saxitaanka AttendancePage: fasallada backend-ka way ka soo
  // daahaan (async), sidaas darteed marka ay yimaadaan waa in
  // selectedClass la hubiyaa weli inuu jiro — haddii kale dib loogu
  // celiyo fasalka koowaad, si aan loo baahan in tab la ka baxo/laga
  // soo noqdo si "arday kuma jiro" loo saxo.
  useEffect(() => {
    if (classes.length === 0) return
    if (!classes.some((c) => c.name === selectedClass)) {
      setSelectedClass(classes[0].name)
      setSelectedSection('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes])

  useEffect(() => {
    if (selectedClassObj && sectionOk) {
      loadFees(selectedClassObj.id, selectedSectionId, month)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassObj?.id, selectedSectionId, month, sectionOk])

  function openEdit(row) {
    setAmountPaid(row.amountPaid ?? 0)
    setPayError('')
    setEditingStudent(row)
  }

  async function handleSave() {
    const paid = Number(amountPaid)
    if (Number.isNaN(paid) || paid < 0) {
      setPayError('Fadlan geli tiro sax ah')
      return
    }
    if (paid > editingStudent.amountDue) {
      setPayError(`Intii la bixiyay ma dhaafi karto qiimaha guud ($${editingStudent.amountDue})`)
      return
    }
    setSaving(true)
    const ok = await payFee(editingStudent.enrollmentId, paid)
    setSaving(false)
    if (ok) setEditingStudent(null)
  }

  const filteredRows = rows
    .filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
    // Kuwa lacagta lagu leeyahay (unpaid/partial) horta — kuwii horeyba
    // bixiyay gadaal geeyay, sida la rabay.
    .sort((a, b) => {
      const rank = { unpaid: 0, partial: 1, paid: 2 }
      return rank[a.status] - rank[b.status]
    })

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-medium text-ink">Fees</h1>
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value)
              setSelectedSection('')
            }}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500"
          >
            {classes.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          {selectedClassObj?.hasSections && (
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500"
            >
              <option value="">-- Dooro section --</option>
              {selectedClassObj.sections.map((s) => (
                <option key={s} value={s}>
                  Section {s}
                </option>
              ))}
            </select>
          )}
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500"
          />
          <Button variant="secondary" onClick={() => window.print()} className="no-print">
            <Printer size={16} />
            Print dhammaan
          </Button>
        </div>
      </div>

      <Card className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-ink">Qiimaha caadiga ah (standard)</p>
          <p className="text-xs text-ink-muted">
            Arday kasta oo cusub si toos ah ayuu u helayaa qiimahan — beddel Settings-ka
          </p>
        </div>
        <span className="text-sm font-medium text-ink">${standardAmount}</span>
      </Card>

      <p className="mb-3 text-xs text-ink-muted">
        {selectedClass}
        {selectedClassObj?.hasSections && selectedSection ? ` – Section ${selectedSection}` : ''}:{' '}
        <strong>{filteredRows.length}</strong> arday
      </p>

      {!sectionOk ? (
        <p className="rounded-lg bg-canvas px-3 py-6 text-center text-sm text-ink-muted">
          Fasalkan sections buu leeyahay — dooro section marka hore.
        </p>
      ) : (
      <Card className="print-area p-0">
        <div className="hidden p-4 print:block">
          <p className="text-lg font-medium">{settings.name}</p>
          <p className="text-sm text-ink-muted">Fees — {selectedClass} — {month}</p>
        </div>
        <Table
          columns={[
            {
              key: 'name',
              label: 'Magaca',
              render: (row) => (
                <span className="flex items-center gap-1.5">
                  {row.name}
                  <button
                    onClick={() => setInfoStudent(row.studentId)}
                    className="text-ink-muted hover:text-primary-600"
                    aria-label="Xogta ardayga"
                  >
                    <Info size={14} />
                  </button>
                </span>
              ),
            },
            {
              key: 'amount',
              label: 'Qiimaha',
              render: (row) =>
                row.feeCategory === 'free' ? (
                  <span className="text-xs font-medium text-primary-600">Free</span>
                ) : (
                  <span>
                    ${row.amountPaid}/${row.amountDue}
                    {row.feeCategory === 'discount' && (
                      <span className="ml-1 text-xs text-ink-muted">(discount)</span>
                    )}
                  </span>
                ),
            },
            {
              key: 'status',
              label: 'Xaalad',
              render: (row) => (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[row.status]}`}
                >
                  {statusLabel[row.status]}
                </span>
              ),
            },
            {
              key: 'paidDate',
              label: 'Taariikhda bixinta',
              render: (row) => (row.paidDate ? String(row.paidDate).slice(0, 10) : '—'),
            },
            {
              key: 'actions',
              label: '',
              sortable: false,
              render: (row) =>
                row.feeCategory === 'free' ? null : (
                  <button
                    onClick={() => openEdit(row)}
                    className="no-print text-ink-muted hover:text-primary-600"
                    aria-label="Wax ka beddel"
                  >
                    <Pencil size={16} />
                  </button>
                ),
            },
          ]}
          data={filteredRows}
          emptyMessage={loading ? 'Waa la soo rarayaa...' : 'Arday lama helin'}
        />
      </Card>
      )}

      <Modal
        open={editingStudent !== null}
        onClose={() => setEditingStudent(null)}
        title={editingStudent ? `Lacagta ${editingStudent.name} — ${month}` : ''}
      >
        {editingStudent?.feeCategory === 'free' ? (
          <p className="rounded-lg bg-canvas px-3 py-4 text-center text-sm text-ink">
            Ardaygan waa <strong>Free</strong> — wax lacag ah lagama rabo.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-canvas px-3 py-2 text-sm text-ink">
              Qiimaha guud: <strong>${editingStudent?.amountDue}</strong>{' '}
              <span className="text-xs text-ink-muted">
                (beddel Settings-ka haddii uu qaldan yahay)
              </span>
            </div>
            <Input
              label="Intii la bixiyay ($)"
              type="number"
              value={amountPaid}
              onChange={(e) => {
                setAmountPaid(e.target.value)
                setPayError('')
              }}
              error={payError}
            />
            <Button onClick={handleSave} className="w-full" disabled={saving}>
              {saving ? 'Waa la keydinayaa...' : 'Keydi'}
            </Button>
          </div>
        )}
      </Modal>
      <StudentInfoModal studentId={infoStudent} onClose={() => setInfoStudent(null)} />
    </div>
  )
}

export default FeesPage
