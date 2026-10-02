// Role kasta wuxuu leeyahay "home route" gaar ah — marka user-ku isku dayo
// inuu galo route uusan xaq u lahayn, halkan ayaa loo celinayaa (ma aha "/"
// oo hardcoded, sababtoo ah ardaygu "/" uma oggola — infinite redirect ayuu
// abuuri lahaa haddii kale).
export function getHomeRoute(role) {
  if (role === 'student') return '/my-results'
  return '/dashboard'
}
