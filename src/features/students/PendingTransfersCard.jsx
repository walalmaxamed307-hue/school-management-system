import { useEffect, useState } from 'react'
import { ArrowDownToLine, Check, X } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { Card, Button } from '@/components/ui'

// Wareejin arday oo ka imanaya iskuul kale — waa in admin-ka iskuulkan
// (halkan) ansixiyo (accept) ka hor inta aan ardaygu ku jirin liiskan.
// Kaliya waxay muuqataa haddii wareejin la sugayo jirto.
function PendingTransfersCard({ onAccepted }) {
  const { showToast } = useToast()
  const [pending, setPending] = useState([])
  const [busyId, setBusyId] = useState(null)

  async function reload() {
    try {
      setPending(await api.get('/transfers/pending'))
    } catch {
      // Aamusan — wareejin sugaya ma aha wax muhiim ah in ay jab-jabto UI-ga
    }
  }

  useEffect(() => {
    reload()
  }, [])

  async function handleAccept(t) {
    setBusyId(t.id)
    try {
      const res = await api.post(`/transfers/${t.id}/accept`)
      showToast(`${t.studentName} waa la ansixiyay — Student ID cusub: ${res.studentCode}.`, 'success')
      await reload()
      onAccepted?.()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function handleReject(t) {
    if (!confirm(`Ma hubtaa inaad diidid wareejinta ${t.studentName}? Wuxuu ku noqon doonaa ${t.fromSchool} isaga oo active ah.`)) return
    setBusyId(t.id)
    try {
      await api.post(`/transfers/${t.id}/reject`)
      showToast(`Wareejinta ${t.studentName} waa la diiday.`, 'success')
      await reload()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setBusyId(null)
    }
  }

  if (pending.length === 0) return null

  return (
    <Card className="mb-4 border-warning-500/40">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
        <ArrowDownToLine size={16} className="text-warning-500" />
        Wareejin sugaya ansixintaada ({pending.length})
      </h2>
      <div className="flex flex-col gap-2">
        {pending.map((t) => (
          <div
            key={t.id}
            className="flex flex-col gap-2 rounded-lg border border-border px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-ink">
                {t.studentName} <span className="text-ink-muted">— ka socda {t.fromSchool}</span>
              </p>
              <p className="text-xs text-ink-muted">
                ID hore: {t.studentCode}
                {t.parentPhone ? ` · Waalidka: ${t.parentPhone}` : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => handleReject(t)} disabled={busyId === t.id}>
                <X size={14} />
                Diid
              </Button>
              <Button size="sm" onClick={() => handleAccept(t)} disabled={busyId === t.id}>
                <Check size={14} />
                Ansixi
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default PendingTransfersCard
