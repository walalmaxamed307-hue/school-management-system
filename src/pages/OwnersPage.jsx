import { useCallback, useEffect, useState } from 'react'
import { Copy, Check, Crown, KeyRound, Plus, Power, PowerOff, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { Button, Input, Modal } from '@/components/ui'

const MIN_PASSWORD = 8
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Password-ka la muujiyo MAR KEELIYA ah (backend-ku hash ayuu keydiyaa, dib
// looma helo) — admin-ku waa inuu u dhiibaa milkiilaha.
function Credentials({ email, password, onDone }) {
  const [copied, setCopied] = useState(false)
  const loginUrl = `${window.location.origin}/login`
  const text = `Login: ${loginUrl}\nEmail: ${email}\nPassword: ${password}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard lama heli karo — qofku gacanta ayuu koobiyeeyaa */
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink">Akoonka waa diyaar. U dir milkiilaha macluumaadkan:</p>
      <pre className="whitespace-pre-wrap break-all rounded-xl bg-canvas p-3 text-xs text-ink">{text}</pre>
      <p className="rounded-lg bg-warning-50 px-3 py-2 text-xs text-warning-500">
        Password-ka mar dambe lama muujin doono. Haddii la lumiyo, "Reset password" ayaad u samayn kartaa.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={copy}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'La koobiyeeyay' : 'Koobiyee'}
        </Button>
        <Button onClick={onDone}>Dhammaad</Button>
      </div>
    </div>
  )
}

function OwnerForm({ owner, onClose, onSaved }) {
  const { showToast } = useToast()
  const isReset = !!owner
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!isReset && !EMAIL_RE.test(email.trim())) return setError('Email sax ah geli')
    if (password.length < MIN_PASSWORD) return setError(`Password-ku waa inuu ugu yaraan ${MIN_PASSWORD} xaraf yahay`)
    setSaving(true)
    try {
      if (isReset) await api.patch(`/owner-accounts/${owner.id}`, { password })
      else await api.post('/owner-accounts', { email: email.trim(), password })
      onSaved()
      setCreated({ email: isReset ? owner.email : email.trim(), password })
    } catch (err) {
      setError(err.message)
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (created) return <Credentials {...created} onDone={onClose} />

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      {isReset ? (
        <p className="text-sm text-ink-muted">Password cusub u dej <b className="text-ink">{owner.email}</b>.</p>
      ) : (
        <Input label="Email" type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@iskuul.so" />
      )}
      <Input
        label={isReset ? 'Password cusub' : 'Password'}
        type="text"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={`Ugu yaraan ${MIN_PASSWORD} xaraf`}
      />
      {error && <p className="text-sm text-danger-500">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>Jooji</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Waa la keydinayaa...' : isReset ? 'Beddel password' : 'Abuur akoon'}</Button>
      </div>
    </form>
  )
}

function OwnersPage() {
  const { showToast } = useToast()
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | { mode: 'add' } | { mode: 'reset', owner }

  const load = useCallback(async () => {
    try {
      setOwners(await api.get('/owner-accounts'))
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    load()
  }, [load])

  async function toggleActive(o) {
    const next = !o.isActive
    if (!next && !confirm(`Ma hubtaa inaad joojiso ${o.email}? Isla markiiba ma gali doono.`)) return
    try {
      await api.patch(`/owner-accounts/${o.id}`, { isActive: next })
      await load()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  async function remove(o) {
    if (!confirm(`Ma hubtaa inaad tirtirto ${o.email}? Tani dib looma celin karo.`)) return
    try {
      await api.delete(`/owner-accounts/${o.id}`)
      await load()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const iconBtn = 'rounded-md p-1.5 text-ink-muted hover:bg-canvas'

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-medium text-ink">Owners</h1>
          <p className="text-xs text-ink-muted">Milkiilayaasha iskuulka — akoon keliya oo email + password ah</p>
        </div>
        <Button size="sm" onClick={() => setModal({ mode: 'add' })}>
          <Plus size={16} />
          Ku dar owner
        </Button>
      </div>

      <div className="mb-4 flex gap-3 rounded-xl border border-border bg-surface p-4 text-sm text-ink-muted">
        <Crown size={18} className="mt-0.5 shrink-0 text-primary-600" />
        <p>
          Milkiilaha marka uu galo wuxuu arkaa <b className="text-ink">dashboard gaar ah oo akhris-kaliya ah</b> (ardayda, joogitaanka,
          macallimiinta, lacagta, natiijooyinka iyo ardayda khatarta ah). Wax kale ma arko, wax kalena ma beddeli karo.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {loading ? (
          <p className="p-6 text-sm text-ink-muted">Waa la soo rarayaa...</p>
        ) : owners.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-muted">Weli owner lama darin.</p>
        ) : (
          <ul className="divide-y divide-border">
            {owners.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{o.email}</p>
                  <p className="text-xs text-ink-muted">La abuuray {new Date(o.createdAt).toLocaleDateString('en-GB')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${o.isActive ? 'bg-primary-50 text-primary-600' : 'bg-canvas text-ink-muted'}`}>
                    {o.isActive ? 'Firfircoon' : 'La joojiyay'}
                  </span>
                  <button className={`${iconBtn} hover:text-primary-600`} onClick={() => setModal({ mode: 'reset', owner: o })} aria-label="Reset password" title="Reset password">
                    <KeyRound size={16} />
                  </button>
                  <button className={`${iconBtn} hover:text-warning-500`} onClick={() => toggleActive(o)} aria-label={o.isActive ? 'Jooji' : 'Dib u fur'} title={o.isActive ? 'Jooji' : 'Dib u fur'}>
                    {o.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                  </button>
                  <button className={`${iconBtn} hover:text-danger-500`} onClick={() => remove(o)} aria-label="Tirtir" title="Tirtir">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'reset' ? 'Reset password' : 'Ku dar owner'}>
        {modal && <OwnerForm owner={modal.owner} onClose={() => setModal(null)} onSaved={load} />}
      </Modal>
    </div>
  )
}

export default OwnersPage
