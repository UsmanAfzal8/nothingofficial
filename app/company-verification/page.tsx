import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { InterTypographyScope } from '@/components/InterTypographyScope'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import {
  buildCompanyCertificateStructuredData,
  buildCompanyLocalBusinessStructuredData,
  buildCompanyOrganizationStructuredData,
  buildCompanyPersonStructuredData,
  companyBusinessInfoRows,
  companyCertificateUrl,
  companyCuin,
  companyIdentifier,
  companyLegalName,
  companyOwnerImageAlt,
  companyOwnerImageUrl,
  companyOwnerName,
  companyOwnerRole,
  companyRegisteredAuthority,
  companyVerificationFaqs,
  companyWebsite,
} from '@/lib/data/company'
import { siteContactDisplayPhone } from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildFaqStructuredData, buildRobotsMetadata } from '@/lib/utils/seo'

const pageTitle = 'Company Verification | Nothing Pakistan SECP Registered'
const pageDescription =
  'Verify NOTHING OFFICIAL (SMC-PRIVATE) LIMITED, an SECP registered company in Pakistan with CUIN 0337422. View certificate and company details.'

export const metadata: Metadata = {
  title: {
    absolute: pageTitle,
  },
  description: pageDescription,
  alternates: {
    canonical: buildAbsoluteUrl('/company-verification'),
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: buildAbsoluteUrl('/company-verification'),
    type: 'website',
    images: [
      {
        url: buildAbsoluteUrl('/social/nothing-pakistan-og.jpg'),
        width: 1200,
        height: 630,
        alt: 'Nothing Pakistan company verification',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
    images: [buildAbsoluteUrl('/social/nothing-pakistan-og.jpg')],
  },
  robots: buildRobotsMetadata(),
}

export default function CompanyVerificationPage() {
  const structuredData = [
    buildCompanyOrganizationStructuredData(),
    buildCompanyLocalBusinessStructuredData(),
    buildCompanyPersonStructuredData(),
    buildCompanyCertificateStructuredData(),
    buildBreadcrumbStructuredData([
      { label: 'Home', href: '/' },
      { label: 'Company Verification', href: '/company-verification' },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': buildAbsoluteUrl('/company-verification#webpage'),
      name: 'Company Verification | Nothing Pakistan',
      url: buildAbsoluteUrl('/company-verification'),
      description: pageDescription,
      about: {
        '@id': buildAbsoluteUrl('/#organization'),
        name: companyLegalName,
        identifier: companyIdentifier,
      },
      primaryImageOfPage: buildAbsoluteUrl('/social/nothing-pakistan-og.jpg'),
      dateModified: '2026-05-21',
    },
    buildFaqStructuredData(companyVerificationFaqs),
  ].filter(Boolean) as Record<string, unknown>[]

  return (
    <InterTypographyScope>
      <div className="min-h-screen overflow-x-hidden bg-[#f4f4f0] text-[#111]">
        <SeoStructuredData data={structuredData} />
        <NothingHeader />

        <main className="pt-20">
          <section className="border-b border-black/10 px-4 pb-10 pt-8 md:px-8 md:pb-14 md:pt-12">
            <div className="mx-auto max-w-screen-2xl">
              <div className="max-w-4xl">
                <p className="text-[10px] uppercase tracking-[0.34em] text-black/45">Company Verification</p>
                <h1 className="mt-4 text-5xl font-semibold leading-[0.94] tracking-[-0.04em] text-black sm:text-6xl lg:text-7xl">
                  Nothing Pakistan is a registered Pakistani company.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-black/68">
                  Nothing Pakistan is operated by {companyLegalName}. The company is registered with the {companyRegisteredAuthority} under CUIN {companyCuin}. This page is here so customers can quickly confirm the registered business name behind the store.
                </p>
              </div>
            </div>
          </section>

          <section className="px-4 py-12 md:px-8 md:py-16">
            <div className="mx-auto grid max-w-screen-2xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <article className="space-y-8">
                <section className="rounded-[8px] border border-black/10 bg-white p-5 md:p-6">
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-black">Registration Details</h2>
                  <div className="mt-6 overflow-hidden rounded-[8px] border border-black/10">
                    <table className="w-full border-collapse text-left text-sm">
                      <tbody>
                        {companyBusinessInfoRows.map((row) => (
                          <tr key={row.label} className="border-b border-black/8 last:border-b-0">
                            <th className="w-[34%] bg-[#f8f8f4] px-4 py-4 font-medium text-black/72">{row.label}</th>
                            <td className="break-words px-4 py-4 text-black/68">{row.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="rounded-[8px] border border-black/10 bg-white p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-[-0.03em] text-black">Certificate of Incorporation</h2>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-black/68">
                        The certificate is available below for customers who want to confirm the company registration. You can view it in the preview or open the PDF in a new tab.
                      </p>
                    </div>
                    <Link
                      href={companyCertificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center justify-center rounded-[8px] bg-black px-4 text-[10px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85"
                    >
                      View SECP Certificate
                    </Link>
                  </div>

                  <div className="mt-6 overflow-hidden rounded-[8px] border border-black/10 bg-[#f8f8f4]">
                    <iframe
                      title="SECP certificate for NOTHING OFFICIAL SMC Private Limited"
                      src={companyCertificateUrl}
                      className="h-[520px] w-full bg-[#f8f8f4]"
                      loading="lazy"
                    />
                  </div>
                </section>

                <section className="rounded-[8px] border border-black/10 bg-white p-5 md:p-6">
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-black">What this means for customers</h2>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-black/68">
                    <p>
                      When you shop from Nothing Pakistan, you are dealing with a named Pakistani company, not an anonymous page. The registered company name, CUIN, contact details, and certificate are published openly for transparency.
                    </p>
                    <p>
                      Company registration verifies the Pakistani business identity. Product availability, pricing, delivery, returns, and support are still handled through the product pages, checkout, WhatsApp, and policy pages.
                    </p>
                  </div>
                </section>

                <section className="rounded-[8px] border border-black/10 bg-white p-5 md:p-6">
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-black">FAQs</h2>
                  <div className="mt-5 divide-y divide-black/10">
                    {companyVerificationFaqs.map((faq) => (
                      <details key={faq.question} className="py-5">
                        <summary className="cursor-pointer list-none text-base font-medium text-black">{faq.question}</summary>
                        <p className="mt-3 text-sm leading-7 text-black/68">{faq.answer}</p>
                      </details>
                    ))}
                  </div>
                </section>
              </article>

              <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                <section className="rounded-[8px] border border-black/10 bg-white p-5">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">CEO</p>
                  <div className="mt-5 overflow-hidden rounded-[8px] border border-black/10 bg-[#f8f8f4]">
                    <Image
                      src={companyOwnerImageUrl}
                      alt={companyOwnerImageAlt}
                      width={720}
                      height={720}
                      sizes="(max-width: 1024px) 100vw, 360px"
                      className="aspect-square w-full object-cover"
                    />
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-black">{companyOwnerName}</h2>
                  <p className="mt-1 text-sm text-black/50">{companyOwnerRole}</p>
                  <p className="mt-3 text-sm leading-7 text-black/68">
                    Usman Afzal leads Nothing Pakistan and oversees the customer experience, product availability, support, and company transparency for the store in Pakistan.
                  </p>
                </section>

                <section className="rounded-[8px] border border-black/10 bg-[#111] p-5 text-white">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/48">Registered Company</p>
                  <p className="mt-3 text-sm leading-7 text-white/82">{companyLegalName}</p>
                  <p className="mt-3 text-sm text-white/62">CUIN: {companyCuin}</p>
                  <p className="mt-3 text-sm text-white/62">Website: {companyWebsite}</p>
                  <p className="mt-3 text-sm text-white/62">Support phone: {siteContactDisplayPhone}</p>
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
