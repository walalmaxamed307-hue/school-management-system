export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '252610000000'

export function whatsappLink(message = '') {
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${WHATSAPP_NUMBER}${text}`
}
