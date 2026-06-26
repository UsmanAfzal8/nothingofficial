import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { buildRobotsMetadata } from '@/lib/utils/seo'

export const metadata: Metadata = {
  title: {
    absolute: 'Product Status Redirect',
  },
  robots: buildRobotsMetadata({ index: false, follow: true }),
}

export default function ImeiPage() {
  redirect('/support-centre/product-status')
}
