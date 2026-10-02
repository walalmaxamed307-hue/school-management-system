import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

function Input({ label, error, className = '', id, type = 'text', ...props }) {
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={inputType}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-ink outline-none
            transition-colors placeholder:text-ink-muted
            ${isPassword ? 'pr-10' : ''}
            ${error ? 'border-danger-500' : 'border-border focus:border-primary-500'}
            ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Qari password-ka' : 'Muuji password-ka'}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-muted hover:text-ink"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-danger-500">{error}</p>}
    </div>
  )
}

export default Input