import { buildAbsoluteUrl } from '@/lib/utils/seo'

export const companyLegalName = 'NOTHING OFFICIAL (SMC-PRIVATE) LIMITED'
export const companyCuin = '0337422'
export const companyIdentifier = `CUIN ${companyCuin}`
export const companyRegisteredAuthority = 'Securities and Exchange Commission of Pakistan'
export const companyIncorporationDateDisplay = '16 May 2026'
export const companyFoundingDate = '2026-05-16'
export const companyType = 'SMC-Private Limited'
export const companyCountry = 'Pakistan'
export const companyWebsite = 'https://www.nothingofficial.pk'
export const companyOfficialDomains = ['nothingshop.pk', 'nothingofficial.pk', 'cmfbynothing.pk'] as const
export const companyVerificationPath = '/company-verification'
export const companyVerificationUrl = `${companyWebsite}${companyVerificationPath}`
export const companyCertificateUrl = 'https://cdn.nothingofficial.pk/nothing-official-pakistan-secp-certificate.pdf'
export const companyOwnerName = 'Usman Afzal'
export const companyOwnerRole = 'CEO, Nothing Official Store Pakistan'
export const companyOwnerImageUrl = 'https://cdn.nothingofficial.pk/usman_afzal.jpeg'
export const companyOwnerImageAlt = 'Usman Afzal CEO of Nothing Official Store Pakistan'
export const companySupportEmail = 'support@nothingofficial.pk'
export const companySupportHours = 'Monday to Sunday, 10:00 AM to 10:00 PM Pakistan Standard Time'

export const companySocialLinks = [
  { label: 'TikTok', href: 'https://www.tiktok.com/@nothingofficial.pk?_r=1&_t=ZS-96UU9QJl59R' },
  { label: 'Facebook', href: 'https://www.facebook.com/share/1CDYdBibov/?mibextid=wwXIfr' },
] as const

export const companyBusinessInfoRows = [
  { label: 'Legal Company Name', value: companyLegalName },
  { label: 'CUIN', value: companyCuin },
  { label: 'Registered Authority', value: companyRegisteredAuthority },
  { label: 'Incorporation Date', value: companyIncorporationDateDisplay },
  { label: 'Company Type', value: companyType },
  { label: 'Country', value: companyCountry },
  { label: 'Website', value: companyWebsite },
  { label: 'Official Domains', value: companyOfficialDomains.join('\n') },
] as const

export const companyVerificationFaqs = [
  {
    question: 'Is Nothing Official Store Pakistan a registered company?',
    answer:
      `Yes. Nothing Official Store Pakistan is operated by ${companyLegalName}, an SECP registered Pakistani company with ${companyIdentifier}. This verification page is published so customers can confidently confirm the registered business identity behind the website before placing an order.`,
  },
  {
    question: 'What is the legal company name behind Nothing Official Store Pakistan?',
    answer:
      `The official registered company name is ${companyLegalName}. Nothing Official Store Pakistan is the customer-facing storefront for the company, used for product discovery, online shopping, customer support, delivery updates, and after-sales communication in Pakistan.`,
  },
  {
    question: 'Is Nothing Official Store Pakistan the official registered Nothing business in Pakistan?',
    answer:
      `Nothing Official Store Pakistan is operated by ${companyLegalName}, whose registered company name includes Nothing Official and whose SECP registration is published openly on this website. Customers can use this page to verify the company name, CUIN, certificate, and business information.`,
  },
  {
    question: 'How can customers verify the company registration?',
    answer:
      `Customers can verify the company by checking the legal name ${companyLegalName}, ${companyIdentifier}, incorporation date, and SECP certificate linked on this page. The same verification link is also available from the website footer for quick access.`,
  },
  {
    question: 'Why should customers buy from Nothing Official Store Pakistan?',
    answer:
      'Customers choose Nothing Official Store Pakistan because the store shows a clear Pakistani business identity, product information, support channels, delivery expectations, and company verification. The goal is to make Nothing and CMF shopping in Pakistan more transparent and easier to trust.',
  },
  {
    question: 'Who is the CEO of Nothing Official Store Pakistan?',
    answer:
      'Usman Afzal is the CEO of Nothing Official Store Pakistan. He leads the company focus on verified business identity, clear customer support, transparent product listings, and a reliable shopping experience for customers across Pakistan.',
  },
  {
    question: 'Does Nothing Official Store Pakistan provide support after purchase?',
    answer:
      'Yes. Nothing Official Store Pakistan provides customer support through the website, WhatsApp, phone, and email channels listed on the contact page. Customers can contact the team for order updates, product questions, delivery details, and return or replacement guidance.',
  },
  {
    question: 'Can customers view the SECP certificate?',
    answer:
      'Yes. The SECP certificate is available from this Company Verification page through the View SECP Certificate button. Publishing the certificate helps customers confirm the registered company information without needing to search across multiple pages.',
  },
  {
    question: 'Does Nothing Official Store Pakistan deliver across Pakistan?',
    answer:
      'Yes. Nothing Official Store Pakistan serves customers across Pakistan, subject to product availability, delivery coverage, and order confirmation. Delivery details are shared during checkout or support communication so customers know what to expect before payment and dispatch.',
  },
  {
    question: 'How does company verification help customers shop safely?',
    answer:
      'Company verification helps customers know the registered Pakistani business behind the website, the legal company name, and the support channels before ordering. It adds accountability and makes the buying process clearer from product selection to delivery and support.',
  },
] as const

export function buildCompanyOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': buildAbsoluteUrl('/#organization'),
    name: 'Nothing Official Store Pakistan',
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
    sameAs: companySocialLinks.map((item) => item.href),
    document: companyCertificateUrl,
  }
}

export function buildCompanyLocalBusinessStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': buildAbsoluteUrl('/#local-business'),
    name: 'Nothing Official Store Pakistan',
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
    document: companyCertificateUrl,
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

export function buildCompanyCertificateStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'DigitalDocument',
    '@id': `${companyCertificateUrl}#document`,
    name: 'SECP Certificate of Incorporation for NOTHING OFFICIAL (SMC-PRIVATE) LIMITED',
    url: companyCertificateUrl,
    encodingFormat: 'application/pdf',
    about: {
      '@id': buildAbsoluteUrl('/#organization'),
      name: companyLegalName,
      identifier: companyIdentifier,
    },
    datePublished: companyFoundingDate,
    publisher: {
      '@type': 'Organization',
      name: companyRegisteredAuthority,
    },
  }
}
