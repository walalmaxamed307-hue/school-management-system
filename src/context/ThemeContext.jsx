import { createContext, useEffect, useState } from 'react'

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext(null)

function getStoredTheme() {
  return localStorage.getItem('theme') ?? 'dark'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getStoredTheme)

  // Marka theme-ku isbeddesho, class-ka "dark" waxaa lagu daraa/ka saaraa
  // <html> — CSS vars-ka (.dark { ... } index.css) ayaa halkaas ka dhaqmaya.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
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
