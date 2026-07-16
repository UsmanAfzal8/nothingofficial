import { buildAbsoluteUrl } from '@/lib/utils/seo'
import {
  companyCuin,
  companyFoundingDate,
  companyIdentifier,
  companyLegalName,
  companySocialLinks,
  companyWebsite,
} from '@/lib/data/company'

export const siteBrandName = 'Nothing Pakistan'
export const siteTagline = 'Tech is fun again.'
export const siteDescription =
  'Follow Nothing Phone (4b) launch updates and shop Nothing and CMF phones, earbuds, chargers, watches, cases, and accessories in Pakistan.'
export const siteSeoTitle = 'Nothing Pakistan | Phone (4b), Phones, CMF & Earbuds'
export const siteKeywords = [
  'Nothing Pakistan',
  'Nothing Phone 4b Pakistan',
  'Nothing Phone 4b price in Pakistan',
  'Nothing Phone 4b launch date Pakistan',
  'Nothing Phone 4b release date Pakistan',
  'Nothing Phone 4b specifications',
  'Nothing Phone 4b PTA approved',
  'Nothing Phone 4b PTA tax Pakistan',
  'Nothing Phone 4b availability Pakistan',
  'Nothing Phone 4b pre order Pakistan',
  'buy Nothing Phone 4b Pakistan',
  'Nothing Phone 4b vs Phone 4a',
  'Nothing products Pakistan',
  'Nothing products price in Pakistan',
  'Nothing official store Pakistan',
  'Nothing store Pakistan',
  'Nothing mobiles price in Pakistan',
  'Nothing phone price in Pakistan',
  'Nothing phones price in Pakistan',
  'Nothing Phone PTA approved Pakistan',
  'Nothing Phone non PTA price Pakistan',
  'Nothing Phone 4a price in Pakistan',
  'Nothing Phone 4a Pro price in Pakistan',
  'Nothing Phone 3 price in Pakistan',
  'Nothing Phone 3a price in Pakistan',
  'Nothing Phone 3a Pro price in Pakistan',
  'Nothing Phone 3a Lite price in Pakistan',
  'Nothing Phone 2a price in Pakistan',
  'Nothing Phone 2a Plus price in Pakistan',
  'CMF Phone 1 price in Pakistan',
  'CMF Phone 2 Pro price in Pakistan',
  'Nothing charger',
  'Nothing charger Pakistan',
  'Nothing charger price in Pakistan',
  'original Nothing charger Pakistan',
  'CMF Power 140W GaN price in Pakistan',
  'CMF Power 100W GaN price in Pakistan',
  'Nothing 65W charger price in Pakistan',
  'CMF 65W GaN charger Pakistan',
  'CMF Power 65W GaN price in Pakistan',
  'Nothing phones Pakistan',
  'Nothing accessories Pakistan',
  'Nothing earbuds Pakistan',
  'Nothing earbuds price in Pakistan',
  'Nothing Ear price in Pakistan',
  'Nothing Ear 3 price in Pakistan',
  'Nothing Ear a price in Pakistan',
  'Nothing Ear open price in Pakistan',
  'Nothing Headphone 1 price in Pakistan',
  'Nothing Headphone a price in Pakistan',
  'CMF Buds 2 Pro price in Pakistan',
  'CMF Buds 2a price in Pakistan',
  'CMF Buds 2 price in Pakistan',
  'CMF Buds 2 Plus price in Pakistan',
  'CMF Neckband Pro price in Pakistan',
  'CMF Watch Pro 2 price in Pakistan',
  'CMF Watch 3 Pro price in Pakistan',
  'Nothing chargers Pakistan',
  'Nothing protectors Pakistan',
  'Nothing screen protector Pakistan',
  'Nothing phone accessories Pakistan',
  'Nothing mobile accessories Pakistan',
  'CMF Pakistan',
  'CMF by Nothing Pakistan',
  'CMF buds Pakistan',
  'Nothing audio Pakistan',
  'Nothing AI phone Pakistan',
  'Nothing OS AI tools Pakistan',
  'Nothing Essential Space Pakistan',
  'Nothing ChatGPT integration Pakistan',
  'Nothing Gemini phone Pakistan',
  'Nothing Phone 3 AI features Pakistan',
  'Nothing Phone 4a AI features Pakistan',
]

export const siteContactPhone = '+923110066648'
export const siteContactWhatsappUrl = 'https://wa.me/923110066648'
export const siteContactDisplayPhone = '+923110066648'
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
  { label: 'AI Phone Guide', href: '/ai-products' },
  { label: 'Contact Us', href: '/contact-us' },
  { label: 'Shipping Policy', href: '/pages/shipping-and-delivery-policy' },
  { label: 'Returns Policy', href: '/pages/return-and-refund-policy' },
]

export const footerPolicyLinks = [
  { label: 'Privacy Policy', href: '/pages/privacy-policy' },
  { label: 'Terms of Sale', href: '/pages/terms-of-sale' },
  { label: 'Shipping & Delivery', href: '/pages/shipping-and-delivery-policy' },
  { label: 'Returns & Refunds', href: '/pages/return-and-refund-policy' },
  { label: 'Warranty Policy', href: '/pages/warranty-policy' },
  { label: 'User Agreement', href: '/pages/user-agreement' },
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
    title: 'Nothing Phone (4b) launch updates for Pakistan',
    description:
      'Follow the confirmed 7 July reveal, see the official blue design, separate verified details from rumours, and request a Pakistan stock reminder on WhatsApp.',
    href: '/nothing-phone-4b-pakistan',
    label: 'Open Phone (4b) guide',
  },
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
    question: 'When is Nothing Phone (4b) launching in Pakistan time?',
    answer:
      'Nothing will reveal Phone (4b) on 7 July 2026 at 11:00 BST, which is 3:00 PM in Pakistan. Pakistan pricing, PTA status, and local stock timing are not confirmed before the reveal.',
  },
  {
    question: 'Where can I follow Nothing Phone (4b) updates in Pakistan?',
    answer:
      'Open https://www.nothingpakistan.pk/nothing-phone-4b-pakistan for confirmed design details, launch timing, price and PTA guidance, FAQs, comparisons, and a WhatsApp availability reminder.',
  },
  {
    question: 'What is the official website address for this store?',
    answer:
      'The store website is https://www.nothingpakistan.pk. Product, collection, support, company verification, policy, cart, and order pages should all remain on this domain.',
  },
  {
    question: 'What products are listed on nothingpakistan.pk?',
    answer:
      'The catalog includes Nothing and CMF phones, earbuds, headphones, watches, chargers, cables, screen protectors, covers, and compatible accessories for shoppers in Pakistan.',
  },
  {
    question: 'How can I get help before placing an order?',
    answer:
      'Use the WhatsApp or Contact Us route on www.nothingpakistan.pk to ask about current stock, colour, compatibility, delivery, payment methods, cash on delivery, or Lahore store pickup.',
  },
] as const

export const aiProductKeywords = [
  'Nothing AI phone Pakistan',
  'Nothing OS AI tools Pakistan',
  'Nothing Essential Space Pakistan',
  'Nothing Essential Search Pakistan',
  'Nothing ChatGPT integration Pakistan',
  'Nothing Gemini phone Pakistan',
  'Nothing Phone 3 AI features Pakistan',
  'Nothing Phone 4a AI features Pakistan',
  'Nothing Phone 3a AI features Pakistan',
  'AI smartphone Pakistan Nothing',
] as const

export const aiProductHighlights = [
  {
    title: 'Nothing OS with Essential AI tools',
    description:
      'Nothing phones can include Essential Space, Essential Search, AI summaries, reminders, and other Nothing OS intelligence features depending on the model and software region.',
    href: '/collections/phones',
  },
  {
    title: 'ChatGPT voice routes for Nothing devices',
    description:
      'Nothing support guidance says ChatGPT features require a compatible Nothing smartphone, the latest Nothing X app, the ChatGPT app, and Voice AI controls enabled for supported audio or wearable products.',
    href: '/support-centre/software-download',
  },
  {
    title: 'Gemini and modern AI assistant use',
    description:
      'Newer Nothing phone pages highlight built-in Google Gemini and AI assistant experiences, making phone pages relevant for shoppers comparing AI-capable Android phones in Pakistan.',
    href: '/collections/phones',
  },
] as const

export const aiProductFaqs = [
  {
    question: 'Which Nothing phones should I compare for AI features in Pakistan?',
    answer:
      'Start with the latest Nothing phone pages in the Phones collection, then compare Nothing OS version, Essential Space, Essential Search, ChatGPT support, Gemini support, storage, RAM, camera, battery, and current Pakistan availability.',
  },
  {
    question: 'Do Nothing earbuds use ChatGPT directly?',
    answer:
      'Nothing support says ChatGPT earbud activation depends on a compatible Nothing smartphone, updated Nothing X app, the ChatGPT app, and enabling ChatGPT through Nothing X controls where supported.',
  },
  {
    question: 'Is Essential Space available on every Nothing phone?',
    answer:
      'Essential Space and related Nothing OS AI tools depend on the exact phone model, software version, and regional rollout. Check the product page and confirm current support before ordering.',
  },
  {
    question: 'Can I buy accessories for an AI-focused Nothing phone?',
    answer:
      'Yes. Nothing Pakistan connects phone pages with compatible chargers, protectors, earbuds, and other accessories so shoppers can prepare the full device setup.',
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
        'Yes. Nothing Pakistan links its company verification page, support centre, contact page, and policy pages so customers can review store details before ordering.',
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
    description: 'Review the legal company name, company ID, and official website details.',
    href: '/company-verification',
  },
  {
    title: 'Shipping Policy',
    description: 'Review delivery expectations before you place an order.',
    href: '/pages/shipping-and-delivery-policy',
  },
  {
    title: 'Returns Policy',
    description: 'Check return and replacement guidance for ordered items.',
    href: '/pages/return-and-refund-policy',
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
    product: 'Phone (3) Protector',
    comment: 'The fit works well, while screen clarity still feels balanced.',
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
    label: 'Store',
    description: 'Clear answers about www.nothingpakistan.pk, the catalog, pricing, and business verification.',
    items: [
      {
        question: 'What is www.nothingpakistan.pk?',
        answer:
          `www.nothingpakistan.pk is the online storefront operated by ${companyLegalName}. It lists Nothing and CMF products for customers in Pakistan and connects each product to ordering and support routes.`,
      },
      {
        question: 'Is the business behind nothingpakistan.pk registered in Pakistan?',
        answer:
          `Yes. The store is operated by ${companyLegalName}. The Company Verification page publishes the legal company name, company ID, and official website details.`,
      },
      {
        question: 'How can I confirm I am using the correct website?',
        answer:
          'Check that the address bar shows https://www.nothingpakistan.pk before sharing order details. Product, collection, support, policy, cart, and checkout pages should stay on this domain.',
      },
      {
        question: 'Are prices shown in Pakistani Rupees?',
        answer:
          'Yes. Product and order pages display prices in PKR so you can review the item price, shipping charge, applicable tax, and total before placing a delivery order.',
      },
      {
        question: 'Can the catalog price or stock change?',
        answer:
          'Yes. Prices, colours, models, and availability can change when stock is updated. Review the current product page or contact the store on WhatsApp before ordering if availability is important.',
      },
    ],
  },
  {
    id: 'products',
    label: 'Products',
    description: 'Answers about finding the right Nothing or CMF model, colour, charger, protector, or audio product.',
    items: [
      {
        question: 'What product types can I browse?',
        answer:
          'You can browse Nothing and CMF phones, earbuds, headphones, watches, chargers, cables, screen protectors, covers, and other compatible accessories.',
      },
      {
        question: 'How do I find products for a specific phone?',
        answer:
          'Open the Phones, Protectors, Covers, Chargers, or Shop All collection and match the full model name. If you are unsure, send the product link and your phone model through WhatsApp before ordering.',
      },
      {
        question: 'Can I choose a product colour before ordering?',
        answer:
          'When colour options are available, select the colour on the product page before opening the order screen. The selected colour is carried into the order summary.',
      },
      {
        question: 'How do I check charger compatibility?',
        answer:
          'Review the charger wattage, connector type, cable requirements, and your device charging specification. Contact support with the exact device model if you need confirmation.',
      },
      {
        question: 'Where can I compare all current products?',
        answer:
          'Use the All Products collection on www.nothingpakistan.pk to view the current catalog, then open a product page for images, variants, price, specifications, reviews, and ordering options.',
      },
    ],
  },
  {
    id: 'orders',
    label: 'Orders',
    description: 'Answers about delivery orders, cash on delivery, payment methods, totals, and Lahore store pickup.',
    items: [
      {
        question: 'How do I place a delivery order?',
        answer:
          'Open a product, choose the available colour if needed, select Order Now, enter your delivery details, choose cash on delivery or bank transfer, review the total, and submit the order.',
      },
      {
        question: 'What is the bank transfer offer?',
        answer:
          'Bank transfer orders receive free shipping and 0% government tax. No bank or account details are displayed on the website.',
      },
      {
        question: 'What charges apply to cash on delivery?',
        answer:
          'The order page shows the current cash-on-delivery shipping charge and applicable government tax separately before displaying the final total.',
      },
      {
        question: 'How do I request store pickup?',
        answer:
          'Choose Pickup on the order page, enter your name and phone number, and select Confirm Store Pickup. WhatsApp opens with your selected product names so you can ask when to visit the Garden Town, Lahore location.',
      },
      {
        question: 'How do I know my delivery order was submitted?',
        answer:
          'A successful submission shows an order confirmation screen and order number. Keep that number for delivery questions or a verified product review after purchase.',
      },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    description: 'Answers about WhatsApp support, company verification, returns, and help after an order.',
    items: [
      {
        question: 'What is the fastest way to contact the store?',
        answer:
          'Use the WhatsApp button on www.nothingpakistan.pk for product, compatibility, stock, payment, pickup, or order questions. You can also use the Contact Us and Support Centre pages.',
      },
      {
        question: 'What information should I send for compatibility help?',
        answer:
          'Send the exact phone or device model, the product link, and the accessory type you need. A screenshot can help when model names or colour options are similar.',
      },
      {
        question: 'Where can I read the return and shipping policies?',
        answer:
          'Open the Shipping Policy and Returns Policy links from the footer or support routes before placing an order. These pages explain the current store guidance.',
      },
      {
        question: 'What should I do if the delivered item is damaged or incorrect?',
        answer:
          'Contact support promptly with your order number, phone number, photos or video of the item and packaging, and a clear description of the issue so the team can review it.',
      },
      {
        question: 'Can I verify the company before ordering?',
        answer:
          `Yes. Review the Company Verification page for ${companyLegalName}, ${companyIdentifier}, incorporation information, and official domains before placing an order.`,
      },
    ],
  },
]

export function buildOrganizationStructuredData() {
  const sameAs = [...new Set(['https://www.nothing.tech', ...socialLinks.map((item) => item.href)])]

  return {
    '@context': 'https://schema.org',
    '@type': ['OnlineStore', 'Organization'],
    '@id': buildAbsoluteUrl('/#organization'),
    name: siteBrandName,
    alternateName: ['CMF by Nothing Pakistan', 'Nothing Official Store Pakistan'],
    legalName: companyLegalName,
    url: companyWebsite,
    identifier: {
      '@type': 'PropertyValue',
      name: 'Company ID',
      propertyID: 'Company ID',
      value: companyCuin,
    },
    foundingDate: companyFoundingDate,
    description:
      `Nothing and CMF products store in Pakistan operated by ${companyLegalName} (${companyIdentifier}). Phones, earbuds, chargers, watches, and accessories with PKR pricing and WhatsApp support.`,
    slogan: siteTagline,
    telephone: siteContactPhone,
    logo: buildAbsoluteUrl('/favicon/apple-touch-icon.png'),
    image: buildAbsoluteUrl('/social/nothing-pakistan-og.jpg'),
    areaServed: {
      '@type': 'Country',
      name: sitePrimaryLocation.country,
    },
    inLanguage: 'en-PK',
    sameAs,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteContactAddress,
      addressLocality: sitePrimaryLocation.city,
      addressRegion: 'Punjab',
      addressCountry: sitePrimaryLocation.countryCode,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: siteContactPhone,
        areaServed: sitePrimaryLocation.countryCode,
        availableLanguage: ['English', 'Urdu'],
        url: siteContactWhatsappUrl,
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

export function buildLocalBusinessStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': buildAbsoluteUrl('/#local-business'),
    name: siteBrandName,
    legalName: companyLegalName,
    url: companyWebsite,
    identifier: companyIdentifier,
    foundingDate: companyFoundingDate,
    image: buildAbsoluteUrl('/social/nothing-pakistan-og.jpg'),
    telephone: siteContactPhone,
    priceRange: 'PKR',
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteContactAddress,
      addressLocality: sitePrimaryLocation.city,
      addressCountry: sitePrimaryLocation.countryCode,
    },
    areaServed: {
      '@type': 'Country',
      name: sitePrimaryLocation.country,
    },
    parentOrganization: {
      '@id': buildAbsoluteUrl('/#organization'),
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      telephone: siteContactPhone,
      areaServed: sitePrimaryLocation.countryCode,
      availableLanguage: ['en', 'en-PK', 'ur-PK'],
      url: buildAbsoluteUrl('/contact-us'),
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
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${buildAbsoluteUrl('/collections/shop-all')}?q={search_term_string}`,
      },
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
