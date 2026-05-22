import type { Metadata } from 'next'
import { InterTypographyScope } from '@/components/InterTypographyScope'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import { SupportCentreContent } from '@/components/SupportCentreContent'
import { getSupportHeroImage } from '@/lib/data/catalog-repository'
import { supportFaqs } from '@/lib/data/support-centre'
import { siteBrandName, siteKeywords } from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildFaqStructuredData, buildRobotsMetadata, buildSeoKeywords } from '@/lib/utils/seo'

const title = `Support Centre | ${siteBrandName}`
const description =
  'Learn more about Nothing products, troubleshoot issues, browse FAQs, and find support information in Pakistan.'

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
  keywords: buildSeoKeywords(siteKeywords, ['Nothing Pakistan support', 'Nothing Pakistan FAQs', 'Nothing Pakistan troubleshooting']),
  alternates: {
    canonical: buildAbsoluteUrl('/support-centre'),
  },
  openGraph: {
    title,
    description,
    url: buildAbsoluteUrl('/support-centre'),
    type: 'website',
    images: [buildAbsoluteUrl('/social/nothing-pakistan-og.jpg')],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [buildAbsoluteUrl('/social/nothing-pakistan-og.jpg')],
  },
  robots: buildRobotsMetadata(),
}

export default async function SupportCentrePage() {
  const heroImage = await getSupportHeroImage()
  const supportFaqStructuredData = buildFaqStructuredData(
    supportFaqs.map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
  )
  const supportStructuredData = [
    buildBreadcrumbStructuredData([
      { label: 'Home', href: '/' },
      { label: 'Support Centre', href: '/support-centre' },
    ]),
    ...(supportFaqStructuredData ? [supportFaqStructuredData] : []),
  ]

  return (
    <InterTypographyScope>
      <div className="min-h-screen overflow-x-hidden bg-[#f4f4f0] text-[#111]">
        <SeoStructuredData data={supportStructuredData} />
        <NothingHeader />

        <main className="px-4 pb-16 pt-24 md:pb-24">
          <SupportCentreContent heroImageUrl={heroImage.url} heroImageAlt={heroImage.alt} />
        </main>

        <NothingFooter />
      </div>
    </InterTypographyScope>
  )
}
