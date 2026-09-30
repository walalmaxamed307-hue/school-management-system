import { useEffect, useState } from 'react'
import { DoorOpen, Clock } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { Card } from '@/components/ui'

const examStatusLabel = { present: 'Present', absent: 'Absent' }

function StudentRoomPage() {
  const { showToast } = useToast()
  const [data, setData] = useState(undefined) // undefined = loading, null = none yet
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .get('/my-room')
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((err) => {
        if (cancelled) return
        setError(true)
        showToast(err.message, 'error')
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <h1 className="mb-4 text-xl font-medium text-ink">Qolka Imtixaanka</h1>

      {data === undefined && !error ? (
        <Card className="text-ink-muted">Waa la soo rarayaa...</Card>
      ) : data ? (
        <Card className="flex items-center gap-4">
          <div className="rounded-lg bg-primary-50 p-3 text-primary-600">
            <DoorOpen size={24} />
          </div>
          <div>
            <p className="text-xs text-ink-muted">
              {data.className} — {data.examName}
            </p>
            <p className="text-lg font-medium text-ink">{data.roomName}</p>
            {data.examStatus && (
              <p className="text-xs text-ink-muted">Xaalad: {examStatusLabel[data.examStatus]}</p>
            )}
          </div>
        </Card>
      ) : (
        <Card className="flex items-center gap-2 text-ink-muted">
          <Clock size={18} />
          Weli lama kuu qaybin room — sug macalinka.
        </Card>
      )}
    </div>
  )
}

export default StudentRoomPage
