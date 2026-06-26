import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { buildRobotsMetadata } from '@/lib/utils/seo'

export const metadata: Metadata = {
  title: {
    absolute: 'After-Sales Redirect',
  },
  robots: buildRobotsMetadata({ index: false, follow: true }),
}

export default function SupportAfterSalesServicePage() {
  redirect('/support-centre/after-sales-service')
}
