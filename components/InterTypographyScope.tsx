import localFont from 'next/font/local'
import type { ReactNode } from 'react'

const interLight = localFont({
  src: [{ path: '../fonts/Inter-Light.otf', weight: '300', style: 'normal' }],
  variable: '--font-inter-light',
  display: 'swap',
})

const interMedium = localFont({
  src: [{ path: '../fonts/Inter-Medium.otf', weight: '500', style: 'normal' }],
  variable: '--font-inter-medium',
  display: 'swap',
})

type InterTypographyScopeProps = {
  className?: string
  children: ReactNode
}

export function InterTypographyScope({ className = '', children }: InterTypographyScopeProps) {
  return <div className={`inter-only-scope ${interLight.variable} ${interMedium.variable} ${className}`}>{children}</div>
}
