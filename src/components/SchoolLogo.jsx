import { GraduationCap } from 'lucide-react'
import { useSchoolSettings } from '@/hooks/useSchoolSettings'

// Logo-ga iskuulka — icon badge + magaca, isla qaab-dhismeedka Login page-ka
// (ma aha qoraal caadi ah oo qura) — waxaa lagu isticmaalaa Sidebar/Header.
function SchoolLogo({ compact = false }) {
  const { settings } = useSchoolSettings()

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-white">
       
      </div>
      {!compact && (
        <p className="truncate text-base font-medium tracking-tight text-ink">
          {settings.name}
        </p>
      )}
    </div>
  )
}

export default SchoolLogo
