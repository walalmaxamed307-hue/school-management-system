// Role kasta wuxuu leeyahay "home route" gaar ah — marka user-ku isku dayo
// inuu galo route uusan xaq u lahayn, halkan ayaa loo celinayaa (ma aha "/"
// oo hardcoded, sababtoo ah ardaygu "/" uma oggola — infinite redirect ayuu
// abuuri lahaa haddii kale).
export function getHomeRoute(role) {
  if (role === 'student') return '/my-results'
  return '/'
}

// Bogga Fees: admin, ama macalin loo ogolaaday (fee manager). Backend-ku isagu
// mar kale ayuu hubiyaa codsi kasta (requireFeeAccess).
export function hasFeeAccess(user) {
  return user?.role === 'admin' || (user?.role === 'teacher' && !!user?.isFeeManager)
}
