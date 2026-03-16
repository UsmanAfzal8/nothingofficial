import { buildAbsoluteUrl } from '@/lib/utils/seo'

export const siteBrandName = 'Nothing Pakistan'
export const siteTagline = 'Tech is fun again.'
export const siteDescription =
  'Shop Nothing phones, CMF devices, earbuds, chargers, protectors, and accessories in Pakistan with live catalog pages, support content, and streamlined ordering.'
export const siteSeoTitle = 'Nothing Pakistan | Nothing Phones, Audio and Accessories in Pakistan'
export const siteKeywords = [
  'Nothing Pakistan',
  'Nothing phones Pakistan',
  'Nothing accessories Pakistan',
  'Nothing earbuds Pakistan',
  'Nothing chargers Pakistan',
  'Nothing protectors Pakistan',
  'CMF Pakistan',
  'CMF buds Pakistan',
  'Nothing audio Pakistan',
]

export const socialLinks: Array<{ label: string; href: string }> = [
  { label: 'Instagram', href: 'https://www.instagram.com/nothing' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@nothing' },
  { label: 'X / Twitter', href: 'https://twitter.com/nothing' },
  { label: 'YouTube', href: 'https://youtube.com/c/NothingTechnology' },
  { label: 'Community', href: 'https://nothing.community' },
]

export const footerCompanyLinks = [
  { label: 'About Us', href: '/pages/about' },
  { label: 'Contact Us', href: '/pages/contact-us' },
  { label: 'Support Centre', href: '/pages/support-centre' },
]

export const footerSupportLinks = [
  { label: 'Support Centre', href: '/pages/support-centre' },
  { label: 'Contact Us', href: '/pages/contact-us' },
  { label: 'Shipping Policy', href: '/pages/policies/shipping-and-delivery-policy' },
  { label: 'Returns Policy', href: '/pages/policies/return-and-refund-policy' },
]

export const footerPolicyLinks = [
  { label: 'Privacy Policy', href: '/pages/policies/privacy-policy' },
  { label: 'Terms of Sale', href: '/pages/policies/terms-of-sale' },
  { label: 'Shipping & Delivery', href: '/pages/policies/shipping-and-delivery-policy' },
  { label: 'Returns & Refunds', href: '/pages/policies/return-and-refund-policy' },
  { label: 'User Agreement', href: '/pages/policies/user-agreement' },
]

export const storeLocations = [
  { label: 'Lahore', href: '/pages/contact-us#lahore-store' },
] as const

export const supportedLanguages = [
  { label: 'EN', href: '/' },
] as const

export const newsletterHighlights = [
  'Product launches and restocks',
  'Support updates and buying guides',
  'Accessory drops and CMF releases',
]

export function buildOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: siteBrandName,
    url: buildAbsoluteUrl('/'),
    description: siteDescription,
    areaServed: 'PK',
    inLanguage: 'en-PK',
  }
}

export function buildWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteBrandName,
    alternateName: ['Nothing Pakistan', 'Nothing accessories Pakistan'],
    url: buildAbsoluteUrl('/'),
    description: siteDescription,
    inLanguage: 'en-PK',
  }
}
