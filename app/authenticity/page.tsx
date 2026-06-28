import type { Metadata } from 'next'
import Link from 'next/link'
import { CompanyTrustBadge } from '@/components/CompanyTrustBadge'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import { companyIdentifier, companyLegalName } from '@/lib/data/company'
import { siteBrandName, siteContactWhatsappUrl, siteKeywords } from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildFaqStructuredData, buildRobotsMetadata, buildSeoKeywords } from '@/lib/utils/seo'

const title = 'Product Authenticity | Nothing Pakistan'
const description =
  'Learn how Nothing Pakistan verifies products, supports customers, and helps buyers shop safely.'

const faqs = [
  {
    question: 'How does Nothing Pakistan approach product authenticity?',
    answer:
      'Nothing Pakistan uses careful sourcing, packaging checks, product detail review, invoice expectations, and support guidance to help customers shop safely. Customers can also review the company verification page before buying.',
  },
  {
    question: 'Should I check seller identity before buying?',
    answer:
      'Yes. Customers should check the seller name, website, support channel, return policy, payment instructions, and business identity before ordering Nothing or CMF products online.',
  },
  {
    question: 'Does company information prove distributor authorization?',
    answer:
      'No. Business information helps confirm who operates the storefront. It should not be treated as distributor authorization unless separate authorization proof is published.',
  },
  {
    question: 'What should I check when a product arrives?',
    answer:
      'Check packaging condition, invoice or order record, model name, accessories in the box, seal condition where applicable, and whether the delivered item matches the product page and order confirmation.',
  },
] as const

const checkItems = [
  'Confirm the product name, color, variant, and compatibility before checkout.',
  'Ask support about packaging, warranty expectations, delivery timing, and return conditions.',
  'Review the company verification page and contact details before payment.',
  'Keep order confirmation, invoice details, and support messages for reference.',
  'Inspect the delivered product before regular use and report issues quickly.',
]

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
  keywords: buildSeoKeywords(siteKeywords, ['Nothing product authenticity Pakistan', 'CMF original products Pakistan', companyLegalName]),
  alternates: {
    canonical: buildAbsoluteUrl('/authenticity'),
  },
  openGraph: {
    title,
    description,
    url: buildAbsoluteUrl('/authenticity'),
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

export default function AuthenticityPage() {
  const structuredData = [
    buildBreadcrumbStructuredData([
      { label: 'Home', href: '/' },
      { label: 'Product Authenticity', href: '/authenticity' },
    ]),
    buildFaqStructuredData(faqs),
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': buildAbsoluteUrl('/authenticity#webpage'),
      name: title,
      url: buildAbsoluteUrl('/authenticity'),
      description,
      about: {
        '@id': buildAbsoluteUrl('/#organization'),
        name: siteBrandName,
        legalName: companyLegalName,
        identifier: companyIdentifier,
      },
    },
  ].filter(Boolean) as Record<string, unknown>[]

  return (
      <div className="support-centre-official">
        <SeoStructuredData data={structuredData} />
        <NothingHeader />

        <main className="pt-20">
          <section className="border-b border-black/10 px-4 py-12 md:px-8 md:py-16">
            <div className="mx-auto grid max-w-screen-2xl gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end">
              <div className="max-w-4xl">
                <p className="text-[10px] uppercase tracking-[0.34em] text-black/45">Product Authenticity</p>
                <h1 className="mt-4 text-5xl font-semibold leading-[0.94] tracking-[-0.04em] text-black sm:text-6xl">
                  Shop Nothing and CMF products with clearer checks.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-black/68">
                  Authenticity is not just a label on a product page. It is a process that includes sourcing discipline, packaging review, order records, customer support, and a verified business identity. Nothing Pakistan publishes this guide so buyers know what to check before and after ordering.
                </p>
              </div>
              <CompanyTrustBadge />
            </div>
          </section>

          <section className="px-4 py-12 md:px-8 md:py-16">
            <div className="mx-auto grid max-w-screen-2xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <article className="space-y-8">
                <section className="rounded-[8px] border border-black/10 bg-white p-5">
                  <p className="text-[10px] uppercase tracking-[0.26em] text-black/42">Direct Answer</p>
                  <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-black">How should buyers check authenticity?</h2>
                  <p className="mt-3 text-sm leading-7 text-black/68">
                    Buyers should check the seller identity, company verification page, product packaging, model compatibility, invoice or order record, warranty expectations, and return policy before buying. Nothing Pakistan also publishes company details for business transparency.
                  </p>
                </section>

                <section className="border-t border-black/10 pt-8">
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">How We Source Products</h2>
                  <div className="mt-5 space-y-5 text-sm leading-8 text-black/70">
                    <p>
                      Nothing Pakistan focuses on Nothing and CMF products that match customer demand in Pakistan, including phones, earbuds, chargers, cables, screen protectors, covers, and accessories. Product sourcing is treated as a practical trust workflow: confirm the product type, match the model name, review packaging expectations, and publish product information in a way that helps the customer make a careful decision.
                    </p>
                    <p>
                      We avoid naming or attacking competitors. Instead, we encourage buyers to compare seller identity, support quality, return rules, and product details. A professional buying decision should be based on verifiable signals rather than fear-based language. Customers should always ask questions when a listing is unclear, a price seems unusual, or payment instructions do not match the published storefront.
                    </p>
                  </div>
                </section>

                <section className="border-t border-black/10 pt-8">
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">What Customers Should Check Before Buying</h2>
                  <ul className="mt-6 grid gap-3">
                    {checkItems.map((item) => (
                      <li key={item} className="rounded-[8px] border border-black/10 bg-white p-4 text-sm leading-7 text-black/68">
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="border-t border-black/10 pt-8">
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">Product Packaging and Invoice</h2>
                  <p className="mt-5 text-sm leading-8 text-black/70">
                    When a product arrives, check that the model name, color, variant, and included accessories match your order. Keep the order confirmation and any invoice or payment record. For earbuds, chargers, cables, and protectors, inspect the packaging condition and report issues quickly before regular use. Packaging can vary by market and product batch, so the strongest approach is to compare the delivered product against the product page, order confirmation, and support guidance.
                  </p>
                </section>

                <section className="border-t border-black/10 pt-8">
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">Warranty and Return Expectations</h2>
                  <p className="mt-5 text-sm leading-8 text-black/70">
                    Warranty and return expectations should be reviewed before checkout. Some products may have manufacturer-led support, seller support, replacement review, or product-specific restrictions. If an item arrives damaged, incorrect, or defective, contact support quickly with order details, photos, packaging information, and a clear explanation of the issue. Clear reporting helps the support team review the case faster.
                  </p>
                </section>

                <section className="border-t border-black/10 pt-8">
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">Why Clear Business Information Matters</h2>
                  <div className="mt-5 space-y-5 text-sm leading-8 text-black/70">
                    <p>
                      A clear company identity gives customers a stronger reference point. Nothing Pakistan is operated by {companyLegalName} with {companyIdentifier}. This does not replace normal product checks, but it does make business identity visible before a customer places an order.
                    </p>
                    <p>
                      Customers can review the company verification page and compare the legal company name with support communication. This is useful because it connects the storefront to a consistent business identity.
                    </p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/company-verification"
                      className="inline-flex h-11 items-center justify-center rounded-[8px] bg-black px-5 text-[10px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85"
                    >
                      Company Verification
                    </Link>
                    <Link
                      href={siteContactWhatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center justify-center rounded-[8px] border border-black/12 px-5 text-[10px] uppercase tracking-[0.2em] text-black transition-colors hover:bg-black hover:text-white"
                    >
                      Ask Support
                    </Link>
                  </div>
                </section>

                <section className="border-t border-black/10 pt-8">
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">FAQs</h2>
                  <div className="mt-6 divide-y divide-black/10 rounded-[8px] border border-black/10 bg-white">
                    {faqs.map((faq) => (
                      <details key={faq.question} className="px-5 py-5">
                        <summary className="cursor-pointer list-none text-base font-medium text-black">{faq.question}</summary>
                        <p className="mt-3 text-sm leading-7 text-black/68">{faq.answer}</p>
                      </details>
                    ))}
                  </div>
                </section>
              </article>

              <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                <section className="rounded-[8px] border border-black/10 bg-white p-5">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">Shop by Category</p>
                  <div className="mt-4 grid gap-2">
                    {[
                      { label: 'Phones', href: '/collections/phones' },
                      { label: 'Audio', href: '/collections/nothing-pakistan-audio' },
                      { label: 'Chargers', href: '/collections/chargers' },
                      { label: 'Protectors', href: '/collections/protectors' },
                      { label: 'Accessories', href: '/collections/nothing-pakistan-accessories' },
                      { label: 'CMF', href: '/collections/nothing-pakistan-cmf' },
                    ].map((item) => (
                      <Link key={item.href} href={item.href} className="rounded-[8px] border border-black/10 px-4 py-3 text-sm text-black/68 transition-colors hover:bg-black hover:text-white">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </section>
              </aside>
            </div>
          </section>
        </main>

        <NothingFooter />
      </div>
  )
}
