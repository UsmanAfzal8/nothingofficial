import { buildAbsoluteUrl } from '@/lib/utils/seo'

export const siteBrandName = 'Nothing Pakistan'
export const siteTagline = 'Tech is fun again.'
export const siteDescription =
  'Browse Nothing phone models and shop compatible Nothing chargers, CMF devices, earbuds, protectors, and accessories in Pakistan with live catalog pages, support content, and streamlined ordering.'
export const siteSeoTitle = 'Nothing Pakistan | Nothing Chargers, Phone Accessories and CMF in Pakistan'
export const siteKeywords = [
  'Nothing Pakistan',
  'Nothing charger',
  'Nothing charger Pakistan',
  'Nothing phones Pakistan',
  'Nothing accessories Pakistan',
  'Nothing earbuds Pakistan',
  'Nothing chargers Pakistan',
  'Nothing protectors Pakistan',
  'Nothing phone accessories Pakistan',
  'Nothing mobile accessories Pakistan',
  'CMF Pakistan',
  'CMF buds Pakistan',
  'Nothing audio Pakistan',
]

export const siteContactPhone = '+923424476070'
export const siteContactWhatsappUrl = 'https://wa.me/923424476070'
export const sitePrimaryLocation = {
  city: 'Lahore',
  country: 'Pakistan',
  countryCode: 'PK',
} as const

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

export const homeSeoHighlights = [
  {
    title: 'Nothing chargers in Pakistan',
    description:
      'Browse dedicated Nothing charger and cable pages with live catalog items, pricing, and direct links into the ordering flow.',
    href: '/collections/chargers',
    label: 'Shop chargers',
  },
  {
    title: 'Nothing phone models and compatible accessories',
    description:
      'Use the phone pages to discover compatible chargers, protectors, earbuds, and support routes for Nothing devices in Pakistan.',
    href: '/collections/phones',
    label: 'Browse phone models',
  },
  {
    title: 'Support, delivery, and contact routes',
    description:
      'Give customers and search engines clear trust signals through connected support, policy, contact, and order pages.',
    href: '/pages/contact-us',
    label: 'Open support routes',
  },
] as const

export const homeSeoFaqs = [
  {
    question: 'Where can I find Nothing products in Pakistan?',
    answer:
      'Nothing Pakistan brings together Nothing phone model pages, compatible chargers, earbuds, protectors, CMF products, and support routes for customers in Pakistan.',
  },
  {
    question: 'Does Nothing Pakistan have a page for Nothing chargers?',
    answer:
      'Yes. The site includes a dedicated chargers collection so users can browse Nothing chargers and charging cables in Pakistan through focused landing pages.',
  },
  {
    question: 'Can I browse accessories for a specific Nothing phone?',
    answer:
      'Yes. Phone pages on Nothing Pakistan link to compatible chargers, protectors, earbuds, and other accessories so shoppers can move from the device to the right add-ons.',
  },
] as const

export const collectionSeoFaqs: Record<string, Array<{ question: string; answer: string }>> = {
  accessories: [
    {
      question: 'Does Nothing Pakistan have a page for Nothing accessories?',
      answer:
        'Yes. The accessories collection groups chargers, protectors, earbuds, cables, and other compatible Nothing and CMF add-ons for shoppers in Pakistan.',
    },
    {
      question: 'Can I browse accessory categories separately?',
      answer:
        'Yes. The accessories section links to dedicated landing pages for chargers, protectors, and earbuds so people can reach the right accessory type faster.',
    },
  ],
  chargers: [
    {
      question: 'Where can I buy Nothing chargers in Pakistan?',
      answer:
        'Use the chargers collection on Nothing Pakistan to browse live charger and charging-cable pages with current pricing and direct order routes.',
    },
    {
      question: 'Does the chargers page include CMF charging products too?',
      answer:
        'Yes. Compatible CMF charging products can appear in the chargers collection when they are part of the live catalog.',
    },
  ],
  earbuds: [
    {
      question: 'Can I browse Nothing earbuds in Pakistan on a dedicated page?',
      answer:
        'Yes. The earbuds collection groups Nothing and CMF audio products into one browseable page for Pakistan shoppers.',
    },
    {
      question: 'Does the earbuds page help me move to ordering?',
      answer:
        'Yes. Each earbuds product page links into the ordering flow and keeps pricing, product details, and support routes easy to find.',
    },
  ],
  phones: [
    {
      question: 'Can I browse Nothing phone models with compatible accessories?',
      answer:
        'Yes. The phones collection links shoppers from phone model pages into compatible chargers, protectors, earbuds, and support routes in Pakistan.',
    },
    {
      question: 'Does Nothing Pakistan sell the phone or just show accessories?',
      answer:
        'Phone model pages work as compatibility hubs first, helping shoppers discover the right accessories and support information for each device.',
    },
  ],
  protectors: [
    {
      question: 'Is there a page for Nothing screen protectors in Pakistan?',
      answer:
        'Yes. The protectors collection brings together Nothing and CMF screen protectors and related protective accessories in one page.',
    },
    {
      question: 'Can I use the protector pages to find the right accessory for my phone?',
      answer:
        'Yes. Protector pages connect shoppers to compatible accessory routes so they can move from a device page to the right protective add-on quickly.',
    },
  ],
  'phone-protectors': [
    {
      question: 'Is there a page for Nothing screen protectors in Pakistan?',
      answer:
        'Yes. The protectors collection brings together Nothing and CMF screen protectors and related protective accessories in one page.',
    },
    {
      question: 'Can I use the protector pages to find the right accessory for my phone?',
      answer:
        'Yes. Protector pages connect shoppers to compatible accessory routes so they can move from a device page to the right protective add-on quickly.',
    },
  ],
}

export const siteTrustLinks = [
  {
    title: 'Support Centre',
    description: 'Browse troubleshooting, FAQs, and after-sales help.',
    href: '/pages/support-centre',
  },
  {
    title: 'Contact Us',
    description: 'Open the main contact and store-trust page for the business.',
    href: '/pages/contact-us',
  },
  {
    title: 'Shipping Policy',
    description: 'Review delivery expectations before you place an order.',
    href: '/pages/policies/shipping-and-delivery-policy',
  },
  {
    title: 'Returns Policy',
    description: 'Check return and replacement guidance for ordered items.',
    href: '/pages/policies/return-and-refund-policy',
  },
  {
    title: 'Start Order',
    description: 'Move into the order flow for stock and delivery confirmation.',
    href: '/order',
  },
] as const

export function buildOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    '@id': buildAbsoluteUrl('/#organization'),
    name: siteBrandName,
    url: buildAbsoluteUrl('/'),
    description: siteDescription,
    slogan: siteTagline,
    telephone: siteContactPhone,
    areaServed: {
      '@type': 'Country',
      name: sitePrimaryLocation.country,
    },
    inLanguage: 'en-PK',
    sameAs: socialLinks.map((item) => item.href),
    address: {
      '@type': 'PostalAddress',
      addressLocality: sitePrimaryLocation.city,
      addressCountry: sitePrimaryLocation.countryCode,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: siteContactPhone,
        areaServed: sitePrimaryLocation.countryCode,
        availableLanguage: ['en', 'en-PK'],
        url: buildAbsoluteUrl('/pages/contact-us'),
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${siteBrandName} catalog`,
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'Nothing chargers',
          url: buildAbsoluteUrl('/collections/chargers'),
        },
        {
          '@type': 'OfferCatalog',
          name: 'Nothing phone models',
          url: buildAbsoluteUrl('/collections/phones'),
        },
        {
          '@type': 'OfferCatalog',
          name: 'Nothing accessories',
          url: buildAbsoluteUrl('/collections/shop-all'),
        },
      ],
    },
  }
}

export function buildWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': buildAbsoluteUrl('/#website'),
    name: siteBrandName,
    alternateName: ['Nothing Pakistan', 'Nothing chargers Pakistan', 'Nothing accessories Pakistan'],
    url: buildAbsoluteUrl('/'),
    description: siteDescription,
    inLanguage: 'en-PK',
    publisher: {
      '@id': buildAbsoluteUrl('/#organization'),
    },
  }
}

export function buildContactPageStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': buildAbsoluteUrl('/pages/contact-us#contact-page'),
    name: `Contact ${siteBrandName}`,
    url: buildAbsoluteUrl('/pages/contact-us'),
    description:
      'Find support, order, delivery, and policy routes for Nothing Pakistan from one clear contact page.',
    about: {
      '@id': buildAbsoluteUrl('/#organization'),
    },
    mainEntity: {
      '@type': 'Organization',
      '@id': buildAbsoluteUrl('/#organization'),
      name: siteBrandName,
      url: buildAbsoluteUrl('/'),
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          telephone: siteContactPhone,
          areaServed: sitePrimaryLocation.countryCode,
          availableLanguage: ['en', 'en-PK'],
          url: buildAbsoluteUrl('/pages/contact-us'),
        },
      ],
    },
  }
}
