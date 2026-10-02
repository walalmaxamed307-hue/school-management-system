import { MessageCircle } from 'lucide-react'
import { whatsappLink } from '@/lib/contact'

function WhatsAppButton() {
  return (
    <a
      href={whatsappLink('Asc. Waxaan rabaa inaan wax badan ka ogaado IskuulCaawiye.')}
      target="_blank"
      rel="noopener noreferrer"
      className="no-print fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
      aria-label="Nagala soo xariir WhatsApp"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-60" />
      <MessageCircle size={26} className="relative" />
    </a>
  )
}

export default WhatsAppButton
