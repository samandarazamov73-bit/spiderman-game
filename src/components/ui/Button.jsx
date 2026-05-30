export function Button({
  children,
  onClick,
  variant = 'secondary',
  icon: Icon,
  className = '',
  ...props
}) {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
  }[variant]
  return (
    <button
      onClick={onClick}
      className={`btn ${variantClass} px-3 py-1.5 ${className}`}
      {...props}
    >
      {Icon && <Icon size={13} />}
      {children}
    </button>
  )
}
