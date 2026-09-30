import { useState } from 'react'
import { X, Plus, ChevronDown, ChevronUp, Layers, Pencil, Check } from 'lucide-react'
import { Button, Input, Modal } from '@/components/ui'

// Fasal kasta hadda waa object { name, hasSections, sections }, ma aha
// string bilaash ah — sababtoo ah admin-ku waa inuu go'aamiyaa haddii
// fasalku leeyahay sections (A, B, C...) ama uusan lahayn.
function ManageClassesModal({
  open,
  onClose,
  classes,
  onAdd,
  onRemove,
  onRename,
  onEnableSections,
  onAddSection,
  onRemoveSection,
  unsectionedCounts, // { [className]: count } — arday tirooda aan section lahayn
}) {
  const [newClass, setNewClass] = useState('')
  const [expanded, setExpanded] = useState(null) // className la furay
  const [newSection, setNewSection] = useState('')
  const [renaming, setRenaming] = useState(null) // className hadda la rename gareynayo
  const [renameValue, setRenameValue] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    const ok = await onAdd(newClass)
    if (ok) setNewClass('')
  }

  function toggleExpand(className) {
    setExpanded((prev) => (prev === className ? null : className))
    setNewSection('')
  }

  async function handleAddSection(e, className) {
    e.preventDefault()
    const ok = await onAddSection(className, newSection)
    if (ok) setNewSection('')
  }

  function confirmRemove(className) {
    if (confirm(`Ma hubtaa inaad tirtirto "${className}"? Tan dib looma soo celin karo.`)) {
      onRemove(className)
    }
  }

  function confirmRemoveSection(className, sectionName) {
    if (confirm(`Ma hubtaa inaad tirtirto section "${sectionName}"?`)) {
      onRemoveSection(className, sectionName)
    }
  }

  function startRename(className) {
    setRenaming(className)
    setRenameValue(className)
  }

  function saveRename() {
    if (renaming && renameValue.trim() && renameValue.trim() !== renaming) {
      onRename(renaming, renameValue.trim())
    }
    setRenaming(null)
  }

  return (
    <Modal open={open} onClose={onClose} title="Maamul fasallada">
      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <Input
          placeholder="Tusaale: Fasalka 8"
          value={newClass}
          onChange={(e) => setNewClass(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="md">
          <Plus size={16} />
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        {classes.length === 0 && (
          <p className="text-sm text-ink-muted">Wali fasal lama darin.</p>
        )}
        {classes.map((c) => {
          const isOpen = expanded === c.name
          const unsectioned = unsectionedCounts?.[c.name] ?? 0
          const isRenaming = renaming === c.name
          return (
            <div key={c.name} className="rounded-lg border border-border">
              <div className="flex items-center justify-between px-3 py-2 text-sm text-ink">
                {isRenaming ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                    className="flex-1 rounded-md border border-border bg-surface px-2 py-1 text-sm outline-none focus:border-primary-500"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleExpand(c.name)}
                    className="flex flex-1 items-center gap-2 text-left"
                  >
                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {c.name}
                    {c.hasSections && (
                      <span className="rounded-full bg-canvas px-2 py-0.5 text-xs text-ink-muted">
                        {c.sections.length} section
                      </span>
                    )}
                  </button>
                )}
                <div className="flex items-center gap-2">
                  {isRenaming ? (
                    <button
                      onClick={saveRename}
                      className="text-primary-600 hover:text-primary-700"
                      aria-label="Keydi magaca cusub"
                    >
                      <Check size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => startRename(c.name)}
                      className="text-ink-muted hover:text-primary-600"
                      aria-label={`Wax ka beddel magaca ${c.name}`}
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => confirmRemove(c.name)}
                    className="text-ink-muted hover:text-danger-500"
                    aria-label={`Ka saar ${c.name}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-border p-3">
                  {!c.hasSections ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => onEnableSections(c.name)}
                    >
                      <Layers size={14} />
                      Fasalkan u shaqaysii sections (A, B, C...)
                    </Button>
                  ) : (
                    <>
                      {unsectioned > 0 && (
                        <p className="mb-2 rounded-lg bg-warning-50 px-3 py-2 text-xs text-warning-500">
                          {unsectioned} arday oo {c.name} ku jira weli lama qoondeynin section —
                          tag Students, ka dibna &ldquo;Qaybi sections&rdquo;.
                        </p>
                      )}
                      <form onSubmit={(e) => handleAddSection(e, c.name)} className="mb-2 flex gap-2">
                        <Input
                          placeholder="Tusaale: A"
                          value={newSection}
                          onChange={(e) => setNewSection(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="submit" size="md" variant="secondary">
                          <Plus size={16} />
                        </Button>
                      </form>
                      <div className="flex flex-wrap gap-2">
                        {c.sections.length === 0 && (
                          <p className="text-xs text-ink-muted">Wali section lama darin.</p>
                        )}
                        {c.sections.map((s) => (
                          <span
                            key={s}
                            className="flex items-center gap-1 rounded-full border border-border px-2 py-1 text-xs text-ink"
                          >
                            {s}
                            <button
                              onClick={() => confirmRemoveSection(c.name, s)}
                              className="text-ink-muted hover:text-danger-500"
                              aria-label={`Ka saar section ${s}`}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Modal>
  )
}

export default ManageClassesModal
