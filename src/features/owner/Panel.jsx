// Kaarka guud ee dashboard-ka milkiilaha: cinwaan + icon + content.
function Panel({ title, subtitle, icon: Icon, action, className = '', children }) {
  return (
    <section className={`rounded-2xl border border-border bg-surface p-5 shadow-sm ${className}`}>
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Icon size={18} />
              </span>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-ink">{title}</h2>
              {subtitle && <p className="truncate text-xs text-ink-muted">{subtitle}</p>}
            </div>
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

export function EmptyState({ children }) {
  return (
    <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-ink-muted">
      {children}
    </div>
  )
}

export function Bar({ value, tone = 'good', height = 8 }) {
  const color = { good: 'var(--color-primary-600)', warn: 'var(--color-warning-500)', bad: 'var(--color-danger-500)', neutral: 'var(--color-border)' }[tone]
  return (
    <div className="w-full overflow-hidden rounded-full bg-canvas" style={{ height }}>
      <div
        className="h-full rounded-full"
        style={{ width: `${value ?? 0}%`, background: color, transition: 'width 900ms ease' }}
      />
    </div>
  )
}

export default Panel
