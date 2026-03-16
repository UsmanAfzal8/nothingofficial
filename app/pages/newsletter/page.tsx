import type { Metadata } from 'next'
import { NewsletterSignupContent } from '@/components/NewsletterSignupContent'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { siteBrandName, siteKeywords } from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildSeoKeywords } from '@/lib/utils/seo'

export const metadata: Metadata = {
  title: {
    absolute: `Newsletter | ${siteBrandName}`,
  },
  description:
    'Join the Nothing Pakistan newsletter for product launches, restocks, support updates, and CMF accessory news.',
  keywords: buildSeoKeywords(siteKeywords, ['Nothing Pakistan newsletter', 'Nothing Pakistan updates', 'CMF Pakistan newsletter']),
  alternates: {
    canonical: buildAbsoluteUrl('/pages/newsletter'),
  },
  openGraph: {
    title: `Newsletter | ${siteBrandName}`,
    description:
      'Join the Nothing Pakistan newsletter for product launches, restocks, support updates, and CMF accessory news.',
    url: buildAbsoluteUrl('/pages/newsletter'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: `Newsletter | ${siteBrandName}`,
    description:
      'Join the Nothing Pakistan newsletter for product launches, restocks, support updates, and CMF accessory news.',
  },
}

export default function NewsletterPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f4f0] text-[#111]">
      <NothingHeader />

      <main className="px-4 pb-16 pt-24 md:px-8 md:pb-24">
        <section className="mx-auto max-w-[1680px]">
          <NewsletterSignupContent />
        </section>
      </main>

      <NothingFooter />
    </div>
  )
}
