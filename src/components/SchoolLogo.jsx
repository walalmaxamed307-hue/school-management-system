import brandMark from '@/assets/brand-mark.png'
import { useSchoolSettings } from '@/hooks/useSchoolSettings'

// Logo-ga IskuulCaawiye (isla kan landing page-ka iyo login-ka) + magaca iskuulka.
// Waxaa lagu isticmaalaa Sidebar/Header.
function SchoolLogo({ compact = false }) {
  const { settings } = useSchoolSettings()

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <img
        src={brandMark}
        alt="IskuulCaawiye"
        className="h-9 w-9 shrink-0 rounded-lg object-contain"
      />
      {!compact && (
        <p className="truncate text-base font-medium tracking-tight text-ink">
          {settings.name}
        </p>
      )}
    </div>
  )
}

export default SchoolLogo