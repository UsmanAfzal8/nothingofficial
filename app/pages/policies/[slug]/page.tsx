import { permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { policySlugs } from '@/lib/data/policies'
import { buildRobotsMetadata } from '@/lib/utils/seo'

type LegacyPolicyPageProps = {
  params: {
    slug: string
  }
}

export function generateStaticParams() {
  return policySlugs.map((slug) => ({ slug }))
}

export const metadata: Metadata = {
  title: {
    absolute: 'Policy Redirect',
  },
  robots: buildRobotsMetadata({ index: false, follow: true }),
}

export default function LegacyPolicyPage({ params }: LegacyPolicyPageProps) {
  permanentRedirect(`/pages/${params.slug}`)
}
