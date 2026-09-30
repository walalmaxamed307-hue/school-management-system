// Kani waa "abstraction point"-ka SMS-ka — mock hadda (console.log + return),
// marka backend la daro (Africa's Talking, ka dhacaya server-ka ma aha
// frontend-ka — sida aan hore uga hadalnay security-ga), function-kan
// GUDIHIISA ayaa la bedeli doonaa fetch('/api/sms', ...), meelaha isticmaalaya
// (AttendancePage) ma isbedelayaan.
export function sendAbsenceNotification(student) {
  const message = `SMS: ${student.parentName} (${student.parentPhone}) waxaa loo sheegayay in ${student.name} maanta uu maqan yahay.`
  console.log(message)
  return { id: Date.now(), text: message }
}

export function sendResultsNotification(student) {
  const message = `SMS: ${student.parentName} (${student.parentPhone}) waxaa loo sheegayay in natiijada ${student.name} la soo saaray.`
  console.log(message)
  return { id: Date.now(), text: message }
}
