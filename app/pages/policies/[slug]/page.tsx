import { permanentRedirect } from 'next/navigation'
import { policySlugs } from '@/lib/data/policies'

type LegacyPolicyPageProps = {
  params: {
    slug: string
  }
}

export function generateStaticParams() {
  return policySlugs.map((slug) => ({ slug }))
}

export default function LegacyPolicyPage({ params }: LegacyPolicyPageProps) {
  permanentRedirect(`/pages/${params.slug}`)
}
