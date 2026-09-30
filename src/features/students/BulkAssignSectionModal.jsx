import { useState } from 'react'
import { Button, Modal } from '@/components/ui'

// Ardayda hore ee fasalkan ku jirtay ee weli sectionka lama qoondeynin —
// admin-ku wuxuu doortaa qaar (checkboxes), section buu u dhigaa, taasoo
// si fudud loogu qaybin karo bogga student-ka fasalkiisa (sida aad
// sheegtay: "qaar A laga dhigo, qaarna B, qaar C, qaar D").
function BulkAssignSectionModal({ open, onClose, className, sections, unsectionedStudents, onAssign }) {
  // sections: [{ id, name }]
  const [selectedIds, setSelectedIds] = useState([])
  const [targetSection, setTargetSection] = useState(sections[0]?.id ?? '')

  function toggle(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function toggleAll() {
    setSelectedIds((prev) =>
      prev.length === unsectionedStudents.length ? [] : unsectionedStudents.map((s) => s.id)
    )
  }

  async function handleAssign() {
    if (selectedIds.length === 0 || !targetSection) return
    await onAssign(selectedIds, targetSection)
    setSelectedIds([])
  }

  const targetName = sections.find((s) => s.id === targetSection)?.name ?? ''

  return (
    <Modal open={open} onClose={onClose} title={`Qaybi ardayda ${className} sections`}>
      {unsectionedStudents.length === 0 ? (
        <p className="text-sm text-ink-muted">
          Ardayda {className} tamaan waxaa loo qoondeeyay section — waxba lama qaybin karo.
        </p>
      ) : (
        <>
          <p className="mb-3 text-xs text-ink-muted">
            Dooro ardayda, ka dibna dooro sectionka aad rabto in loo dhigo. Waxaad u qaybin
            kartaa dhowr kooxood oo kala duwan (tusaale qaar A, qaarna B) — hal mar dhig hal
            section.
          </p>
          <button
            type="button"
            onClick={toggleAll}
            className="mb-2 text-xs font-medium text-primary-600 hover:underline"
          >
            {selectedIds.length === unsectionedStudents.length ? 'Ka saar dhammaan' : 'Dooro dhammaan'}
          </button>
          <div className="mb-4 flex max-h-64 flex-col gap-1 overflow-y-auto rounded-lg border border-border p-2">
            {unsectionedStudents.map((s) => (
              <label key={s.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink hover:bg-canvas">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(s.id)}
                  onChange={() => toggle(s.id)}
                />
                {s.name}
              </label>
            ))}
          </div>
          <div className="mb-4 flex items-center gap-2">
            <label className="text-sm font-medium text-ink">Section-ka:</label>
            <select
              value={targetSection}
              onChange={(e) => setTargetSection(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={handleAssign} disabled={selectedIds.length === 0} className="w-full">
            Qaybi {selectedIds.length > 0 ? `(${selectedIds.length})` : ''} → Section {targetName}
          </Button>
        </>
      )}
    </Modal>
  )
}

export default BulkAssignSectionModal
