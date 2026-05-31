import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import { SupportDetailPageContent } from '@/components/SupportDetailPageContent'
import { getSupportPageBySlug, supportPageSlugs } from '@/lib/data/support-pages'
import { siteBrandName, siteKeywords } from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildFaqStructuredData, buildRobotsMetadata, buildSeoKeywords } from '@/lib/utils/seo'

type SupportSectionPageProps = {
  params: {
    section: string
  }
}

export function generateStaticParams() {
  return supportPageSlugs.map((section) => ({ section }))
}

export function generateMetadata({ params }: SupportSectionPageProps): Metadata {
  const page = getSupportPageBySlug(params.section)

  if (!page) {
    return {
      title: `Support Centre | ${siteBrandName}`,
      robots: buildRobotsMetadata({ index: false, follow: false }),
    }
  }

  const title = page.metaTitle
  const description = page.metaDescription
  const path = `/support-centre/${page.slug}`

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: buildSeoKeywords(siteKeywords, page.keywords),
    alternates: {
      canonical: buildAbsoluteUrl(path),
    },
    openGraph: {
      title,
      description,
      url: buildAbsoluteUrl(path),
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
}

export default function SupportSectionPage({ params }: SupportSectionPageProps) {
  const page = getSupportPageBySlug(params.section)

  if (!page) {
    notFound()
  }

  const faqStructuredData =
    page.kind === 'faqs'
      ? buildFaqStructuredData(
          (page.faqs ?? []).map((item) => ({
            question: item.question,
            answer: item.answer,
          })),
        )
      : null

  const structuredData = [
    buildBreadcrumbStructuredData([
      { label: 'Home', href: '/' },
      { label: 'Support Centre', href: '/support-centre' },
      { label: page.title, href: `/support-centre/${page.slug}` },
    ]),
    ...(faqStructuredData ? [faqStructuredData] : []),
  ]

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f4f6] text-[#111]">
      <SeoStructuredData data={structuredData} />
      <NothingHeader />
      <SupportDetailPageContent page={page} />
      <NothingFooter />
    </div>
  )
}
