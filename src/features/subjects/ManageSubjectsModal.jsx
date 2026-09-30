import { useState } from 'react'
import { X, Plus, Pencil, Check } from 'lucide-react'
import { Button, Input, Modal } from '@/components/ui'

function ManageSubjectsModal({ open, onClose, subjects, onAdd, onUpdate, onRemove }) {
  const [newSubject, setNewSubject] = useState('')
  const [editing, setEditing] = useState(null) // subject name la wax-ka-beddelayo
  const [editValue, setEditValue] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    const ok = await onAdd(newSubject)
    if (ok) setNewSubject('')
  }

  function startEdit(subj) {
    setEditing(subj)
    setEditValue(subj)
  }

  async function saveEdit() {
    if (editing && editValue.trim() !== editing) await onUpdate(editing, editValue)
    setEditing(null)
  }

  function confirmRemove(subj) {
    if (confirm(`Ma hubtaa inaad tirtirto maadada "${subj}"?`)) onRemove(subj)
  }

  return (
    <Modal open={open} onClose={onClose} title="Maamul maadooyinka">
      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <Input
          placeholder="Tusaale: Cilmiga Bulshada"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="md">
          <Plus size={16} />
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        {subjects.length === 0 && <p className="text-sm text-ink-muted">Wali maado lama darin.</p>}
        {subjects.map((subj) => (
          <div
            key={subj}
            className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm text-ink"
          >
            {editing === subj ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                className="flex-1 rounded-md border border-border bg-surface px-2 py-1 text-sm outline-none focus:border-primary-500"
              />
            ) : (
              <span>{subj}</span>
            )}
            <div className="flex gap-2">
              {editing === subj ? (
                <button onClick={saveEdit} className="text-primary-600 hover:text-primary-700" aria-label="Keydi">
                  <Check size={16} />
                </button>
              ) : (
                <button
                  onClick={() => startEdit(subj)}
                  className="text-ink-muted hover:text-primary-600"
                  aria-label={`Wax ka beddel ${subj}`}
                >
                  <Pencil size={14} />
                </button>
              )}
              <button
                onClick={() => confirmRemove(subj)}
                className="text-ink-muted hover:text-danger-500"
                aria-label={`Ka saar ${subj}`}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}

export default ManageSubjectsModal
