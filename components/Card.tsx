interface CardProps {
  title?: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export default function Card({ title, description, children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-8 ${className}`}>
      {title && <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>}
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      {children}
    </div>
  )
}
