function Input({ label, error, className = '', id, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`rounded-lg border px-3 py-2 text-sm text-ink outline-none
          transition-colors placeholder:text-ink-muted
          ${error ? 'border-danger-500' : 'border-border focus:border-primary-500'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-danger-500">{error}</p>}
    </div>
  )
}

export default Input
