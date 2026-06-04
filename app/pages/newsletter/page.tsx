import type { Metadata } from 'next'
import { NewsletterSignupContent } from '@/components/NewsletterSignupContent'
import { InterTypographyScope } from '@/components/InterTypographyScope'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { siteBrandName, siteKeywords } from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildSeoKeywords } from '@/lib/utils/seo'

export const metadata: Metadata = {
  title: {
    absolute: `Newsletter | ${siteBrandName}`,
  },
  description:
    'Join the Nothing Official Store Pakistan newsletter for product launches, restocks, support updates, and CMF accessory news.',
  keywords: buildSeoKeywords(siteKeywords, ['Nothing Official Store Pakistan newsletter', 'Nothing Official Store Pakistan updates', 'CMF Pakistan newsletter']),
  alternates: {
    canonical: buildAbsoluteUrl('/pages/newsletter'),
  },
  openGraph: {
    title: `Newsletter | ${siteBrandName}`,
    description:
      'Join the Nothing Official Store Pakistan newsletter for product launches, restocks, support updates, and CMF accessory news.',
    url: buildAbsoluteUrl('/pages/newsletter'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: `Newsletter | ${siteBrandName}`,
    description:
      'Join the Nothing Official Store Pakistan newsletter for product launches, restocks, support updates, and CMF accessory news.',
  },
}

export default function NewsletterPage() {
  return (
    <InterTypographyScope>
      <div className="min-h-screen overflow-x-hidden bg-[#f4f4f0] text-[#111]">
        <NothingHeader />

        <main className="px-4 pb-16 pt-24 md:px-8 md:pb-24">
          <section className="mx-auto max-w-[1680px]">
            <div className="mb-8 max-w-4xl rounded-[30px] border border-black/10 bg-white/80 p-6 shadow-[0_18px_50px_rgba(17,17,17,0.05)]">
              <p className="text-[10px] uppercase tracking-[0.28em] text-black/42">Newsletter</p>
              <h1 className="mt-4 text-4xl leading-[0.95] tracking-[-0.04em] text-black md:text-6xl">Stay close to new Nothing and CMF launches</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-black/68 md:text-base">
                The newsletter is the cleanest place to hear about launches, restocks, pricing updates, delivery notices, and accessory drops from Nothing Official Store Pakistan. It also gives search engines a clearer supporting page for branded update queries instead of relying only on product pages.
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-black/68 md:text-base">
                If you are comparing phones, chargers, earbuds, or protectors in Pakistan, newsletter updates can help you catch stock changes and new arrivals before you return to the catalog.
              </p>
            </div>
            <NewsletterSignupContent />
          </section>
        </main>

        <NothingFooter />
      </div>
    </InterTypographyScope>
  )
}
