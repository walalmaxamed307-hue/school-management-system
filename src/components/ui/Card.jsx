function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
