import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { buildRobotsMetadata } from '@/lib/utils/seo'

export const metadata: Metadata = {
  title: {
    absolute: 'Support Centre Redirect',
  },
  robots: buildRobotsMetadata({ index: false, follow: true }),
}

export default function SupportCenterAliasPage() {
  redirect('/support-centre')
}
