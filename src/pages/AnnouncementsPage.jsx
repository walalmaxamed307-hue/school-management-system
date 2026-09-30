import { useState } from 'react'
import { Trash2, CalendarDays, Plus } from 'lucide-react'
import { useAnnouncements } from '@/hooks/useAnnouncements'
import { useAuth } from '@/hooks/useAuth'
import { Card, Button, Input } from '@/components/ui'

function AnnouncementsPage() {
  const { announcements, loading, addAnnouncement, deleteAnnouncement } = useAnnouncements()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const isStaff = isAdmin || user?.role === 'teacher'
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [date, setDate] = useState('')
  const [formError, setFormError] = useState('')
  const [posting, setPosting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      setFormError('Qor horta cinwaanka iyo faah-faahinta ka hor intaanad post gareynin')
      return
    }
    setPosting(true)
    const ok = await addAnnouncement({ title: title.trim(), body: body.trim(), date: date || null })
    setPosting(false)
    if (ok) {
      setTitle('')
      setBody('')
      setDate('')
      setFormError('')
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-medium text-ink">Announcements</h1>

      {isStaff && (
        <Card className="mb-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              placeholder="Cinwaanka"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Faah-faahinta..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500"
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="sm:max-w-[180px]"
              />
              <span className="self-center text-xs text-ink-muted">
                (ikhtiyaari — haddii la buuxiyo, waxay noqonaysaa event/calendar)
              </span>
            </div>
            <Button type="submit" className="sm:w-fit" disabled={posting}>
              <Plus size={16} />
              {posting ? 'Waa la postinayaa...' : 'Post'}
            </Button>
            {formError && <p className="text-sm text-danger-500">{formError}</p>}
          </form>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {announcements.length === 0 && (
          <Card className="text-center text-sm text-ink-muted">
            {loading ? 'Waa la soo rarayaa...' : 'Wali ogeysiis lama qorin'}
          </Card>
        )}
        {announcements.map((a) => (
          <Card key={a.id} className="flex items-start justify-between gap-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <p className="font-medium text-ink">{a.title}</p>
                {a.eventDate && (
                  <span className="flex items-center gap-1 rounded-full bg-primary-500 px-2 py-0.5 text-xs text-white">
                    <CalendarDays size={12} /> {String(a.eventDate).slice(0, 10)}
                  </span>
                )}
              </div>
              <p className="text-sm text-ink-muted">{a.body}</p>
              <p className="mt-2 text-xs text-ink-muted">
                Published by {a.author} ({a.authorRole === 'admin' ? 'Admin of school' : 'Teacher'}) ·{' '}
                {String(a.createdAt).slice(0, 10)}
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => deleteAnnouncement(a.id)}
                className="text-ink-muted hover:text-danger-500"
                aria-label="Tirtir"
              >
                <Trash2 size={16} />
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AnnouncementsPage
