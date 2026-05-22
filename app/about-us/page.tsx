import type { Metadata } from 'next'
import Link from 'next/link'
import { CompanyTrustBadge } from '@/components/CompanyTrustBadge'
import { InterTypographyScope } from '@/components/InterTypographyScope'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import {
  buildCompanyOrganizationStructuredData,
  companyCertificateUrl,
  companyIdentifier,
  companyLegalName,
  companyVerificationPath,
} from '@/lib/data/company'
import { siteBrandName, siteContactWhatsappUrl, siteKeywords } from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildRobotsMetadata, buildSeoKeywords } from '@/lib/utils/seo'

const title = 'About Nothing Pakistan | SECP Registered Storefront'
const description =
  'Learn about Nothing Pakistan, the storefront operated by NOTHING OFFICIAL (SMC-PRIVATE) LIMITED, an SECP registered Pakistani company.'

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
  keywords: buildSeoKeywords(siteKeywords, ['About Nothing Pakistan', companyLegalName, 'SECP registered Pakistani company']),
  alternates: {
    canonical: buildAbsoluteUrl('/about-us'),
  },
  openGraph: {
    title,
    description,
    url: buildAbsoluteUrl('/about-us'),
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

const sections = [
  {
    title: 'Who We Are',
    body:
      `Nothing Pakistan is an online storefront created for customers in Pakistan who want a clearer way to discover Nothing and CMF phones, earbuds, chargers, cables, screen protectors, covers, and accessories. The storefront is operated by ${companyLegalName}, an SECP registered Pakistani company with ${companyIdentifier}. We publish this legal identity because customers deserve to know the business behind the website before they place an order, request support, or rely on product information.`,
  },
  {
    title: 'Why Nothing Pakistan Exists',
    body:
      'Nothing and CMF products have a distinctive design language, strong demand, and an active community of buyers who care about compatibility, packaging, charging standards, audio features, and model-specific accessories. In Pakistan, shoppers often need help checking which charger suits a phone, which protector fits a device, or whether an earbud model matches their usage. Nothing Pakistan exists to make that buying journey easier, more organized, and more transparent.',
  },
  {
    title: 'Our Product Authenticity Approach',
    body:
      'Our authenticity approach starts with careful product selection, clear product pages, original-style packaging checks, invoices where applicable, and support that helps buyers confirm what they are ordering. We avoid exaggerated language and do not claim direct authorization from Nothing Technology Limited unless separate authorization proof is published. Instead, we focus on visible business identity, product detail quality, customer support, and practical buying guidance.',
  },
  {
    title: 'Pakistan-Based Support',
    body:
      'Customers in Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, and other cities need support that understands local delivery expectations and payment preferences. Nothing Pakistan provides WhatsApp-first communication, order confirmation, product compatibility help, and delivery guidance for Pakistani customers. Our goal is to reduce confusion before dispatch so customers receive the right product for the right device.',
  },
  {
    title: 'Customer-First Policy',
    body:
      'A customer-first store makes important information easy to find before payment. That includes pricing in PKR, delivery expectations, return and refund rules, warranty guidance, support routes, and company verification. We encourage customers to ask questions before ordering and to review policy pages carefully, especially when ordering accessories for a specific phone model or buying higher-value products.',
  },
]

const principles = [
  'Publish the legal company name and SECP registration details openly.',
  'Use product pages to explain compatibility, delivery, returns, and support.',
  'Keep customer safety guidance professional and factual.',
  'Help buyers verify seller authenticity before placing an order.',
  'Avoid making authorization claims unless proof is published.',
]

export default function AboutUsPage() {
  const structuredData = [
    buildCompanyOrganizationStructuredData(),
    buildBreadcrumbStructuredData([
      { label: 'Home', href: '/' },
      { label: 'About Us', href: '/about-us' },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      '@id': buildAbsoluteUrl('/about-us#webpage'),
      name: title,
      url: buildAbsoluteUrl('/about-us'),
      description,
      about: {
        '@id': buildAbsoluteUrl('/#organization'),
        name: siteBrandName,
        legalName: companyLegalName,
        identifier: companyIdentifier,
      },
    },
  ]

  return (
    <InterTypographyScope>
      <div className="min-h-screen overflow-x-hidden bg-[#f4f4f0] text-[#111]">
        <SeoStructuredData data={structuredData} />
        <NothingHeader />

        <main className="pt-20">
          <section className="border-b border-black/10 px-4 py-12 md:px-8 md:py-16">
            <div className="mx-auto grid max-w-screen-2xl gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
              <div className="max-w-4xl">
                <p className="text-[10px] uppercase tracking-[0.34em] text-black/45">About Nothing Pakistan</p>
                <h1 className="mt-4 text-5xl font-semibold leading-[0.94] tracking-[-0.04em] text-black sm:text-6xl">
                  A verified storefront for Nothing and CMF shoppers in Pakistan.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-black/68">
                  Nothing Pakistan brings product discovery, support, delivery guidance, and company verification into one place. We serve customers who want to shop with clearer business identity, practical product information, and support rooted in Pakistan.
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
                  <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-black">Who operates Nothing Pakistan?</h2>
                  <p className="mt-3 text-sm leading-7 text-black/68">
                    Nothing Pakistan is operated by {companyLegalName}, an SECP registered Pakistani company with {companyIdentifier}. The storefront publishes company verification, contact information, support routes, and policy pages so buyers can review business identity before ordering.
                  </p>
                </section>

                {sections.map((section) => (
                  <section key={section.title} className="border-t border-black/10 pt-8">
                    <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">{section.title}</h2>
                    <p className="mt-5 text-sm leading-8 text-black/70">{section.body}</p>
                  </section>
                ))}

                <section className="border-t border-black/10 pt-8">
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">What Customers Can Expect</h2>
                  <div className="mt-5 space-y-5 text-sm leading-8 text-black/70">
                    <p>
                      Customers can expect product pages that explain pricing, key features, compatibility, delivery notes, WhatsApp ordering, and return expectations. Collections are organized around phones, audio, chargers, protectors, accessories, CMF products, and the full catalog so shoppers can move from a broad category to a specific product with fewer dead ends.
                    </p>
                    <p>
                      We also maintain a company verification page because brand trust is not just visual design. It is built through consistent identity, support details, policy clarity, and responsible wording. Customers should verify seller authenticity before buying from any online technology store, and we make that easier by linking our SECP certificate and company details from key pages.
                    </p>
                  </div>
                </section>

                <section className="border-t border-black/10 pt-8">
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">Operating Principles</h2>
                  <ul className="mt-6 grid gap-3">
                    {principles.map((principle) => (
                      <li key={principle} className="rounded-[8px] border border-black/10 bg-white p-4 text-sm leading-7 text-black/68">
                        {principle}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="border-t border-black/10 pt-8">
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">Verification and Certificate</h2>
                  <p className="mt-5 text-sm leading-8 text-black/70">
                    The company verification page lists the legal company name, CUIN, registered authority, incorporation date, company type, country, website, CEO details, and certificate access. Customers can open the certificate directly from the verification page.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={companyVerificationPath}
                      className="inline-flex h-11 items-center justify-center rounded-[8px] bg-black px-5 text-[10px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85"
                    >
                      Company Verification
                    </Link>
                    <Link
                      href={companyCertificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center justify-center rounded-[8px] border border-black/12 px-5 text-[10px] uppercase tracking-[0.2em] text-black transition-colors hover:bg-black hover:text-white"
                    >
                      View Certificate PDF
                    </Link>
                    <Link
                      href={siteContactWhatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center justify-center rounded-[8px] border border-black/12 px-5 text-[10px] uppercase tracking-[0.2em] text-black transition-colors hover:bg-black hover:text-white"
                    >
                      WhatsApp Support
                    </Link>
                  </div>
                </section>
              </article>

              <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                <section className="rounded-[8px] border border-black/10 bg-white p-5">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">Legal Identity</p>
                  <p className="mt-3 text-sm leading-7 text-black/74">{companyLegalName}</p>
                  <p className="mt-2 text-sm text-black/58">{companyIdentifier}</p>
                </section>
                <section className="rounded-[8px] border border-black/10 bg-white p-5">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">Helpful Links</p>
                  <div className="mt-4 grid gap-2">
                    {[
                      { label: 'Shop All', href: '/collections/shop-all' },
                      { label: 'Phones', href: '/collections/phones' },
                      { label: 'Audio', href: '/collections/audio' },
                      { label: 'Support Centre', href: '/support-centre' },
                      { label: 'Contact Us', href: '/contact-us' },
                      { label: 'Authenticity', href: '/authenticity' },
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
    </InterTypographyScope>
  )
}
