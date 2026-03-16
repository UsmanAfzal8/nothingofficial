export const supportHero = {
  title: 'Support Centre',
  description:
    'Learn more about your Nothing products, find answers, troubleshoot problems, request help and more.',
}

export const supportQuickLinks: Array<{ label: string; href: string; external?: boolean }> = [
  { label: 'Product Guide', href: '/collections/shop-all' },
  {
    label: 'Troubleshooting',
    href: 'https://support.nothing.tech/hc/en-us/categories/7455115681041-Troubleshooting',
    external: true,
  },
  {
    label: 'FAQs',
    href: 'https://support.nothing.tech/hc/en-us/categories/38487206374289-FAQ-General',
    external: true,
  },
  { label: 'After-Sales Service', href: '/pages/support-centre#contact-us' },
  { label: 'Software Download', href: '/pages/support-centre#software-download' },
  { label: 'Product Status', href: '/pages/support-centre#product-status' },
]

export const supportFaqs: Array<{ id: string; question: string; answer: string }> = [
  {
    id: 'latest-phone-os-ota',
    question: 'How to install the latest Phone OS via OTA?',
    answer:
      'Connect to stable Wi-Fi, keep battery above 50%, then open Settings > System > System updates. Download and install when available. The phone restarts automatically to finish the update.',
  },
  {
    id: 'android-auto',
    question: 'How to turn on Android Auto on my Nothing phone?',
    answer:
      'Check your car supports Android Auto, then go to Settings > Connected devices > Connection preferences > Android Auto. Use a quality data cable, allow permissions, and keep apps updated.',
  },
  {
    id: 'pair-earphones',
    question: 'How to pair my Nothing Ear or Ear (a) with my phone?',
    answer:
      'Open the charging case and hold the case button for 3 seconds to enter pairing mode, then connect from phone Bluetooth settings. If Fast Pair is available, follow the popup prompt.',
  },
  {
    id: 'chatgpt-headphone',
    question: 'How to activate the ChatGPT feature on my Nothing Headphone?',
    answer:
      'Update your Nothing phone and Nothing X app, install and sign in to ChatGPT, then assign ChatGPT in Nothing X > Controls > Voice AI > ChatGPT.',
  },
  {
    id: 'lockscreen-widgets',
    question: 'How to add lock screen widgets on my Nothing phone?',
    answer:
      'Open Settings > Lock screen > Lockscreen widgets, then add and arrange widgets as needed.',
  },
]
