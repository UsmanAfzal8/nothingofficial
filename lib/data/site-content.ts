import { buildAbsoluteUrl } from '@/lib/utils/seo'
import {
  companyCertificateUrl,
  companyFoundingDate,
  companyIdentifier,
  companyLegalName,
  companySocialLinks,
  companyWebsite,
} from '@/lib/data/company'

export const siteBrandName = 'Nothing Pakistan'
export const siteTagline = 'Tech is fun again.'
export const siteDescription =
  'Nothing Pakistan is a storefront for Nothing and CMF phones, earbuds, chargers, cables, and screen protectors with PKR pricing, nationwide delivery, WhatsApp support, and SECP registered company information.'
export const siteSeoTitle = 'Nothing Products in Pakistan | Phones, CMF & Accessories'
export const siteKeywords = [
  'Nothing Pakistan',
  'Nothing products Pakistan',
  'SECP registered Nothing Pakistan',
  'Nothing Shop Pakistan',
  'Nothing store Pakistan',
  'Nothing phone price in Pakistan',
  'Nothing phones price in Pakistan',
  'Nothing Phone 3a price in Pakistan',
  'Nothing Phone 3a Pro price in Pakistan',
  'Nothing Phone 2a price in Pakistan',
  'CMF Phone 2 Pro price in Pakistan',
  'Nothing charger',
  'Nothing charger Pakistan',
  'Nothing charger price in Pakistan',
  'Nothing 65W charger price in Pakistan',
  'CMF 65W GaN charger Pakistan',
  'CMF Power 65W GaN price in Pakistan',
  'Nothing phones Pakistan',
  'Nothing accessories Pakistan',
  'Nothing earbuds Pakistan',
  'Nothing earbuds price in Pakistan',
  'CMF Buds 2 Pro price in Pakistan',
  'CMF Buds 2a price in Pakistan',
  'Nothing chargers Pakistan',
  'Nothing protectors Pakistan',
  'Nothing screen protector Pakistan',
  'Nothing phone accessories Pakistan',
  'Nothing mobile accessories Pakistan',
  'CMF Pakistan',
  'CMF by Nothing Pakistan',
  'CMF buds Pakistan',
  'Nothing audio Pakistan',
]

export const siteContactPhone = '+923361070111'
export const siteContactWhatsappUrl = 'https://wa.me/923361070111'
export const siteContactDisplayPhone = '03361070111'
export const siteContactAddress = 'Al-Qadir Heights, Babar Block Garden Town, Lahore, Pakistan'
export const siteContactCoordinates = '31.47504732907068, 74.46976232054841'
export const sitePrimaryLocation = {
  city: 'Lahore',
  country: 'Pakistan',
  countryCode: 'PK',
} as const

export const socialLinks: Array<{ label: string; href: string }> = [...companySocialLinks]

export const footerCompanyLinks = [
  { label: 'About Us', href: '/about-us' },
  { label: 'Company Verification', href: '/company-verification' },
  { label: 'Authenticity', href: '/authenticity' },
  { label: 'Contact Us', href: '/contact-us' },
  { label: 'Support Centre', href: '/support-centre' },
]

export const footerSupportLinks = [
  { label: 'Support Centre', href: '/support-centre' },
  { label: 'Contact Us', href: '/contact-us' },
  { label: 'Shipping Policy', href: '/pages/policies/shipping-and-delivery-policy' },
  { label: 'Returns Policy', href: '/pages/policies/return-and-refund-policy' },
]

export const footerPolicyLinks = [
  { label: 'Privacy Policy', href: '/pages/policies/privacy-policy' },
  { label: 'Terms of Sale', href: '/pages/policies/terms-of-sale' },
  { label: 'Shipping & Delivery', href: '/pages/policies/shipping-and-delivery-policy' },
  { label: 'Returns & Refunds', href: '/pages/policies/return-and-refund-policy' },
  { label: 'Warranty Policy', href: '/pages/policies/warranty-policy' },
  { label: 'User Agreement', href: '/pages/policies/user-agreement' },
]

export const storeLocations = [
  { label: 'Lahore', href: '/contact-us#lahore-store' },
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
    title: 'Original Nothing and CMF chargers in Pakistan',
    description:
      'Browse original Nothing chargers, CMF Power GaN chargers, and cable pages with PKR pricing, delivery support, and direct links into the ordering flow.',
    href: '/collections/chargers',
    label: 'Shop chargers',
  },
  {
    title: 'Nothing phone prices with compatible accessories',
    description:
      'Use the phone pages to review Nothing phones and discover compatible chargers, protectors, earbuds, and support routes across Pakistan.',
    href: '/collections/phones',
    label: 'Browse phones',
  },
  {
    title: 'Support, delivery, and contact routes',
    description:
      'Give customers and search engines stronger trust signals through connected support, policy, contact, and order pages.',
    href: '/contact-us',
    label: 'Open support routes',
  },
] as const

export const homeSeoFaqs = [
  {
    question: 'Where can I find Nothing products in Pakistan?',
    answer:
      'Nothing Pakistan brings together Nothing phones, compatible chargers, earbuds, protectors, CMF products, and support routes for customers in Pakistan.',
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
  'shop-all': [
    {
      question: 'What can I find in the Shop All collection?',
      answer:
        'The Shop All collection brings together currently listed Nothing and CMF products, including phones, audio, chargers, protectors, accessories, and related shopping routes in Pakistan.',
    },
    {
      question: 'Can I verify the business before buying from Shop All?',
      answer:
        'Yes. Nothing Pakistan links its company verification page, SECP certificate, support centre, contact page, and policy pages so customers can review trust details before ordering.',
    },
  ],
  audio: [
    {
      question: 'Where can I buy Nothing and CMF audio products in Pakistan?',
      answer:
        'Use the Audio collection on Nothing Pakistan to browse earbuds and audio products with product pages, PKR pricing, support links, and ordering guidance.',
    },
    {
      question: 'What should I compare before buying earbuds?',
      answer:
        'Compare call quality, ANC, battery life, comfort, app features, price in Pakistan, delivery expectations, and return policy before placing an order.',
    },
  ],
  accessories: [
    {
      question: 'Does Nothing Pakistan have a page for Nothing accessories?',
      answer:
        'Yes. The accessories collection groups chargers, cables, phone cases, screen protectors, glass, and other compatible Nothing and CMF add-ons for shoppers in Pakistan.',
    },
    {
      question: 'Can I browse accessory categories separately?',
      answer:
        'Yes. The accessories section links to dedicated landing pages for chargers, cables, phone cases, and phone protectors so people can reach the right accessory type faster.',
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
      question: 'Can I browse Nothing phones with compatible accessories?',
      answer:
        'Yes. The phones collection links shoppers from phone pages into compatible chargers, protectors, earbuds, and support routes in Pakistan.',
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
  cmf: [
    {
      question: 'Can I browse CMF products in Pakistan?',
      answer:
        'Yes. The CMF collection groups eligible CMF phones, earbuds, chargers, and related products so Pakistan shoppers can compare options from one place.',
    },
    {
      question: 'How should I verify CMF product details before buying?',
      answer:
        'Check the product page, model name, price, support channel, delivery terms, return expectations, and company verification page before ordering.',
    },
  ],
}

export const siteTrustLinks = [
  {
    title: 'Support Centre',
    description: 'Browse troubleshooting, FAQs, and after-sales help.',
    href: '/support-centre',
  },
  {
    title: 'Contact Us',
    description: 'Open the main contact and store-trust page for the business.',
    href: '/contact-us',
  },
  {
    title: 'Company Verification',
    description: 'Review the SECP registered company name, CUIN, and certificate link.',
    href: '/company-verification',
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

export type HomeReviewEntry = {
  buyerName: string
  city: string
  product: string
  comment: string
}

export type HomeFeatureEntry = {
  title: string
  description: string
  icon: 'return' | 'delivery' | 'cod' | 'support' | 'original'
}

export type HomeFaqCategory = {
  id: 'general' | 'products' | 'orders' | 'support'
  label: string
  description: string
  items: Array<{
    question: string
    answer: string
  }>
}

export const homeUserReviews: HomeReviewEntry[] = [
  {
    buyerName: 'Ayesha',
    city: 'Lahore',
    product: 'CMF Buds Pro 2',
    comment: 'The sound is clear, the packing was neat, and the order arrived earlier than expected.',
  },
  {
    buyerName: 'Hamza',
    city: 'Karachi',
    product: 'CMF Power 65W GaN Charger',
    comment: 'Charging speed is strong, and it works well for both my laptop and phone.',
  },
  {
    buyerName: 'Usman',
    city: 'Islamabad',
    product: 'Phone (3a) Protector',
    comment: 'The protector fit perfectly and installed smoothly without bubbles.',
  },
  {
    buyerName: 'Rabia',
    city: 'Faisalabad',
    product: 'CMF Buds 2a',
    comment: 'Calls and music both feel good, and the battery backup is solid.',
  },
  {
    buyerName: 'Danish',
    city: 'Rawalpindi',
    product: 'CMF Buds 2 Plus',
    comment: 'The design feels premium, and the delivery process was simple and fast.',
  },
  {
    buyerName: 'Mehak',
    city: 'Multan',
    product: 'Phone (4a) Pro Protector',
    comment: 'Product quality was very good, and support helped confirm the right phone model.',
  },
  {
    buyerName: 'Bilal',
    city: 'Peshawar',
    product: 'CMF Buds 2',
    comment: 'Pairing was quick, and the earbuds are comfortable for daily use.',
  },
  {
    buyerName: 'Sana',
    city: 'Sialkot',
    product: 'Phone (3) Privacy Sheet',
    comment: 'The privacy effect works well, while screen clarity still feels balanced.',
  },
  {
    buyerName: 'Ali',
    city: 'Gujranwala',
    product: 'CMF Power 65W GaN Charger',
    comment: 'I received an original product, and the box condition was fresh.',
  },
  {
    buyerName: 'Hira',
    city: 'Hyderabad',
    product: 'CMF Buds Pro 2',
    comment: 'The ANC was better than expected, and seller communication was smooth.',
  },
  {
    buyerName: 'Saad',
    city: 'Bahawalpur',
    product: 'Phone (3a) UV Protector',
    comment: 'The fit matched my phone model exactly, and dispatch was quick.',
  },
  {
    buyerName: 'Fatima',
    city: 'Quetta',
    product: 'CMF Buds 2a',
    comment: 'For the price, the value is strong and the sound is surprisingly clean.',
  },
  {
    buyerName: 'Zain',
    city: 'Abbottabad',
    product: 'CMF Buds 2 Plus',
    comment: 'The case is compact and feels convenient for everyday carry.',
  },
  {
    buyerName: 'Noor',
    city: 'Sargodha',
    product: 'Phone (4a) Protector',
    comment: 'The screen protection feels good, and I installed it as soon as the order arrived.',
  },
  {
    buyerName: 'Ahmed',
    city: 'Lahore',
    product: 'CMF Buds 2',
    comment: 'The store experience felt reliable, and the product matched the listing.',
  },
]

export const homeFeatureHighlights: HomeFeatureEntry[] = [
  {
    title: '7 Days Return Policy',
    description: 'If there is a valid product issue, quick return and replacement support is available.',
    icon: 'return',
  },
  {
    title: 'Free Delivery',
    description: 'Selected orders in major Pakistani cities can qualify for delivery support with clear confirmation before dispatch.',
    icon: 'delivery',
  },
  {
    title: 'Cash on Delivery',
    description: 'Cash on delivery keeps checkout simple, familiar, and easier to trust for customers across Pakistan.',
    icon: 'cod',
  },
  {
    title: '24/7 Support',
    description: 'Support is available for order updates, product guidance, and after-sales help.',
    icon: 'support',
  },
  {
    title: '100% Original Products',
    description: 'Listed products are presented with authentic sourcing and careful verification.',
    icon: 'original',
  },
]

export const homeFaqCategories: HomeFaqCategory[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Quick answers about Nothing Pakistan, shopping flow, pricing, and store trust signals.',
    items: [
      {
        question: 'What is Nothing Pakistan?',
        answer:
          `Nothing Pakistan is an online storefront operated by ${companyLegalName}, an SECP registered Pakistani company with ${companyIdentifier}. It focuses on Nothing phones, CMF accessories, chargers, protectors, earbuds, and shopping support for customers in Pakistan.`,
      },
      {
        question: 'Is Nothing Pakistan a registered company?',
        answer:
          `Yes. Nothing Pakistan is operated by ${companyLegalName}, an SECP registered Pakistani company with ${companyIdentifier}. Customers can view the Company Verification page and SECP certificate before buying.`,
      },
      {
        question: 'What is the legal company name?',
        answer:
          `The official registered company name behind the Nothing Pakistan storefront is ${companyLegalName}. The company details are published for transparency on the Company Verification page.`,
      },
      {
        question: 'How can I verify the company?',
        answer:
          `You can verify the company by checking the legal name, ${companyIdentifier}, incorporation date, and certificate PDF linked from the Company Verification page and footer.`,
      },
      {
        question: 'Is Nothing Pakistan only an online store?',
        answer:
          'The website works as an online-first store where customers can browse products, compare options, and move into ordering without visiting a physical outlet first.',
      },
      {
        question: 'Which cities does Nothing Pakistan serve?',
        answer:
          'Nothing Pakistan serves customers across Pakistan through online ordering, including Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, and other major cities.',
      },
      {
        question: 'Are prices on Nothing Pakistan shown in PKR?',
        answer:
          'Yes, product prices on Nothing Pakistan are displayed in Pakistani Rupees so customers can review local pricing before placing an order.',
      },
      {
        question: 'Can I browse Nothing Pakistan on mobile and laptop?',
        answer:
          'Yes, the store is designed to be easy to browse on both mobile phones and desktop devices for product discovery and ordering.',
      },
      {
        question: 'Does Nothing Pakistan show live product availability?',
        answer:
          'Product pages and collections are built to show current catalog listings, pricing, and ordering routes so shoppers can make decisions faster.',
      },
      {
        question: 'Why do people shop Nothing accessories online in Pakistan?',
        answer:
          'Customers prefer online accessory shopping because it makes model matching, price checking, and delivery support easier from one place.',
      },
      {
        question: 'Can I find policy pages on Nothing Pakistan?',
        answer:
          'Yes, the website includes support, shipping, returns, and other policy pages so users can review important store information before ordering.',
      },
      {
        question: 'Does Nothing Pakistan help with product compatibility?',
        answer:
          'Yes, the store structure is designed to help shoppers find accessories such as protectors, chargers, and earbuds that match their device.',
      },
      {
        question: 'How often can the Nothing Pakistan catalog change?',
        answer:
          'The product catalog can update as stock, new launches, and pricing change, so customers should review the latest listing before checkout.',
      },
    ],
  },
  {
    id: 'products',
    label: 'Products',
    description: 'Answers about chargers, protectors, earbuds, and choosing the right Nothing accessory.',
    items: [
      {
        question: 'What products can I buy from Nothing Pakistan?',
        answer:
          'You can browse Nothing and CMF chargers, cables, protectors, earbuds, and phone-related accessories through the live product catalog.',
      },
      {
        question: 'Does Nothing Pakistan sell CMF accessories too?',
        answer:
          'Yes, Nothing Pakistan lists CMF audio and charging products alongside other compatible accessories for Pakistan shoppers.',
      },
      {
        question: 'Can I shop protectors for different Nothing phones?',
        answer:
          'Yes, the store includes protector listings for multiple Nothing phones so customers can choose the right fit for their device.',
      },
      {
        question: 'How do I find the right charger for my Nothing device?',
        answer:
          'Open the charger collection or the relevant product page to compare charging accessories and choose the option that matches your usage needs.',
      },
      {
        question: 'Are product images available before ordering?',
        answer:
          'Yes, product cards and detail pages include images to help customers review design, finish, and item type before buying.',
      },
      {
        question: 'Does Nothing Pakistan list earbuds and audio products?',
        answer:
          'Yes, audio listings such as Nothing and CMF earbuds are available so users can compare options from one page.',
      },
      {
        question: 'Can I check product prices before checkout?',
        answer:
          'Yes, pricing is shown on collection cards and product pages so customers can compare products before moving to the order form.',
      },
      {
        question: 'Does Nothing Pakistan offer screen protection options?',
        answer:
          'Yes, the store includes privacy sheets, UV protectors, and standard protectors for supported phones.',
      },
      {
        question: 'Can I browse all products in one place?',
        answer:
          'Yes, the Shop All collection brings together the currently listed accessories so users can scan the full catalog from one page.',
      },
      {
        question: 'Are Nothing Pakistan products shown with category grouping?',
        answer:
          'Yes, products are organized into helpful groups such as products, chargers, protectors, and earbuds for easier discovery.',
      },
    ],
  },
  {
    id: 'orders',
    label: 'Orders',
    description: 'Helpful order-related answers for delivery, checkout, returns, and payment expectations.',
    items: [
      {
        question: 'How do I place an order on Nothing Pakistan?',
        answer:
          'Open any product page or the order route, confirm the item you want, and submit your contact and delivery details through the checkout form.',
      },
      {
        question: 'Does Nothing Pakistan offer cash on delivery?',
        answer:
          'Yes, cash on delivery is available as a convenient payment option for customers who prefer paying at the time of delivery.',
      },
      {
        question: 'Can I order from mobile without creating an account?',
        answer:
          'The ordering flow is designed to be simple so customers can move quickly from product browsing to checkout.',
      },
      {
        question: 'How will I know my order was received?',
        answer:
          'After submitting the order form, customers can expect confirmation and follow-up through the store support process.',
      },
      {
        question: 'How long does delivery usually take in Pakistan?',
        answer:
          'Delivery timelines can vary by city and order confirmation timing, but customers should review the support and shipping guidance for the latest expectation.',
      },
      {
        question: 'Can I order more than one product together?',
        answer:
          'Yes, customers can shop multiple accessories and move them through the store flow based on the checkout experience available on the site.',
      },
      {
        question: 'What should I do if I order the wrong product?',
        answer:
          'Contact support as soon as possible so the team can guide you on whether the order can be corrected, replaced, or handled through the return process.',
      },
      {
        question: 'Does Nothing Pakistan have a return policy?',
        answer:
          'Yes, the website highlights a 7 days return policy and also links to detailed return and refund information for customers.',
      },
      {
        question: 'Can I review product pricing before confirming my order?',
        answer:
          'Yes, collection and product pages show product pricing so you can confirm the amount before moving ahead with the order.',
      },
      {
        question: 'Where can I find shipping and delivery details?',
        answer:
          'Shipping and delivery information is available through the linked policy and support pages in the website footer and support routes.',
      },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    description: 'Support-focused answers about WhatsApp, contact options, policy pages, and after-sales help.',
    items: [
      {
        question: 'How can I contact Nothing Pakistan support?',
        answer:
          'You can contact support through the website support pages, WhatsApp contact route, and the available contact information shared across the store.',
      },
      {
        question: 'Does Nothing Pakistan have WhatsApp support?',
        answer:
          'Yes, WhatsApp support is available so customers can quickly ask about products, order status, and compatibility before purchase.',
      },
      {
        question: 'Where can I ask about product compatibility?',
        answer:
          'For compatibility help, use the support route or WhatsApp contact option and share your phone model before ordering.',
      },
      {
        question: 'Can support help me choose between earbuds models?',
        answer:
          'Yes, support can guide you on available audio options and help you compare listed products before checkout.',
      },
      {
        question: 'What if my delivered product has an issue?',
        answer:
          'If a product arrives damaged, incorrect, or defective, contact support quickly so the team can review the return or replacement options.',
      },
      {
        question: 'Does Nothing Pakistan have a help centre or FAQ section?',
        answer:
          'Yes, the site includes FAQ-style content and support pages to answer common shopping, order, and policy questions.',
      },
      {
        question: 'Can I get help after placing my order?',
        answer:
          'Yes, after-sales support is available for order follow-up, delivery coordination, and issue reporting when needed.',
      },
      {
        question: 'Where can I read return and refund details?',
        answer:
          'You can open the return and refund policy page from the footer or support routes to review the store terms in more detail.',
      },
      {
        question: 'Does Nothing Pakistan offer 24/7 support?',
        answer:
          'The homepage highlights 24/7 support to reassure shoppers that help is available when they need order or product guidance.',
      },
      {
        question: 'What is the fastest way to reach the store team?',
        answer:
          'For quick assistance, the WhatsApp contact route is one of the easiest ways to connect with the store team about shopping questions.',
      },
    ],
  },
]

export function buildOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    '@id': buildAbsoluteUrl('/#organization'),
    name: siteBrandName,
    legalName: companyLegalName,
    url: companyWebsite,
    identifier: companyIdentifier,
    foundingDate: companyFoundingDate,
    description: siteDescription,
    slogan: siteTagline,
    telephone: siteContactPhone,
    areaServed: {
      '@type': 'Country',
      name: sitePrimaryLocation.country,
    },
    inLanguage: 'en-PK',
    sameAs: socialLinks.map((item) => item.href),
    document: companyCertificateUrl,
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
        url: buildAbsoluteUrl('/contact-us'),
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
          name: 'Nothing phones',
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
    alternateName: 'Nothing Pakistan storefront',
    url: companyWebsite,
    description: siteDescription,
    inLanguage: 'en-PK',
    publisher: {
      '@id': buildAbsoluteUrl('/#organization'),
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${buildAbsoluteUrl('/collections/shop-all')}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildContactPageStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': buildAbsoluteUrl('/contact-us#contact-page'),
    name: `Contact ${siteBrandName}`,
    url: buildAbsoluteUrl('/contact-us'),
    description:
      'Find support, order, delivery, and policy routes for Nothing Pakistan from one clear contact page.',
    about: {
      '@id': buildAbsoluteUrl('/#organization'),
    },
    mainEntity: {
      '@type': 'Organization',
      '@id': buildAbsoluteUrl('/#organization'),
      name: siteBrandName,
      legalName: companyLegalName,
      identifier: companyIdentifier,
      url: buildAbsoluteUrl('/'),
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          telephone: siteContactPhone,
          areaServed: sitePrimaryLocation.countryCode,
          availableLanguage: ['en', 'en-PK'],
          url: buildAbsoluteUrl('/contact-us'),
        },
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: siteContactAddress,
        addressLocality: sitePrimaryLocation.city,
        addressCountry: sitePrimaryLocation.countryCode,
      },
    },
  }
}
