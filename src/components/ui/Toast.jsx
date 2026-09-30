import { MessageSquareText } from 'lucide-react'

// messages: [{ id, text }] — caller-ku wuu maareeyaa state-ka (ku dar/ka saar).
function Toast({ messages }) {
  if (messages.length === 0) return null

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {messages.map((m) => (
        <div
          key={m.id}
          className="flex max-w-sm items-start gap-2 rounded-lg border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-600 shadow-sm"
        >
          <MessageSquareText size={16} className="mt-0.5 shrink-0" />
          {m.text}
        </div>
      ))}
    </div>
  )
}

export default Toast
