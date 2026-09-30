import { createContext, useState } from 'react'

// query-gan waa la wadaagaa Header + page kasta oo isticmaasha (Students,
// Fees) — sidaas awgeed marka la qoro "Axmed", page-ka la joogo (tusaale
// Fees) si toos ah ayuu u filter gareynayaa, ma aha in Header-ku toos ugu
// wado page kale.
// eslint-disable-next-line react-refresh/only-export-components
export const SearchContext = createContext(null)

export function SearchProvider({ children }) {
  const [query, setQuery] = useState('')
  return (
    <SearchContext.Provider value={{ query, setQuery }}>{children}</SearchContext.Provider>
  )
}
