import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { buildRobotsMetadata } from '@/lib/utils/seo'

export const metadata: Metadata = {
  title: {
    absolute: 'Software Download Redirect',
  },
  robots: buildRobotsMetadata({ index: false, follow: true }),
}

export default function SupportSoftwareDownloadPage() {
  redirect('/support-centre/software-download')
}
