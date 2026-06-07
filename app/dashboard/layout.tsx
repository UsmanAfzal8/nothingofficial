import type { Metadata } from 'next'
import { buildAbsoluteUrl } from '@/lib/utils/seo'

export const metadata: Metadata = {
  title: {
    absolute: 'Dashboard Preview | Nothing Pakistan',
  },
  alternates: {
    canonical: buildAbsoluteUrl('/dashboard'),
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
