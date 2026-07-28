import type { Metadata } from 'next'
import Link from 'next/link'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import {
  aiProductFaqs,
  aiProductHighlights,
  aiProductKeywords,
  siteKeywords,
} from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildFaqStructuredData, buildRobotsMetadata, buildSeoKeywords } from '@/lib/utils/seo'

const pageTitle = 'Nothing AI Phones in Pakistan | ChatGPT & Gemini'
const pageDescription =
  'Compare Nothing phones in Pakistan with Essential Space, ChatGPT, Gemini, Nothing OS features, accessories, and local buying guidance.'

export const metadata: Metadata = {
  title: {
    absolute: pageTitle,
  },
  description: pageDescription,
  keywords: buildSeoKeywords(siteKeywords, aiProductKeywords),
  alternates: {
    canonical: buildAbsoluteUrl('/ai-products'),
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: buildAbsoluteUrl('/ai-products'),
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
  },
  robots: buildRobotsMetadata(),
}

const phoneLinks = [
  { label: 'Phone (4a) Pro', href: '/products/nothing-pakistan-phone-4a-pro' },
  { label: 'Phone (4a)', href: '/products/nothing-pakistan-phone-4a' },
  { label: 'Phone (3)', href: '/products/nothing-pakistan-phone-3' },
  { label: 'Phone (3a) Pro', href: '/products/nothing-pakistan-phone-3a-pro' },
  { label: 'Phone (3a)', href: '/products/nothing-pakistan-phone-3a' },
] as const

function buildAiProductsStructuredData(): Record<string, unknown>[] {
  const structuredData: Array<Record<string, unknown> | null> = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${buildAbsoluteUrl('/ai-products')}#article`,
      headline: pageTitle,
      description: pageDescription,
      url: buildAbsoluteUrl('/ai-products'),
      inLanguage: 'en-PK',
      about: [
        'Nothing OS AI tools',
        'Essential Space',
        'Essential Search',
        'ChatGPT integration',
        'Google Gemini',
        'AI smartphones in Pakistan',
      ],
      publisher: {
        '@id': buildAbsoluteUrl('/#organization'),
      },
      mainEntityOfPage: buildAbsoluteUrl('/ai-products'),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      '@id': `${buildAbsoluteUrl('/ai-products')}#phones`,
      name: 'Nothing AI phone pages in Pakistan',
      itemListElement: phoneLinks.map((phone, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: buildAbsoluteUrl(phone.href),
      })),
    },
    buildBreadcrumbStructuredData([
      { label: 'Home', href: '/' },
      { label: 'Nothing AI Phones', href: '/ai-products' },
    ]),
    buildFaqStructuredData(aiProductFaqs),
  ]

  return structuredData.filter((entry): entry is Record<string, unknown> => Boolean(entry))
}

export default function AiProductsPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f4f0] text-black">
      <SeoStructuredData data={buildAiProductsStructuredData()} />
      <NothingHeader />

      <main className="px-4 pb-20 pt-28 md:px-8">
        <section className="mx-auto max-w-[1180px] border-b border-black/10 pb-10">
          <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-black/45">
            <Link href="/" className="transition-opacity hover:opacity-65">
              Home
            </Link>
            <span>/</span>
            <span>AI Products</span>
          </nav>
          <p className="text-[10px] uppercase tracking-[0.34em] text-black/45">AI Shopping Guide</p>
          <h1 className="mt-4 max-w-4xl text-4xl leading-[0.95] tracking-[-0.05em] text-black md:text-6xl">
            Nothing AI phones in Pakistan
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-black/64">
            Compare Nothing phones and compatible accessories for shoppers who care about Essential Space, Essential Search, ChatGPT voice routes, Gemini, Nothing OS, camera intelligence, battery life, chargers, protectors, and local support.
          </p>
        </section>

        <section className="mx-auto mt-10 grid max-w-[1180px] gap-5 lg:grid-cols-3">
          {aiProductHighlights.map((highlight) => (
            <article key={highlight.title} className="rounded-[8px] border border-black/10 bg-white p-6">
              <h2 className="text-2xl leading-tight tracking-[-0.03em]">{highlight.title}</h2>
              <p className="mt-4 text-sm leading-7 text-black/62">{highlight.description}</p>
              <Link href={highlight.href} className="mt-6 inline-flex text-[10px] uppercase tracking-[0.22em] text-black/70 underline underline-offset-4">
                Explore
              </Link>
            </article>
          ))}
        </section>

        <section className="mx-auto mt-10 max-w-[1180px] rounded-[8px] border border-black/10 bg-white p-6 md:p-8">
          <p className="text-[10px] uppercase tracking-[0.28em] text-black/42">Phone Pages</p>
          <h2 className="mt-3 text-3xl leading-tight tracking-[-0.04em] text-black">Start with these AI-capable Nothing models</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {phoneLinks.map((phone) => (
              <Link
                key={phone.href}
                href={phone.href}
                className="rounded-[8px] border border-black/10 bg-[#f8f8f4] px-4 py-5 text-sm transition-colors hover:bg-black hover:text-white"
              >
                {phone.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-10 grid max-w-[1180px] gap-6 lg:grid-cols-[0.72fr_1fr]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-black/42">Direct Answers</p>
            <h2 className="mt-3 text-3xl leading-tight tracking-[-0.04em] text-black">AI product questions</h2>
          </div>
          <div className="divide-y divide-black/10 rounded-[8px] border border-black/10 bg-white">
            {aiProductFaqs.map((faq) => (
              <details key={faq.question} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-black">
                  {faq.question}
                  <span className="text-lg leading-none text-black/38 group-open:hidden">+</span>
                  <span className="hidden text-lg leading-none text-black/38 group-open:block">-</span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-black/62">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <NothingFooter />
    </div>
  )
}
