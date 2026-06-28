export const supportHero = {
  title: 'Support Centre',
  description:
    'Learn more about your Nothing Pakistan products, find answers, troubleshoot problems, request help and more.',
  imageUrl: 'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto:eco,w_1600,c_limit/v1782636139/nothing-official-store-pakistan/support/support-centre-hero.webp',
  imageAlt: 'Nothing Pakistan Support Centre hero with Nothing phone and audio products',
}

export const supportQuickLinks: Array<{ label: string; href: string; external?: boolean }> = [
  { label: 'Product Guide', href: '/support-centre/product-guide' },
  { label: 'Troubleshooting', href: '/support-centre/troubleshooting' },
  { label: 'FAQs', href: '/support-centre/faqs' },
  { label: 'After-Sales Service', href: '/support-centre/after-sales-service' },
  { label: 'Software Download', href: '/support-centre/software-download' },
  { label: 'Product Status', href: '/support-centre/product-status' },
]

export const supportFaqs: Array<{ id: string; question: string; answer: string }> = [
  {
    id: 'latest-phone-os-ota',
    question: 'How to install the latest Phone OS via OTA?',
    answer:
      'Connect to stable Wi-Fi, keep battery above 50%, then open Settings > System > System updates. Download and install the update when it appears.',
  },
  {
    id: 'android-auto',
    question: 'How to turn on Android Auto on my Nothing phone?',
    answer:
      'Check your car supports Android Auto, then open Settings > Connected devices > Connection preferences > Android Auto. Use a quality data cable and allow the required permissions.',
  },
  {
    id: 'pair-earphones',
    question: 'How to pair my Nothing Ear or Ear (a) with my phone?',
    answer:
      'Open the charging case, hold the case button for 3 seconds, then connect from your phone Bluetooth settings. If Fast Pair appears, follow the popup prompt.',
  },
  {
    id: 'chatgpt-headphone',
    question: 'How to activate the ChatGPT feature on my Nothing Headphone?',
    answer:
      'Update your Nothing phone and Nothing X app, install and sign in to ChatGPT, then assign ChatGPT in Nothing X > Controls > Voice AI.',
  },
  {
    id: 'lockscreen-widgets',
    question: 'How to add lock screen widgets on my Nothing phone?',
    answer:
      'Open Settings > Lock screen > Lockscreen widgets, then add and arrange widgets as needed.',
  },
]
