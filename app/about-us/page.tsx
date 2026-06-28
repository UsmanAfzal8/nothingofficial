import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import {
  buildCompanyOrganizationStructuredData,
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
  keywords: buildSeoKeywords(siteKeywords, ['About Nothing Pakistan', companyLegalName, 'Nothing Pakistan store information']),
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
      `Nothing Pakistan is an online storefront created for customers in Pakistan who want a clearer way to discover Nothing and CMF phones, earbuds, chargers, cables, screen protectors, covers, and accessories. The storefront is operated by ${companyLegalName} with ${companyIdentifier}. We publish this legal identity because customers deserve to know the business behind the website before they place an order, request support, or rely on product information.`,
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
  hero: 'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto:eco,w_1400,c_limit/v1780538009/nothing-official-store-pakistan/reference/about-brand-hero.png',
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
    <div className="support-centre-official">
      <SeoStructuredData data={structuredData} />
      <NothingHeader />

      <main>
        <section className="support-hero company-verification-hero">
          <div className="support-hero-copy">
            <p className="company-verification-kicker">About Nothing Pakistan</p>
            <h1>Nothing Pakistan brings Nothing and CMF products closer to customers in Pakistan.</h1>
            <p>
              Nothing Pakistan is operated by {companyLegalName}. This page explains the store mission, product focus, local support approach, and the practical information customers can review before ordering.
            </p>
          </div>
        </section>

        <div className="support-content company-verification-content">
          <section className="company-verification-section" aria-labelledby="about-story-title">
            <h2 id="about-story-title">Who we are</h2>
            <div className="company-verification-copy">
              <p>{sections[0]?.body}</p>
            </div>
          </section>

          <section className="company-verification-section" aria-labelledby="about-image-title">
            <h2 id="about-image-title">Brand story</h2>
            <div className="mt-10 overflow-hidden rounded-[8px] border border-black/10 bg-white">
              <div className="relative min-h-[320px] md:min-h-[420px]">
                <Image
                  src={aboutImages.hero}
                  alt="Nothing Pakistan brand story"
                  fill
                  priority
                  fetchPriority="high"
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 940px"
                  className="object-cover"
                />
              </div>
            </div>
          </section>

          {sections.slice(1).map((section) => (
            <section key={section.title} className="company-verification-section" aria-labelledby={section.title.toLowerCase().replace(/\s+/g, '-')}>
              <h2 id={section.title.toLowerCase().replace(/\s+/g, '-')}>{section.title}</h2>
              <div className="company-verification-copy">
                <p>{section.body}</p>
              </div>
            </section>
          ))}

          <section className="company-verification-section" aria-labelledby="about-community-title">
            <h2 id="about-community-title">Community and support</h2>
            <div className="mt-10 overflow-hidden rounded-[8px] border border-black/10 bg-white">
              <div className="relative min-h-[320px] md:min-h-[420px]">
                <Image
                  src={aboutImages.event}
                  alt="Nothing Pakistan community and brand event"
                  fill
                  loading="lazy"
                  fetchPriority="low"
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 940px"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="company-verification-copy">
              <p>
                Our pickup and support location is {siteContactAddress}. Customers can order for delivery across Pakistan or choose pickup from Garden Town after stock and payment confirmation.
              </p>
            </div>
          </section>

          <section className="company-verification-registered" aria-label="About Nothing Pakistan summary">
            <p>Store Summary</p>
            <dl>
              <div>
                <dt>Legal name</dt>
                <dd>{companyLegalName}</dd>
              </div>
              <div>
                <dt>Company ID</dt>
                <dd>{companyIdentifier}</dd>
              </div>
              <div>
                <dt>Official domains</dt>
                <dd className="whitespace-pre-line">{companyOfficialDomains.join('\n')}</dd>
              </div>
              <div>
                <dt>Pickup location</dt>
                <dd>{siteContactAddress}</dd>
              </div>
            </dl>
          </section>

          <section className="support-contact-section" aria-labelledby="about-next-steps-title">
            <h2 id="about-next-steps-title">Helpful next steps</h2>
            <div className="support-quick-links">
              <Link href={companyVerificationPath}>Company Verification</Link>
              <Link href={siteContactWhatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp Support</Link>
              <Link href="/support-centre">Support Centre</Link>
            </div>
          </section>
        </div>
      </main>

      <NothingFooter />
    </div>
  )
}
