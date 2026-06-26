export type SupportPageSlug =
  | 'product-guide'
  | 'troubleshooting'
  | 'faqs'
  | 'after-sales-service'
  | 'software-download'
  | 'product-status'

export type SupportGuideCard = {
  title: string
  category: string
  description: string
  href: string
  imageUrl?: string
  imageAlt?: string
}

export type SupportRow = {
  title: string
  description: string
  actionLabel?: string
  href?: string
  whatsappMessage?: string
}

export type SupportSection = {
  title: string
  description?: string
  rows?: SupportRow[]
  cards?: SupportGuideCard[]
}

export type SupportDownload = {
  title: string
  description: string
  buttons: Array<{
    label: string
    href: string
  }>
}

export type SupportFaq = {
  question: string
  answer: string
}

export type SupportPageData = {
  slug: SupportPageSlug
  title: string
  eyebrow: string
  description: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  kind: 'cards' | 'rows' | 'faqs' | 'downloads' | 'status'
  sections?: SupportSection[]
  downloads?: SupportDownload[]
  faqs?: SupportFaq[]
}

const guideCards: SupportGuideCard[] = [
  {
    title: 'Phone (3a) Pro',
    category: 'Phones',
    description: 'Setup, Nothing OS updates, camera, charging, accessories, and Pakistan order support.',
    href: '/products/nothing-pakistan-phone-3a-pro',
    imageUrl: 'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto:eco,w_700,c_limit/nothing-official-store-pakistan/mobiles/phone-3a-pro/image/phone-3a-pro-schema-jsonimage0-phone-3a-pro-grey.webp',
    imageAlt: 'Phone 3a Pro support guide for Nothing Pakistan',
  },
  {
    title: 'Phone (3a)',
    category: 'Phones',
    description: 'Quick help for first setup, display, battery, SIM, software, and compatible accessories.',
    href: '/products/nothing-pakistan-phone-3a',
    imageUrl: 'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto:eco,w_700,c_limit/nothing-official-store-pakistan/mobiles/phone-3a/image/phone-3a-schema-jsonimage0-phone-3a-white.webp',
    imageAlt: 'Phone 3a support guide for Nothing Pakistan',
  },
  {
    title: 'Phone (3a) Lite',
    category: 'Phones',
    description: 'Everyday guidance for Nothing OS, data transfer, updates, camera, and local support.',
    href: '/products/nothing-pakistan-phone-3a-lite',
    imageUrl: 'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto:eco,w_700,c_limit/nothing-official-store-pakistan/mobiles/phone-3a-lite/image/phone-3a-lite-schema-jsonimage0-phone-3a-lite-white.webp',
    imageAlt: 'Phone 3a Lite support guide for Nothing Pakistan',
  },
  {
    title: 'Phone (3)',
    category: 'Phones',
    description: 'Product help for setup, charging, Nothing OS, accessories, and troubleshooting.',
    href: '/products/nothing-pakistan-phone-3',
    imageUrl: 'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto:eco,w_700,c_limit/nothing-official-store-pakistan/mobiles/phone-3/image/phone-3-schema-jsonimage0-phone-3-white.webp',
    imageAlt: 'Phone 3 support guide for Nothing Pakistan',
  },
  {
    title: 'Phone (2)',
    category: 'Phones',
    description: 'Find help for software updates, Bluetooth, battery, display, and device care.',
    href: '/products/nothing-pakistan-phone-2',
    imageUrl: 'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto:eco,w_700,c_limit/nothing-official-store-pakistan/mobiles/phone-2/image/phone-2-schema-jsonimage0-phone-2-white.webp',
    imageAlt: 'Phone 2 support guide for Nothing Pakistan',
  },
  {
    title: 'Phone (1)',
    category: 'Phones',
    description: 'Setup, repair guidance, accessory compatibility, updates, and common questions.',
    href: '/products/nothing-pakistan-phone-1',
    imageUrl: 'https://res.cloudinary.com/dbdsmy4em/image/upload/f_auto,q_auto:eco,w_700,c_limit/v1780457378/cmfbynothing/support/phone-1-white.webp',
    imageAlt: 'Phone 1 support guide for Nothing Pakistan',
  },
  {
    title: 'CMF Phone 2 Pro',
    category: 'Phones',
    description: 'Get support for CMF setup, accessories, display, battery, and update checks.',
    href: '/products/nothing-pakistan-cmf-phone-2-pro',
    imageUrl: 'https://res.cloudinary.com/dbdsmy4em/image/upload/f_auto,q_auto:eco,w_700,c_limit/v1780457380/cmfbynothing/support/cmf-phone-2-pro-orange.webp',
    imageAlt: 'CMF Phone 2 Pro support guide for Nothing Pakistan',
  },
  {
    title: 'CMF Buds 2 Plus',
    category: 'Audio',
    description: 'Pairing, app controls, ANC, call quality, charging case, and reset support.',
    href: '/products/nothing-pakistan-cmf-buds-2-plus',
  },
  {
    title: 'CMF Watch 3 Pro',
    category: 'Watches',
    description: 'Watch setup, app pairing, health data sync, notifications, and charging help.',
    href: '/products/nothing-pakistan-cmf-watch-3-pro',
  },
]

export const supportPages: SupportPageData[] = [
  {
    slug: 'product-guide',
    title: 'Product Guide',
    eyebrow: 'NOTHING (R) Support Centre',
    description: 'Tips, quick-start help, product pages, and setup guidance for Nothing Pakistan customers.',
    metaTitle: 'Product Guide | Nothing Pakistan Support Centre',
    metaDescription:
      'Browse Nothing Pakistan product guides for phones, audio, watches, accessories, setup, updates, and product help.',
    keywords: ['Nothing Pakistan product guide', 'Nothing phone guide Pakistan', 'Nothing support Pakistan'],
    kind: 'cards',
    sections: [
      {
        title: 'All Products',
        description: 'Select a product to review local product information and support routes.',
        cards: guideCards,
      },
    ],
  },
  {
    slug: 'troubleshooting',
    title: 'Troubleshooting',
    eyebrow: 'NOTHING (R) Support Centre',
    description: 'Step-by-step help for common phone, audio, watch, ordering, and accessory issues in Pakistan.',
    metaTitle: 'Troubleshooting | Nothing Pakistan Support Centre',
    metaDescription:
      'Troubleshoot Nothing phones, CMF audio, watches, charging, Bluetooth, orders, delivery, and accessories with Nothing Pakistan.',
    keywords: ['Nothing troubleshooting Pakistan', 'Nothing phone issue Pakistan', 'CMF troubleshooting Pakistan'],
    kind: 'rows',
    sections: [
      {
        title: 'Phones',
        rows: [
          {
            title: 'Phone will not charge or charges slowly',
            description:
              'Use the original or compatible PD charger and cable, clean the port gently, restart the phone, and check battery settings. Share your model on WhatsApp if the issue continues.',
            actionLabel: 'Get WhatsApp Help',
            whatsappMessage: 'Hi Nothing Pakistan, I need help because my Nothing phone is not charging properly.',
          },
          {
            title: 'Phone OS update is not showing',
            description:
              'Connect to stable Wi-Fi, keep battery above 50%, open Settings > System > System update, and retry after restarting the phone.',
          },
          {
            title: 'Mobile data, SIM, or network issue',
            description:
              'Confirm PTA/SIM status, reinsert the SIM, reset network settings, and check APN details from your network provider.',
          },
          {
            title: 'Bluetooth pairing issue',
            description:
              'Forget the accessory from Bluetooth settings, reset the accessory, restart the phone, and pair again from a fresh connection.',
          },
        ],
      },
      {
        title: 'Audio',
        rows: [
          {
            title: 'Earbuds are not pairing',
            description:
              'Place both earbuds in the case, hold the case button until the light blinks, forget old Bluetooth records, and pair again through Nothing X.',
          },
          {
            title: 'One earbud has low sound',
            description:
              'Clean the ear tip and mesh gently, check Nothing X balance controls, reset the earbuds, then test with another phone.',
          },
          {
            title: 'ANC or controls are not working',
            description:
              'Update Nothing X, check gesture settings, reinstall the app if needed, and confirm the earbuds firmware is current.',
          },
        ],
      },
      {
        title: 'Orders And Accessories',
        rows: [
          {
            title: 'Accessory does not fit my model',
            description:
              'Check the exact phone model before installing a case, UV glass, jelly sheet, or privacy glass. Send us your product photo on WhatsApp for confirmation.',
            actionLabel: 'Check Compatibility',
            whatsappMessage: 'Hi Nothing Pakistan, please confirm accessory compatibility for my Nothing product.',
          },
          {
            title: 'Order, delivery, or replacement support',
            description:
              'Share your name, city, product, and order details on WhatsApp so our team can check the case quickly.',
            actionLabel: 'Message Support',
            whatsappMessage: 'Hi Nothing Pakistan, I need support for my order or replacement request.',
          },
        ],
      },
    ],
  },
  {
    slug: 'faqs',
    title: 'FAQ General',
    eyebrow: 'NOTHING (R) Support Centre',
    description: 'Answers to the most common Nothing Pakistan questions about products, orders, warranty, delivery, and support.',
    metaTitle: 'FAQs | Nothing Pakistan Support Centre',
    metaDescription:
      'Read Nothing Pakistan FAQs for product authenticity, order support, delivery, warranty, returns, updates, and WhatsApp help.',
    keywords: ['Nothing Pakistan FAQ', 'Nothing Pakistan warranty', 'Nothing Pakistan delivery'],
    kind: 'faqs',
    faqs: [
      {
        question: 'How can I contact Nothing Pakistan support?',
        answer:
          'Use the WhatsApp contact button on this support centre. Share your product name, order details, city, and a clear description of the issue.',
      },
      {
        question: 'Are products listed on Nothing Pakistan original?',
        answer:
          'Nothing Pakistan focuses on original Nothing and CMF products with local product pages, company verification, and direct WhatsApp support before and after purchase.',
      },
      {
        question: 'How do I check product availability?',
        answer:
          'Open the product page or message WhatsApp with the model name. Stock can change, so our team confirms availability before order processing.',
      },
      {
        question: 'How do I install the latest Phone OS update?',
        answer:
          'Connect to stable Wi-Fi, keep the phone charged above 50%, then go to Settings > System > System update and follow the update prompt.',
      },
      {
        question: 'Can I get support for accessories like cases and protectors?',
        answer:
          'Yes. Send your exact phone model and accessory photo on WhatsApp so we can confirm compatibility and installation guidance.',
      },
      {
        question: 'What should I do if my earbuds are not pairing?',
        answer:
          'Place the earbuds in the case, hold the case button until pairing mode starts, remove old Bluetooth records, then pair again through Bluetooth or Nothing X.',
      },
      {
        question: 'Do you provide after-sales support?',
        answer:
          'Yes. After-sales requests are handled through WhatsApp so our team can collect photos, order details, product information, and next steps in one conversation.',
      },
      {
        question: 'Where can I find the IMEI or serial number?',
        answer:
          'For phones, dial *#06# or check Settings > About phone. For audio and watch products, check the box label, app information, or product packaging.',
      },
    ],
  },
  {
    slug: 'after-sales-service',
    title: 'After-Sales Service',
    eyebrow: 'NOTHING (R) Support Centre',
    description:
      'Get ongoing support after your purchase. Request help, replacements, compatibility checks, and service guidance through WhatsApp.',
    metaTitle: 'After-Sales Service | Nothing Pakistan Support Centre',
    metaDescription:
      'Request Nothing Pakistan after-sales service, replacement guidance, accessory compatibility checks, and product support through WhatsApp.',
    keywords: ['Nothing Pakistan after sales', 'Nothing Pakistan replacement', 'Nothing Pakistan service'],
    kind: 'rows',
    sections: [
      {
        title: 'Request Types',
        rows: [
          {
            title: 'Submit a support request',
            description:
              'For product issues, order support, replacements, accessory fit checks, or service guidance, message our team on WhatsApp.',
            actionLabel: 'Submit Request',
            whatsappMessage: 'Hi Nothing Pakistan, I want to submit an after-sales support request.',
          },
          {
            title: 'Track request status',
            description:
              'Already contacted us? Send your name, city, product, and previous chat details so we can check your request status.',
            actionLabel: 'Track Now',
            whatsappMessage: 'Hi Nothing Pakistan, please help me track my after-sales support request.',
          },
        ],
      },
      {
        title: 'More Services',
        rows: [
          {
            title: 'After-sales service policy',
            description:
              'Review support expectations, replacement checks, return guidance, product condition requirements, and claim handling for Pakistan orders.',
            actionLabel: 'Read More',
            href: '/pages/return-and-refund-policy',
          },
          {
            title: 'Warranty policy',
            description:
              'Read local warranty guidance before submitting a claim so you know which details and photos to prepare.',
            actionLabel: 'Read More',
            href: '/pages/warranty-policy',
          },
        ],
      },
    ],
  },
  {
    slug: 'software-download',
    title: 'Software Download',
    eyebrow: 'NOTHING (R) Support Centre',
    description: 'Get the latest official Nothing and CMF apps for phones, earbuds, and watches.',
    metaTitle: 'Software Download | Nothing Pakistan Support Centre',
    metaDescription:
      'Download Nothing X and CMF Watch apps for iOS and Android, with WhatsApp support from Nothing Pakistan.',
    keywords: ['Nothing X app Pakistan', 'CMF Watch app Pakistan', 'Nothing software download'],
    kind: 'downloads',
    downloads: [
      {
        title: 'Nothing X app download.',
        description: 'Use Nothing X to manage Nothing and CMF audio products, controls, ANC, firmware, and device settings.',
        buttons: [
          { label: 'App Store', href: 'https://apps.apple.com/app/id1568033706' },
          { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.nothing.smartcenter' },
        ],
      },
      {
        title: 'Nothing X watch support.',
        description: 'Use Nothing X for supported Nothing and CMF watch pairing, notifications, activity tracking, firmware, and device settings.',
        buttons: [
          { label: 'App Store', href: 'https://apps.apple.com/us/app/nothing-x/id1568033706' },
          { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.nothing.smartcenter' },
        ],
      },
    ],
    sections: [
      {
        title: 'Need Software Help?',
        rows: [
          {
            title: 'App pairing or firmware issue',
            description:
              'If your app, update, or firmware pairing is not working, send your device model and screenshot on WhatsApp.',
            actionLabel: 'Message Support',
            whatsappMessage: 'Hi Nothing Pakistan, I need help with Nothing or CMF software.',
          },
        ],
      },
    ],
  },
  {
    slug: 'product-status',
    title: 'Product Status',
    eyebrow: 'NOTHING (R) Support Centre',
    description: 'Check information about your product with your IMEI or serial number through Nothing Pakistan WhatsApp support.',
    metaTitle: 'Product Status | Nothing Pakistan Support Centre',
    metaDescription:
      'Check Nothing product status in Pakistan by sharing your IMEI or serial number with Nothing Pakistan support on WhatsApp.',
    keywords: ['Nothing IMEI check Pakistan', 'Nothing serial number Pakistan', 'Nothing product status'],
    kind: 'status',
    sections: [
      {
        title: 'How to find your IMEI/SN number?',
        rows: [
          {
            title: 'Phone IMEI',
            description:
              'Dial *#06#, check Settings > About phone, or review the product box label. Send the number through WhatsApp for support guidance.',
          },
          {
            title: 'Audio, watch, and accessory serial number',
            description:
              'Check the box label, product packaging, app device details, or printed serial number where available.',
          },
        ],
      },
    ],
  },
]

export const supportPageSlugs = supportPages.map((page) => page.slug)

export function getSupportPageBySlug(slug: string) {
  return supportPages.find((page) => page.slug === slug)
}
