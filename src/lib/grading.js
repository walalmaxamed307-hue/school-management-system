// Waxay ka soo saartaa tirada ku jirta magaca fasalka (tusaale "Fasalka 6" -> 6).
// Haddii aan tiro la helin, Infinity ayaa loo isticmaalaa si uu u dambeeyo
// kala soo saarista (fallback, ma jabin karto ClassesContext-ka).
export function classNumber(className) {
  const match = className.match(/\d+/)
  return match ? Number(match[0]) : Infinity
}
