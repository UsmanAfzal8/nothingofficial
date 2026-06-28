import { buildAbsoluteUrl } from '@/lib/utils/seo'

export const companyLegalName = 'NOTHING PAKISTAN (SMC-PRIVATE) LIMITED'
export const companyCuin = '0337422'
export const companyIdentifier = `CUIN ${companyCuin}`
export const companyRegisteredAuthority = 'Securities and Exchange Commission of Pakistan'
export const companyIncorporationDateDisplay = '16 May 2026'
export const companyFoundingDate = '2026-05-16'
export const companyType = 'SMC-Private Limited'
export const companyCountry = 'Pakistan'
export const companyWebsite = 'https://www.nothingpakistan.pk'
export const companyOfficialDomains = ['www.nothingpakistan.pk'] as const
export const companyVerificationPath = '/company-verification'
export const companyVerificationUrl = `${companyWebsite}${companyVerificationPath}`
export const companyOwnerName = 'Usman Afzal'
export const companyOwnerRole = 'CEO, Nothing Pakistan'
export const companyOwnerImageUrl = 'https://cdn.nothingshop.pk/usman_afzal.jpeg'
export const companyOwnerImageAlt = 'Usman Afzal CEO of Nothing Pakistan'
export const companySupportEmail = 'support@nothingpakistan.pk'
export const companySupportHours = 'Monday to Sunday, 10:00 AM to 10:00 PM Pakistan Standard Time'

export const companySocialLinks: Array<{ label: string; href: string }> = []

export const companyBusinessInfoRows = [
  { label: 'Legal Company Name', value: companyLegalName },
  { label: 'Company ID', value: companyCuin },
  { label: 'Incorporation Date', value: companyIncorporationDateDisplay },
  { label: 'Company Type', value: companyType },
  { label: 'Country', value: companyCountry },
  { label: 'Website', value: companyWebsite },
  { label: 'Official Domains', value: companyOfficialDomains.join('\n') },
] as const

export const companyVerificationFaqs = [
  {
    question: 'What is Nothing Pakistan?',
    answer:
      `Nothing Pakistan is the online storefront at ${companyWebsite} for customers shopping for Nothing and CMF products in Pakistan. It is operated by ${companyLegalName} and publishes clear business and support information for local buyers.`,
  },
  {
    question: 'Who operates the Nothing Pakistan website?',
    answer:
      `${companyWebsite} is operated by ${companyLegalName}. The registered company is responsible for the storefront, order communication, customer support, and the business information published on this verification page.`,
  },
  {
    question: 'What business details can I review on this page?',
    answer:
      `This page lists the legal company name, company ID, incorporation date, company type, country, website, and official domains connected to Nothing Pakistan.`,
  },
  {
    question: 'How can I verify Nothing Pakistan before ordering?',
    answer:
      `Review the company information on this page and match the legal name ${companyLegalName} with ${companyIdentifier}. You can also use the Company Verification and Contact pages whenever you want to confirm the store details before ordering.`,
  },
  {
    question: 'Which websites are operated by Nothing Pakistan?',
    answer:
      `The company domains listed on this verification page are ${companyOfficialDomains.join(' and ')}. Customers should confirm the website address before ordering or sharing payment and delivery information.`,
  },
  {
    question: 'Why does Nothing Pakistan publish business information?',
    answer:
      'Nothing Pakistan publishes business information so customers can clearly understand who operates the storefront before they place an order, ask for support, or compare products.',
  },
  {
    question: 'What can I shop for on CMF by Nothing Pakistan?',
    answer:
      'The storefront lists Nothing and CMF phones, audio products, wearables, chargers, cables, protectors, covers, and compatible accessories available for customers in Pakistan. Product availability and current PKR pricing are shown on the relevant product pages.',
  },
  {
    question: 'Does CMF by Nothing Pakistan deliver across Pakistan?',
    answer:
      'Orders can be delivered to supported locations across Pakistan, subject to product availability, address coverage, and order confirmation. Delivery timing and payment details are provided during checkout or confirmed by the support team.',
  },
  {
    question: 'Does CMF by Nothing Pakistan provide after-sales support?',
    answer:
      'Yes. Customers can contact the support team for product questions, order updates, delivery information, and return or replacement guidance. The applicable support and policy details depend on the product and order.',
  },
  {
    question: 'How can I contact CMF by Nothing Pakistan?',
    answer:
      `Use the contact options published on ${companyWebsite}, including the contact page and ${companySupportEmail}. Support is available ${companySupportHours}.`,
  },
] as const

export function buildCompanyOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': buildAbsoluteUrl('/#organization'),
    name: 'Nothing Pakistan',
    legalName: companyLegalName,
    url: companyWebsite,
    identifier: companyIdentifier,
    foundingDate: companyFoundingDate,
    founder: {
      '@type': 'Person',
      name: companyOwnerName,
      url: buildAbsoluteUrl('/authors/usman-afzal'),
      image: companyOwnerImageUrl,
    },
    sameAs: companySocialLinks.length > 0 ? companySocialLinks.map((item) => item.href) : undefined,
  }
}

export function buildCompanyLocalBusinessStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': buildAbsoluteUrl('/#local-business'),
    name: 'Nothing Pakistan',
    legalName: companyLegalName,
    url: companyWebsite,
    identifier: companyIdentifier,
    foundingDate: companyFoundingDate,
    image: buildAbsoluteUrl('/social/nothing-pakistan-og.jpg'),
    areaServed: {
      '@type': 'Country',
      name: companyCountry,
    },
    founder: {
      '@type': 'Person',
      name: companyOwnerName,
    },
  }
}

export function buildCompanyPersonStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': buildAbsoluteUrl('/authors/usman-afzal#person'),
    name: companyOwnerName,
    jobTitle: companyOwnerRole,
    image: companyOwnerImageUrl,
    url: buildAbsoluteUrl('/authors/usman-afzal'),
    worksFor: {
      '@id': buildAbsoluteUrl('/#organization'),
      name: companyLegalName,
    },
  }
}
