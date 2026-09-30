import { X } from 'lucide-react'

// Mobile: full-screen sheet (ma aha overlay yar oo dhuudhuub ah oo
// content-ka dherer ah ku qasban) — foolxun ayay noqon jirtay forms-ka
// dherer ah (StudentForm, TeacherForm). Desktop (sm: kor): dialog
// dhexe caadiga ah, sida hore.
function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className={`flex h-[92vh] w-full flex-col rounded-t-2xl bg-surface p-5 sm:h-auto sm:max-h-[90vh] ${size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-md'} sm:rounded-xl sm:p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <h2 className="text-lg font-medium text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink"
            aria-label="Xir"
          >
            <X size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

export default Modal
