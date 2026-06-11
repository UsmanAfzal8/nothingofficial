import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { CompanyTrustBadge } from '@/components/CompanyTrustBadge'
import { InterTypographyScope } from '@/components/InterTypographyScope'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import {
  buildCompanyPersonStructuredData,
  companyIdentifier,
  companyLegalName,
  companyOwnerImageAlt,
  companyOwnerImageUrl,
  companyOwnerName,
  companyOwnerRole,
  companySocialLinks,
} from '@/lib/data/company'
import { siteBrandName, siteKeywords } from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildRobotsMetadata, buildSeoKeywords } from '@/lib/utils/seo'

const title = 'Usman Afzal | CEO of Nothing Pakistan'
const description =
  'CEO profile for Usman Afzal of Nothing Pakistan and NOTHING PAKISTAN (SMC-PRIVATE) LIMITED company verification.'

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
  keywords: buildSeoKeywords(siteKeywords, [companyOwnerName, companyLegalName, 'Nothing Pakistan CEO']),
  alternates: {
    canonical: buildAbsoluteUrl('/authors/usman-afzal'),
  },
  openGraph: {
    title,
    description,
    url: buildAbsoluteUrl('/authors/usman-afzal'),
    type: 'profile',
    images: [companyOwnerImageUrl],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [companyOwnerImageUrl],
  },
  robots: buildRobotsMetadata(),
}

export default function UsmanAfzalAuthorPage() {
  const hasSocialLinks = companySocialLinks.length > 0

  const structuredData = [
    buildCompanyPersonStructuredData(),
    buildBreadcrumbStructuredData([
      { label: 'Home', href: '/' },
      { label: 'Authors', href: '/authors/usman-afzal' },
      { label: companyOwnerName, href: '/authors/usman-afzal' },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      '@id': buildAbsoluteUrl('/authors/usman-afzal#profile'),
      name: title,
      url: buildAbsoluteUrl('/authors/usman-afzal'),
      mainEntity: {
        '@id': buildAbsoluteUrl('/authors/usman-afzal#person'),
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
            <div className="mx-auto grid max-w-screen-2xl gap-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-end">
              <div className="overflow-hidden rounded-[8px] border border-black/10 bg-white">
                <Image
                  src={companyOwnerImageUrl}
                  alt={companyOwnerImageAlt}
                  width={720}
                  height={720}
                  priority
                  sizes="(max-width: 1024px) 100vw, 360px"
                  className="aspect-square w-full object-cover"
                />
              </div>
              <div className="max-w-4xl">
                <p className="text-[10px] uppercase tracking-[0.34em] text-black/45">{companyOwnerRole}</p>
                <h1 className="mt-4 text-5xl font-semibold leading-[0.94] tracking-[-0.04em] text-black sm:text-6xl">
                  {companyOwnerName}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-black/68">
                  {companyOwnerName} is the CEO of {siteBrandName}. He leads the store operated by {companyLegalName}, the SECP registered Pakistani company behind the Nothing Pakistan storefront.
                </p>
              </div>
            </div>
          </section>

          <section className="px-4 py-12 md:px-8 md:py-16">
            <div className="mx-auto grid max-w-screen-2xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <article className="space-y-8">
                <section className="rounded-[8px] border border-black/10 bg-white p-5">
                  <p className="text-[10px] uppercase tracking-[0.26em] text-black/42">Direct Answer</p>
                  <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-black">Who is Usman Afzal?</h2>
                  <p className="mt-3 text-sm leading-7 text-black/68">
                    Usman Afzal is the CEO of Nothing Pakistan and leads the customer experience, support, product availability, and company transparency for the store in Pakistan.
                  </p>
                </section>

                <section className="border-t border-black/10 pt-8">
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">Role and Store Mission</h2>
                  <p className="mt-5 text-sm leading-8 text-black/70">
                    Usman Afzal leads the company mission to provide Nothing and CMF products, responsive customer support, clear product information, and trusted online shopping in Pakistan. The role includes keeping the storefront focused on product clarity, safe ordering, support responsiveness, business identity transparency, and customer-first policies.
                  </p>
                </section>

                <section className="border-t border-black/10 pt-8">
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">Experience With Tech Products and eCommerce</h2>
                  <div className="mt-5 space-y-5 text-sm leading-8 text-black/70">
                    <p>
                      The Nothing Pakistan content strategy is built around practical eCommerce experience: customers want to know the price in Pakistan, what is in the box, which phone a product supports, how delivery works, what payment methods are available, and what happens if the item is damaged, incorrect, or unsuitable. Product pages and buying guides are written to answer those questions directly.
                    </p>
                    <p>
                      This profile helps customers, search engines, and AI assistants understand who leads the business behind the store. Nothing Pakistan connects product guides and trust pages to a visible CEO, a legal company name, and a company verification page.
                    </p>
                  </div>
                </section>

                <section className="border-t border-black/10 pt-8">
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">Company Connection</h2>
                  <p className="mt-5 text-sm leading-8 text-black/70">
                    The legal company name behind the storefront is {companyLegalName}. The company is listed with {companyIdentifier}. Customers can review the company verification page for certificate details, incorporation date, and the SECP certificate link before placing an order.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/company-verification"
                      className="inline-flex h-11 items-center justify-center rounded-[8px] bg-black px-5 text-[10px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85"
                    >
                      SECP Verification
                    </Link>
                    <Link
                      href="/blog"
                      className="inline-flex h-11 items-center justify-center rounded-[8px] border border-black/12 px-5 text-[10px] uppercase tracking-[0.2em] text-black transition-colors hover:bg-black hover:text-white"
                    >
                      Read Guides
                    </Link>
                  </div>
                </section>

                {hasSocialLinks ? (
                  <section className="border-t border-black/10 pt-8">
                    <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">Social Links</h2>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {companySocialLinks.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-[8px] border border-black/10 px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-black/64 transition-colors hover:bg-black hover:text-white"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </section>
                ) : null}
              </article>

              <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                <CompanyTrustBadge />
              </aside>
            </div>
          </section>
        </main>

        <NothingFooter />
      </div>
    </InterTypographyScope>
  )
}
