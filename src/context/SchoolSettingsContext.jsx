import { createContext, useEffect, useMemo } from 'react'
import { api } from '@/lib/api'
import { useStaffResource } from '@/lib/useStaffResource'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'

// eslint-disable-next-line react-refresh/only-export-components
export const SchoolSettingsContext = createContext(null)

const THIS_YEAR = new Date().getFullYear()

// Qiimayaal ku-meel-gaar ah intaan backend-ka la soo qaadin (ama haddii
// iskuulku weli sanad dugsiyeed lahayn) — pages-ku ma jabaan.
const DEFAULT_SETTINGS = {
  name: '',
  phone: '',
  address: '',
  logoUrl: '',
  examMaxMark: 100,
  passMark: 50,
  standardFeeAmount: 0,
  startYear: THIS_YEAR,
  endYear: THIS_YEAR + 1,
  academicYearId: null,
}
const INITIAL = { settings: null, academicYears: [] }

async function loadSettings() {
  const [s, years] = await Promise.all([api.get('/school-settings'), api.get('/academic-years')])
  return { settings: s, academicYears: years }
}

export function SchoolSettingsProvider({ children }) {
  const { data, loading, reload, run } = useStaffResource(loadSettings, INITIAL)
  const { showToast } = useToast()
  const { user } = useAuth()

  // useStaffResource wuxuu ilaaliyaa contexts-ka kale ee staff-only ah. Halkan
  // oo keliya student-ka ayaan dib ugu soo qaadannaa school settings-ka, si
  // logo-ga iyo magaca iskuulkiisa uu portal-ka uga muuqdo.
  useEffect(() => {
    if (user?.role === 'student') reload()
  }, [user?.id, user?.role, reload])

  // Sanadka HADDA socda = kan status: 'active' ah. startYear/endYear
  // waxay ka yimaadaan halkaas (settings.startYear ayaa ah key-ga natiijooyinka).
  const activeYear = useMemo(
    () => data.academicYears.find((y) => y.status === 'active') ?? null,
    [data.academicYears]
  )

  const settings = useMemo(() => {
    const s = data.settings
    if (!s) return DEFAULT_SETTINGS
    return {
      name: s.name ?? '',
      phone: s.phone ?? '',
      address: s.address ?? '',
      logoUrl: s.logoUrl ?? '',
      examMaxMark: s.defaultExamMaxMark,
      passMark: s.defaultPassMark,
      standardFeeAmount: s.defaultStandardFeeAmount,
      startYear: activeYear?.startYear ?? DEFAULT_SETTINGS.startYear,
      endYear: activeYear?.endYear ?? DEFAULT_SETTINGS.endYear,
      academicYearId: activeYear?._id ?? null,
    }
  }, [data.settings, activeYear])

  // data: { name, phone, address, examMaxMark, passMark, standardFeeAmount }
  // Sanadka dugsiyeedka ma beddelmo halkan — wuxuu ka dhaqaaqaa oo kaliya
  // abuurista sanad cusub / promotion.
  async function updateSettings(patch) {
    const body = {}
    if (patch.name !== undefined) body.name = patch.name
    if (patch.phone !== undefined) body.phone = patch.phone
    if (patch.address !== undefined) body.address = patch.address
    if (patch.examMaxMark !== undefined) body.defaultExamMaxMark = patch.examMaxMark
    if (patch.passMark !== undefined) body.defaultPassMark = patch.passMark
    if (patch.standardFeeAmount !== undefined) body.defaultStandardFeeAmount = patch.standardFeeAmount
    return run(() => api.patch('/school-settings', body))
  }

  // Iskuul cusub (oo platform-ku abuuray) weli sanad dugsiyeed ma laha —
  // admin-ku ayaa abuuraya kii ugu horreeyay (wuxuu si toos ah u noqonayaa active).
  async function createAcademicYear(startYear, endYear) {
    return run(() =>
      api.post('/academic-years', { startYear, endYear, label: `${startYear}-${endYear}` })
    )
  }

  const upcomingYear = useMemo(
    () => data.academicYears.find((y) => y.status === 'upcoming') ?? null,
    [data.academicYears]
  )

  // Gudbinta ardayda (promotion): waa in marka hore la abuuraa sanadka xiga
  // ('upcoming'), kaddibna la wado — mid kasta oo gudbay wuxuu helayaa
  // Enrollment cusub sanadkaas, kuwa aan gudbin waa la celiyaa, kuwa ugu
  // dambeeya ee gudbay waa la qalin-jabiyaa. Backend-ku ayaa qabta dhammaan.
  async function runPromotion() {
    if (!upcomingYear) return null
    try {
      const result = await api.post('/promotions/run', { toAcademicYearId: upcomingYear._id })
      await reload()
      return result
    } catch (err) {
      showToast(err.message, 'error')
      return null
    }
  }

  return (
    <SchoolSettingsContext.Provider
      value={{
        settings,
        loading,
        academicYears: data.academicYears,
        hasActiveYear: !!activeYear,
        upcomingYear,
        updateSettings,
        createAcademicYear,
        runPromotion,
      }}
    >
      {children}
    </SchoolSettingsContext.Provider>
  )
}
