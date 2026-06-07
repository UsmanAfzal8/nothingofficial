import type { Metadata } from 'next'
import Image from 'next/image'
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
  companyOfficialDomains,
  companyVerificationPath,
} from '@/lib/data/company'
import { siteBrandName, siteContactAddress, siteContactWhatsappUrl, siteKeywords } from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildRobotsMetadata, buildSeoKeywords } from '@/lib/utils/seo'

const title = 'About Nothing Pakistan | Official Storefront'
const description =
  'Learn about Nothing Pakistan, the verified Pakistan storefront operated by NOTHING PAKISTAN (SMC-PRIVATE) LIMITED.'

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

const aboutImages = {
  hero: 'https://res.cloudinary.com/dklsubnzb/image/upload/v1780538009/nothing-official-store-pakistan/reference/about-brand-hero.png',
  event: 'https://res.cloudinary.com/dklsubnzb/image/upload/v1780538012/nothing-official-store-pakistan/reference/about-brand-event.jpg',
} as const

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
          <section className="relative min-h-[calc(100svh-5rem)] overflow-hidden border-b border-black/10 px-4 py-16 md:px-8">
            <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:radial-gradient(circle,#111_1px,transparent_1.4px)] [background-position:2rem_2rem] [background-size:8rem_8rem]" />
            <div className="relative mx-auto grid max-w-screen-2xl gap-10 lg:grid-cols-[minmax(0,1fr)_42vw] lg:items-end">
              <div>
                <div className="h-4 w-4 bg-[#c8343b]" aria-hidden="true" />
                <h1 className="mt-6 max-w-5xl [font-family:var(--font-georgia)] text-[clamp(3.1rem,7vw,7.4rem)] leading-[0.94] text-black">
                  Nothing Pakistan brings Nothing and CMF products closer to customers in Pakistan.
                </h1>
              </div>
              <div className="relative min-h-[360px] overflow-hidden rounded-[8px] bg-black lg:min-h-[620px]">
                <Image
                  src={aboutImages.hero}
                  alt="Nothing Pakistan brand story"
                  fill
                  priority
                  fetchPriority="high"
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                />
              </div>
            </div>
          </section>

          <section className="px-4 py-14 md:px-8 md:py-20">
            <div className="mx-auto grid max-w-screen-2xl gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
              <article className="space-y-14">
                {sections.map((section, index) => (
                  <section key={section.title} className="grid gap-5 border-t border-black/10 pt-8 md:grid-cols-[120px_minmax(0,1fr)]">
                    <p className="dot-heading text-4xl leading-none text-black/70">( {index + 1} )</p>
                    <div>
                      <h2 className="[font-family:var(--font-georgia)] text-4xl leading-tight text-black sm:text-5xl">{section.title}</h2>
                      <p className="mt-5 max-w-4xl text-sm leading-8 text-black/70 sm:text-base">{section.body}</p>
                    </div>
                  </section>
                ))}

                <section className="relative min-h-[420px] overflow-hidden rounded-[8px] bg-black">
                  <Image
                    src={aboutImages.event}
                    alt="Nothing Pakistan community and brand event"
                    fill
                    loading="lazy"
                    fetchPriority="low"
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 900px"
                    className="object-cover"
                  />
                </section>

                <section className="grid gap-5 border-t border-black/10 pt-8 md:grid-cols-[120px_minmax(0,1fr)]">
                  <p className="dot-heading text-4xl leading-none text-black/70">( PK )</p>
                  <div>
                    <h2 className="[font-family:var(--font-georgia)] text-4xl leading-tight text-black sm:text-5xl">Lahore store and Pakistan support.</h2>
                    <p className="mt-5 max-w-4xl text-sm leading-8 text-black/70 sm:text-base">
                      Our pickup and support location is {siteContactAddress}. Customers can order for delivery across Pakistan or choose pickup from Garden Town after stock and payment confirmation.
                    </p>
                  </div>
                </section>
              </article>

              <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                <CompanyTrustBadge />
                <section className="rounded-[8px] border border-black/10 bg-white p-5">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">Legal Identity</p>
                  <p className="mt-3 text-sm leading-7 text-black/74">{companyLegalName}</p>
                  <p className="mt-2 text-sm text-black/58">{companyIdentifier}</p>
                </section>
                <section className="rounded-[8px] border border-black/10 bg-white p-5">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">Official domains</p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-black/72">{companyOfficialDomains.join('\n')}</p>
                </section>
                <div className="grid gap-2">
                  <Link href={companyVerificationPath} className="inline-flex h-11 items-center justify-center rounded-[4px] bg-black px-5 text-[10px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85">
                    Company Verification
                  </Link>
                  <Link href={siteContactWhatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center rounded-[4px] border border-black/12 px-5 text-[10px] uppercase tracking-[0.2em] text-black transition-colors hover:bg-black hover:text-white">
                    WhatsApp Support
                  </Link>
                  <Link href={companyCertificateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center rounded-[4px] border border-black/12 px-5 text-[10px] uppercase tracking-[0.2em] text-black transition-colors hover:bg-black hover:text-white">
                    View Certificate PDF
                  </Link>
                </div>
              </aside>
            </div>
          </section>
        </main>

        <NothingFooter />
      </div>
    </InterTypographyScope>
  )
}
