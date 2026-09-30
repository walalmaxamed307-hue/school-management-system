import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { Button, Input, Modal } from '@/components/ui'

const MIN_LENGTH = 8

// Foomka beddelka password-ka (admin iyo macalin). Modal-ka waxaa lagu
// xirmo, state-ku wuu nadiifaa (close() ayaa reset sameeya).
function ChangePasswordModal({ open, onClose }) {
  const { changePassword } = useAuth()
  const { showToast } = useToast()
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function update(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }))
      setError('')
    }
  }

  function close() {
    setForm({ current: '', next: '', confirm: '' })
    setError('')
    onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (saving) return
    if (!form.current) return setError('Geli password-ka hadda jira')
    if (form.next.length < MIN_LENGTH) {
      return setError(`Password-ka cusub waa inuu ahaadaa ugu yaraan ${MIN_LENGTH} xaraf`)
    }
    if (form.next === form.current) {
      return setError('Password-ka cusub waa inuu ka duwanaadaa kan hadda jira')
    }
    if (form.next !== form.confirm) return setError('Password-ka cusub iyo xaqiijintiisu isku mid ma aha')

    setSaving(true)
    const result = await changePassword(form.current, form.next)
    setSaving(false)
    if (!result.success) return setError(result.error)
    showToast('Password-ka waa la beddelay', 'success')
    close()
  }

  return (
    <Modal open={open} onClose={close} title="Beddel password-ka">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="cp-current"
          label="Password-ka hadda jira"
          type="password"
          autoComplete="current-password"
          value={form.current}
          onChange={update('current')}
        />
        <Input
          id="cp-new"
          label="Password-ka cusub"
          type="password"
          autoComplete="new-password"
          value={form.next}
          onChange={update('next')}
        />
        <Input
          id="cp-confirm"
          label="Ku celi password-ka cusub"
          type="password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={update('confirm')}
        />
        {error && <p className="text-sm text-danger-500">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={close}>
            Jooji
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Waa la kaydinayaa...' : 'Kaydi'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ChangePasswordModal
