import type { ReactNode } from 'react'

type InterTypographyScopeProps = {
  className?: string
  children: ReactNode
}

export function InterTypographyScope({ className = '', children }: InterTypographyScopeProps) {
  return <div className={`inter-only-scope ${className}`}>{children}</div>
}
