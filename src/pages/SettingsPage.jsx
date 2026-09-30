import { useEffect, useState } from 'react'
import { GraduationCap, CalendarDays } from 'lucide-react'
import { useSchoolSettings } from '@/hooks/useSchoolSettings'
import { useToast } from '@/hooks/useToast'
import { Card, Input, Button } from '@/components/ui'

const THIS_YEAR = new Date().getFullYear()
// Sanadka ugu horreeya ee iskuul cusub la doorto karo.
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => THIS_YEAR - 3 + i)

function toForm(settings) {
  return {
    name: settings.name,
    phone: settings.phone,
    address: settings.address,
    examMaxMark: String(settings.examMaxMark),
    passMark: String(settings.passMark),
    standardFeeAmount: String(settings.standardFeeAmount),
  }
}

function SettingsPage() {
  const { settings, loading, hasActiveYear, upcomingYear, updateSettings, createAcademicYear, runPromotion } =
    useSchoolSettings()
  const { showToast } = useToast()
  const [form, setForm] = useState(() => toForm(settings))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [firstYear, setFirstYear] = useState(THIS_YEAR)
  const [creatingYear, setCreatingYear] = useState(false)
  const [preparingNextYear, setPreparingNextYear] = useState(false)
  const [promoting, setPromoting] = useState(false)

  // Marka xogta backend-ka la soo qaado (ama la keydiyo), foomka waa la dhiibayaa.
  useEffect(() => {
    setForm(toForm(settings))
  }, [settings])

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    const examMaxMark = Number(form.examMaxMark)
    const passMark = Number(form.passMark)
    const standardFeeAmount = Number(form.standardFeeAmount)
    if (!form.name.trim()) {
      showToast('Magaca iskuulka waa loo baahan yahay', 'error')
      return
    }
    if (!(examMaxMark > 0)) {
      showToast('Dhibcaha ugu badan waa in ay ka weyn yihiin 0', 'error')
      return
    }
    if (passMark < 0 || Number.isNaN(passMark) || standardFeeAmount < 0 || Number.isNaN(standardFeeAmount)) {
      showToast('Pass mark iyo fee waa in ay noqdaan tiro sax ah (0 ama ka badan)', 'error')
      return
    }
    setSaving(true)
    const ok = await updateSettings({
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      examMaxMark,
      passMark,
      standardFeeAmount,
    })
    setSaving(false)
    if (ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  async function handleCreateYear() {
    setCreatingYear(true)
    await createAcademicYear(firstYear, firstYear + 1)
    setCreatingYear(false)
  }

  async function handlePrepareNextYear() {
    setPreparingNextYear(true)
    await createAcademicYear(settings.endYear, settings.endYear + 1)
    setPreparingNextYear(false)
  }

  async function handleRunPromotion() {
    if (
      !confirm(
        `Ma hubtaa inaad gudbiso ardayda oo dhan sanadka ${upcomingYear.label}? Tan dib looma celin karo — natiijada Final Exam ayaa go'aaminaysa.`
      )
    )
      return
    setPromoting(true)
    const result = await runPromotion()
    setPromoting(false)
    if (!result) return
    const { promoted, repeated, graduated, failed } = result
    showToast(
      `Gudbay: ${promoted} · Ku celiyay: ${repeated} · Qalin-jabiyay: ${graduated}` +
        (failed?.length ? ` · Fashilmay: ${failed.length} (eeg Students page)` : ''),
      failed?.length ? 'error' : 'success'
    )
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-medium text-ink">Settings</h1>

      <div className="grid max-w-4xl grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-medium text-ink">Macluumaadka iskuulka</h2>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Input
              label="Magaca iskuulka"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={loading}
            />
            <Input
              label="Telefoonka"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={loading}
            />
            <Input
              label="Cinwaanka"
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              disabled={loading}
            />
            <Input
              label="Ugu badnaan dhibcaha imtixaanka (max mark)"
              type="number"
              min="1"
              value={form.examMaxMark}
              onChange={(e) => handleChange('examMaxMark', e.target.value)}
              disabled={loading}
            />
            <Input
              label="Total-ka Final Exam loo baahan yahay si loo gudbo (pass mark)"
              type="number"
              min="0"
              value={form.passMark}
              onChange={(e) => handleChange('passMark', e.target.value)}
              disabled={loading}
            />
            <Input
              label="Qiimaha caadiga ah ee lacagta (fee)"
              type="number"
              min="0"
              value={form.standardFeeAmount}
              onChange={(e) => handleChange('standardFeeAmount', e.target.value)}
              disabled={loading}
            />
            <Button type="submit" className="w-full" disabled={loading || saving}>
              {saving ? 'Waa la keydinayaa...' : saved ? 'La keydiyay ✓' : 'Keydi isbeddelka'}
            </Button>
          </form>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
              <CalendarDays size={16} /> Sanad dugsiyeedka
            </h2>
            {hasActiveYear ? (
              <p className="text-sm text-ink">
                Sanadka hadda socda:{' '}
                <strong>
                  {settings.startYear}-{settings.endYear}
                </strong>
                <span className="mt-1 block text-xs text-ink-muted">
                  Sanadka cusub waxaa la bilaabaa Gudbinta (hoos) — ma gacanta lagu beddeli karo.
                </span>
              </p>
            ) : (
              <>
                <p className="mb-3 text-xs text-ink-muted">
                  Iskuulkan weli sanad dugsiyeed ma laha. Abuur kii ugu horreeyay si aad u
                  diiwaangelin karto arday.
                </p>
                <div className="flex items-center gap-2">
                  <select
                    value={firstYear}
                    onChange={(e) => setFirstYear(Number(e.target.value))}
                    className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500"
                  >
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>
                        {y}-{y + 1}
                      </option>
                    ))}
                  </select>
                  <Button onClick={handleCreateYear} disabled={creatingYear}>
                    {creatingYear ? '...' : 'Abuur'}
                  </Button>
                </div>
              </>
            )}
          </Card>

          <Card>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
              <GraduationCap size={16} /> Gudbi ardayda (Promotion)
            </h2>
            {!hasActiveYear ? (
              <p className="text-xs text-ink-muted">Marka hore abuur sanadka koowaad (kore).</p>
            ) : !upcomingYear ? (
              <>
                <p className="mb-3 text-xs text-ink-muted">
                  Marka hore abuur sanadka xiga ({settings.endYear}-{settings.endYear + 1}) — kadibna waad
                  gudbin kartaa ardayda.
                </p>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handlePrepareNextYear}
                  disabled={preparingNextYear}
                >
                  {preparingNextYear ? '...' : `Abuur sanadka ${settings.endYear}-${settings.endYear + 1}`}
                </Button>
              </>
            ) : (
              <>
                <p className="mb-3 text-xs text-ink-muted">
                  Ardayda oo dhan waxay u gudbi doonaan <strong>{upcomingYear.label}</strong> — kuwa gudbay
                  fasalka xiga, kuwa dhacay isla fasalka way ku celcelin doonaan, kuwa fasalka ugu dambeeya
                  gudbayna waa la qalin-jabinayaa. Isticmaal Final Exam-ka la published gareeyay.
                </p>
                <Button className="w-full" onClick={handleRunPromotion} disabled={promoting}>
                  {promoting ? 'Waa la gudbinayaa...' : `Gudbi ardayda -> ${upcomingYear.label}`}
                </Button>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
