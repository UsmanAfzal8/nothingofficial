import type { Metadata } from 'next'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SupportCentreContent } from '@/components/SupportCentreContent'
import { getSupportHeroImage } from '@/lib/data/catalog-repository'
import { siteBrandName, siteKeywords } from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildSeoKeywords } from '@/lib/utils/seo'

export const metadata: Metadata = {
  title: {
    absolute: `Support Centre | ${siteBrandName}`,
  },
  description:
    'Learn more about Nothing products, troubleshoot issues, browse FAQs, and find support information in Pakistan.',
  keywords: buildSeoKeywords(siteKeywords, ['Nothing Pakistan support', 'Nothing Pakistan FAQs', 'Nothing Pakistan troubleshooting']),
  alternates: {
    canonical: buildAbsoluteUrl('/pages/support-centre'),
  },
  openGraph: {
    title: `Support Centre | ${siteBrandName}`,
    description:
      'Learn more about Nothing products, troubleshoot issues, browse FAQs, and find support information in Pakistan.',
    url: buildAbsoluteUrl('/pages/support-centre'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: `Support Centre | ${siteBrandName}`,
    description:
      'Learn more about Nothing products, troubleshoot issues, browse FAQs, and find support information in Pakistan.',
  },
}

export default async function SupportCentrePage() {
  const heroImage = await getSupportHeroImage()

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f4f0] text-[#111]">
      <NothingHeader />

      <main className="px-4 pb-16 pt-24 md:pb-24">
        <SupportCentreContent heroImageUrl={heroImage.url} heroImageAlt={heroImage.alt} />
      </main>

      <NothingFooter />
    </div>
  )
}
