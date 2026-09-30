import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

// Toggle-kan waa la wadaagaa qof kasta — admin, macalin, arday, xitaa
// qofka aan weli login gelin (LoginPage). Ma xaddidna role.
function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'U beddel Light Mode' : 'U beddel Dark Mode'}
      className={`flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-canvas hover:text-ink ${className}`}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

export default ThemeToggle
