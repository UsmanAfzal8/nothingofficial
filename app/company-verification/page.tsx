import type { Metadata } from 'next'
import Link from 'next/link'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import {
  buildCompanyCertificateStructuredData,
  buildCompanyLocalBusinessStructuredData,
  buildCompanyOrganizationStructuredData,
  companyBusinessInfoRows,
  companyCertificateUrl,
  companyCuin,
  companyIdentifier,
  companyLegalName,
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
    <div className="support-centre-official company-verification-official">
      <SeoStructuredData data={structuredData} />
      <NothingHeader />

      <main>
        <section className="support-hero company-verification-hero">
          <div className="support-hero-copy">
            <p className="company-verification-kicker">Company Verification</p>
            <h1>Nothing Pakistan is a registered Pakistani company.</h1>
            <p>
              Nothing Pakistan is operated by {companyLegalName}. The company is registered with the {companyRegisteredAuthority} under CUIN {companyCuin}.
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
                      <td>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="company-verification-section" aria-labelledby="company-certificate-title">
            <div className="company-verification-section-header">
              <div>
                <h2 id="company-certificate-title">Certificate of Incorporation</h2>
                <p>
                  The certificate is available below for customers who want to confirm the company registration. You can view it in the preview or open the PDF in a new tab.
                </p>
              </div>
              <Link href={companyCertificateUrl} target="_blank" rel="noopener noreferrer">
                View SECP Certificate
              </Link>
            </div>

            <div className="company-verification-certificate">
              <iframe
                title="SECP certificate for NOTHING OFFICIAL SMC Private Limited"
                src={companyCertificateUrl}
                loading="lazy"
              />
            </div>
          </section>

          <section className="company-verification-section" aria-labelledby="company-meaning-title">
            <h2 id="company-meaning-title">What this means for customers</h2>
            <div className="company-verification-copy">
              <p>
                When you shop from Nothing Pakistan, you are dealing with a named Pakistani company, not an anonymous page. The registered company name, CUIN, contact details, and certificate are published openly for transparency.
              </p>
              <p>
                Company registration verifies the Pakistani business identity. Product availability, pricing, delivery, returns, and support are still handled through the product pages, checkout, WhatsApp, and policy pages.
              </p>
            </div>
          </section>

          <section className="company-verification-registered" aria-label="Registered company contact details">
            <p>Registered Company</p>
            <dl>
              <div>
                <dt>Name</dt>
                <dd>{companyLegalName}</dd>
              </div>
              <div>
                <dt>CUIN</dt>
                <dd>{companyCuin}</dd>
              </div>
              <div>
                <dt>Website</dt>
                <dd>{companyWebsite}</dd>
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
