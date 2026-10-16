import { createContext, useEffect, useState } from 'react'

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext(null)

function getStoredTheme() {
  // Key cusub: preference-kii hore ee dark ahaa ma qasbayo users-ka inay
  // dark ku furmaan. Default-ka systemka hadda waa light.
  return localStorage.getItem('theme-preference') ?? 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getStoredTheme)

  // Marka theme-ku isbeddesho, class-ka "dark" waxaa lagu daraa/ka saaraa
  // <html> — CSS vars-ka (.dark { ... } index.css) ayaa halkaas ka dhaqmaya.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme-preference', theme)
  }, [theme])

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
