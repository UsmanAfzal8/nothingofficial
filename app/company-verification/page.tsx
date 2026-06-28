import type { Metadata } from 'next'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import {
  buildCompanyLocalBusinessStructuredData,
  buildCompanyOrganizationStructuredData,
  companyBusinessInfoRows,
  companyCuin,
  companyIdentifier,
  companyOfficialDomains,
  companyLegalName,
  companyVerificationFaqs,
  companyWebsite,
} from '@/lib/data/company'
import { siteContactDisplayPhone } from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildFaqStructuredData, buildRobotsMetadata } from '@/lib/utils/seo'

const pageTitle = 'Company Verification | Nothing Pakistan'
const pageDescription =
  'Review Nothing Pakistan company details, official domains, and support information for customers in Pakistan.'

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
    <div className="support-centre-official company-verification-official">
      <SeoStructuredData data={structuredData} />
      <NothingHeader />

      <main>
        <section className="support-hero company-verification-hero">
          <div className="support-hero-copy">
            <p className="company-verification-kicker">Company Verification</p>
            <h1>Nothing Pakistan publishes clear store information.</h1>
            <p>
              Nothing Pakistan is operated by {companyLegalName}. This page brings together the legal company name, company ID, official website, and support details customers can review before ordering.
            </p>
          </div>
        </section>

        <div className="support-content company-verification-content">
          <section className="company-verification-section" aria-labelledby="company-registration-title">
            <h2 id="company-registration-title">Registration Details</h2>
            <div className="company-verification-table-wrap">
              <table className="company-verification-table">
                <tbody>
                  {companyBusinessInfoRows.map((row) => (
                    <tr key={row.label}>
                      <th>{row.label}</th>
                      <td className="whitespace-pre-line">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="company-verification-section" aria-labelledby="company-meaning-title">
            <h2 id="company-meaning-title">What this means for customers</h2>
            <div className="company-verification-copy">
              <p>
                When you shop from Nothing Pakistan, you are dealing with a named Pakistani company, not an anonymous page. The legal company name, company ID, official domains, and support details are published openly for transparency.
              </p>
              <p>
                Product availability, pricing, delivery, returns, and support are still handled through the product pages, checkout, WhatsApp, and policy pages. This page simply helps customers confirm who operates the storefront.
              </p>
            </div>
          </section>

          <section className="company-verification-registered" aria-label="Registered company contact details">
            <p>Store Details</p>
            <dl>
              <div>
                <dt>Name</dt>
                <dd>{companyLegalName}</dd>
              </div>
              <div>
                <dt>Company ID</dt>
                <dd>{companyCuin}</dd>
              </div>
              <div>
                <dt>Website</dt>
                <dd>{companyWebsite}</dd>
              </div>
              <div>
                <dt>Official Domains</dt>
                <dd className="whitespace-pre-line">{companyOfficialDomains.join('\n')}</dd>
              </div>
              <div>
                <dt>Support Phone</dt>
                <dd>{siteContactDisplayPhone}</dd>
              </div>
            </dl>
          </section>

          <section className="support-faq-section" id="company-verification-faqs" aria-labelledby="company-faq-title">
            <h2 id="company-faq-title">Popular Questions</h2>
            <div className="support-faq-list">
              {companyVerificationFaqs.map((faq) => (
                <details key={faq.question} className="support-faq-item">
                  <summary>
                    <span>{faq.question}</span>
                    <span className="support-read-more">( Read More )</span>
                    <span className="support-read-less">( Read Less )</span>
                  </summary>
                  <div className="support-faq-answer">{faq.answer}</div>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>

      <NothingFooter />
    </div>
  )
}
