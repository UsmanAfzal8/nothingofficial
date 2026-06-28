import type { Metadata } from 'next'
import Link from 'next/link'
import { CompanyTrustBadge } from '@/components/CompanyTrustBadge'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import {
  companyIdentifier,
  companyLegalName,
  companySupportEmail,
  companySupportHours,
} from '@/lib/data/company'
import {
  buildContactPageStructuredData,
  siteBrandName,
  siteContactAddress,
  siteContactDisplayPhone,
  siteContactPhone,
  siteContactWhatsappUrl,
  siteKeywords,
  socialLinks,
} from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildRobotsMetadata, buildSeoKeywords } from '@/lib/utils/seo'

const title = 'Contact Nothing Pakistan | Support & Verification'
const description =
  'Contact Nothing Pakistan for orders, WhatsApp support, Lahore location, business details, customer safety, delivery, and return guidance.'

const lahoreStoreMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteContactAddress)}`
const lahoreStoreEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(siteContactAddress)}&z=16&output=embed`

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
  keywords: buildSeoKeywords(siteKeywords, ['Contact Nothing Pakistan', 'Nothing Pakistan WhatsApp', companyLegalName]),
  alternates: {
    canonical: buildAbsoluteUrl('/contact-us'),
  },
  openGraph: {
    title,
    description,
    url: buildAbsoluteUrl('/contact-us'),
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

const contactRows = [
  { label: 'Legal company name', value: companyLegalName },
  { label: 'Company ID', value: companyIdentifier },
  { label: 'Phone', value: siteContactDisplayPhone },
  { label: 'WhatsApp support', value: siteContactDisplayPhone },
  { label: 'Email', value: companySupportEmail },
  { label: 'Support hours', value: companySupportHours },
  { label: 'Address', value: siteContactAddress },
] as const

export default function ContactUsPage() {
  const structuredData = [
    buildContactPageStructuredData(),
    buildBreadcrumbStructuredData([
      { label: 'Home', href: '/' },
      { label: 'Contact Us', href: '/contact-us' },
    ]),
  ]
  const hasSocialLinks = socialLinks.length > 0

  return (
      <div className="support-centre-official">
        <SeoStructuredData data={structuredData} />
        <NothingHeader />

        <main className="pt-20">
          <section className="border-b border-black/10 px-4 py-12 md:px-8 md:py-16">
            <div className="mx-auto grid max-w-screen-2xl gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end">
              <div className="max-w-4xl">
                <p className="text-[10px] uppercase tracking-[0.34em] text-black/45">Contact {siteBrandName}</p>
                <h1 className="mt-4 text-5xl font-semibold leading-[0.94] tracking-[-0.04em] text-black sm:text-6xl">
                  Support, orders, and verified business information.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-black/68">
                  Use this page to contact Nothing Pakistan for product questions, order support, delivery guidance, return expectations, and company verification. The storefront is operated by {companyLegalName} with {companyIdentifier}.
                </p>
              </div>
              <CompanyTrustBadge />
            </div>
          </section>

          <section className="px-4 py-12 md:px-8 md:py-16">
            <div className="mx-auto grid max-w-screen-2xl gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
              <article className="space-y-8">
                <section className="rounded-[8px] border border-black/10 bg-white p-5">
                  <p className="text-[10px] uppercase tracking-[0.26em] text-black/42">Direct Answer</p>
                  <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-black">How can I contact Nothing Pakistan?</h2>
                  <p className="mt-3 text-sm leading-7 text-black/68">
                    You can contact Nothing Pakistan by phone or WhatsApp at {siteContactDisplayPhone}. For order questions, product compatibility, delivery information, returns, and company verification, use WhatsApp first so the support team can review your product and city details clearly.
                  </p>
                </section>

                <section className="border-t border-black/10 pt-8">
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">Contact and Business Details</h2>
                  <div className="mt-6 overflow-hidden rounded-[8px] border border-black/10 bg-white">
                    <table className="w-full border-collapse text-left text-sm">
                      <tbody>
                        {contactRows.map((row) => (
                          <tr key={row.label} className="border-b border-black/8 last:border-b-0">
                            <th className="w-[34%] bg-[#f8f8f4] px-4 py-4 font-medium text-black/72">{row.label}</th>
                            <td className="break-words px-4 py-4 text-black/68">{row.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="border-t border-black/10 pt-8">
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">What Support Can Help With</h2>
                  <div className="mt-5 space-y-5 text-sm leading-8 text-black/70">
                    <p>
                      Support can help you confirm product availability, price in Pakistan, compatible phone models, charger requirements, audio model differences, delivery expectations, payment options, and return policy basics. If you are buying a protector, cover, charger, or earbuds for a specific phone, share the exact phone model before placing your order.
                    </p>
                    <p>
                      WhatsApp support is useful when you need a faster answer before checkout. You can send product links, screenshots, city details, and questions about COD or bank transfer. For clear order handling, keep your conversation on the same support channel until dispatch and delivery are confirmed.
                    </p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={siteContactWhatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center justify-center rounded-[8px] bg-black px-5 text-[10px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85"
                    >
                      Open WhatsApp
                    </Link>
                    <a
                      href={`tel:${siteContactPhone}`}
                      className="inline-flex h-11 items-center justify-center rounded-[8px] border border-black/12 px-5 text-[10px] uppercase tracking-[0.2em] text-black transition-colors hover:bg-black hover:text-white"
                    >
                      Call Support
                    </a>
                    <Link
                      href="/company-verification"
                      className="inline-flex h-11 items-center justify-center rounded-[8px] border border-black/12 px-5 text-[10px] uppercase tracking-[0.2em] text-black transition-colors hover:bg-black hover:text-white"
                    >
                      Company Verification
                    </Link>
                  </div>
                </section>

                <section className="border-t border-black/10 pt-8">
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">Customer Safety Note</h2>
                  <p className="mt-5 text-sm leading-8 text-black/70">
                    Before buying any Nothing or CMF product online, customers should verify seller authenticity, business identity, support channels, payment instructions, delivery terms, and return expectations. Nothing Pakistan publishes its company information so customers can review the business behind the storefront.
                  </p>
                </section>
              </article>

              <aside id="lahore-store" className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                <section className="overflow-hidden rounded-[8px] border border-black/10 bg-white">
                  <div className="border-b border-black/10 p-5">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">Lahore Location</p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-black">Nothing Pakistan</h2>
                    <p className="mt-3 text-sm leading-7 text-black/68">{siteContactAddress}</p>
                  </div>
                  <iframe
                    title="Nothing Pakistan Lahore location map"
                    src={lahoreStoreEmbedUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-[360px] w-full"
                  />
                  <div className="border-t border-black/10 p-5">
                    <Link
                      href={lahoreStoreMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center justify-center rounded-[8px] bg-black px-4 text-[10px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85"
                    >
                      Open Map
                    </Link>
                  </div>
                </section>

                {hasSocialLinks ? (
                  <section className="rounded-[8px] border border-black/10 bg-white p-5">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">Social Channels</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {socialLinks.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-[8px] border border-black/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-black/62 transition-colors hover:bg-black hover:text-white"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </section>
                ) : null}
              </aside>
            </div>
          </section>
        </main>

        <NothingFooter />
      </div>
  )
}
