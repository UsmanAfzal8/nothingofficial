export interface Button {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
  className = '',
}: Button) {
  const baseStyles =
    'font-semibold rounded-lg transition-colors inline-flex items-center justify-center'

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-blue-600 disabled:bg-gray-400',
    secondary: 'bg-secondary text-white hover:bg-green-600 disabled:bg-gray-400',
    accent: 'bg-accent text-white hover:bg-amber-600 disabled:bg-gray-400',
    ghost: 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-100 disabled:text-gray-400',
  }

  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  )
}
