import type { Metadata } from 'next'
import { companyIdentifier, companyLegalName, companyWebsite } from '@/lib/data/company'
import { siteBrandName, siteContactWhatsappUrl, siteKeywords, siteTrustLinks } from '@/lib/data/site-content'
import {
  buildAbsoluteUrl,
  buildBreadcrumbStructuredData,
  buildFaqStructuredData,
  buildRobotsMetadata,
  buildSeoKeywords,
} from '@/lib/utils/seo'

export type PillarFaq = {
  question: string
  answer: string
}

export type PillarLink = {
  label: string
  href: string
  description: string
}

export type PillarSection = {
  title: string
  body: string[]
}

export type PillarPageConfig = {
  slug: 'nothing-pakistan' | 'nothing-official-store-pakistan' | 'nothing-phones-pakistan' | 'cmf-by-nothing-pakistan'
  title: string
  description: string
  eyebrow: string
  heroTitle: string
  heroDescription: string
  directAnswer: {
    question: string
    answer: string
  }
  keywords: string[]
  introPoints: string[]
  sections: PillarSection[]
  faqs: PillarFaq[]
  browseLinks: PillarLink[]
  relatedLinks: PillarLink[]
}

const sharedTrustLinks = siteTrustLinks.slice(0, 5).map((link) => ({
  label: link.title,
  href: link.href,
  description: link.description,
}))

export const pillarPageConfigs: Record<PillarPageConfig['slug'], PillarPageConfig> = {
  'nothing-pakistan': {
    slug: 'nothing-pakistan',
    title: 'Nothing Pakistan | Official Store, Phones, CMF & Accessories',
    description:
      'Learn what Nothing Pakistan is, where to buy Nothing products in Pakistan, how to verify the business, and which collections cover phones, CMF, audio, chargers, and accessories.',
    eyebrow: 'Nothing Pakistan',
    heroTitle: 'Nothing Pakistan for phones, CMF, audio, chargers, and accessories.',
    heroDescription:
      'Nothing Pakistan is the answer-first landing page for people searching the brand in Pakistan. It connects shoppers to product families, company verification, support routes, policies, and the storefront pages that explain how to compare and buy Nothing and CMF products locally.',
    directAnswer: {
      question: 'What is Nothing Pakistan?',
      answer:
        'Nothing Pakistan refers to the Pakistan-facing storefront and support content on www.cmfbynothing.pk for Nothing and CMF products. It helps shoppers compare phones, earbuds, chargers, protectors, and accessories with PKR pricing, support routes, company verification, and order guidance.',
    },
    keywords: [
      'nothing pakistan',
      'nothing official store pakistan',
      'where to buy nothing in pakistan',
      'nothing accessories pakistan',
      'nothing ear pakistan',
    ],
    introPoints: [
      'Browse dedicated collections for phones, CMF, audio, chargers, protectors, and accessories.',
      'Review company verification, authenticity guidance, and policy pages before ordering.',
      'Use WhatsApp support for stock, compatibility, delivery, or pickup questions in Pakistan.',
    ],
    sections: [
      {
        title: 'Why this page exists',
        body: [
          'People search for Nothing Pakistan when they want one trustworthy place to understand the brand, compare current products, and decide where to buy. This pillar page keeps that search intent focused by linking product discovery with company identity, support, and order readiness.',
          'It also gives Google, ChatGPT, Gemini, Perplexity, Copilot, and other answer systems a clear summary of what the site covers, which product categories matter most, and which pages should be treated as the best next step for Pakistan-based shoppers.',
        ],
      },
      {
        title: 'What you can buy through the storefront',
        body: [
          'The storefront covers Nothing phones, CMF phones, earbuds, headphones, watches, chargers, cables, protectors, and everyday accessories. Each category page is designed to move shoppers from broad research into product-specific pages with availability, price, compatibility, and support information.',
          'Instead of keeping the brand explanation separate from the catalog, Nothing Pakistan ties them together so users can go from a brand search directly into phones, audio, accessories, or support without losing context.',
        ],
      },
      {
        title: 'How to verify the business before ordering',
        body: [
          `Nothing Pakistan is operated by ${companyLegalName} with ${companyIdentifier}. The company verification and authenticity pages are important because they make the legal identity, certificate route, and support process easier to confirm before payment.`,
          'That combination of legal identity, support routes, and policy visibility is useful for both buyers and search engines because it reduces ambiguity about who operates the storefront and how customers can get help after an order.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is Nothing Pakistan official?',
        answer:
          'The site presents itself as the Pakistan storefront for Nothing and CMF products and publishes company verification details. Buyers should review the company verification page and any published authorization or sourcing details before making a final purchase decision.',
      },
      {
        question: 'Where can I buy Nothing phones in Pakistan?',
        answer:
          'Use the Nothing Phones Pakistan page, the Phones collection, and individual product pages on www.cmfbynothing.pk to compare models, pricing context, accessories, and support routes.',
      },
      {
        question: 'Are Nothing accessories available in Pakistan?',
        answer:
          'Yes. The storefront includes categories for chargers, protectors, cables, audio products, and other compatible accessories for Nothing and CMF devices in Pakistan.',
      },
      {
        question: 'How can I contact Nothing Pakistan before ordering?',
        answer:
          'Use the WhatsApp support route or the Contact Us page on www.cmfbynothing.pk to ask about stock, compatibility, delivery, payment, or Lahore pickup.',
      },
    ],
    browseLinks: [
      { label: 'Nothing Phones Pakistan', href: '/nothing-phones-pakistan', description: 'Compare phone families, buying factors, and related collections.' },
      { label: 'CMF by Nothing Pakistan', href: '/cmf-by-nothing-pakistan', description: 'Browse the CMF ecosystem for phones, buds, watches, and chargers.' },
      { label: 'Phones collection', href: '/collections/phones', description: 'Open the current phone catalog with product pages and support routes.' },
      { label: 'Audio collection', href: '/collections/earbuds', description: 'Browse Nothing Ear, Headphone, and CMF audio products.' },
      { label: 'Accessories collection', href: '/collections/nothing-pakistan-accessories', description: 'Find chargers, protectors, cases, and other add-ons.' },
    ],
    relatedLinks: sharedTrustLinks,
  },
  'nothing-official-store-pakistan': {
    slug: 'nothing-official-store-pakistan',
    title: 'Nothing Official Store Pakistan | SECP Registered Store',
    description:
      `Nothing Official Store Pakistan guide for buying Nothing and CMF products from ${companyLegalName}, an SECP registered Pakistani company with ${companyIdentifier}, WhatsApp support, PKR pricing, and nationwide delivery guidance.`,
    eyebrow: 'Official Store Pakistan',
    heroTitle: 'Nothing Official Store Pakistan with company verification and local support.',
    heroDescription:
      'This page is built for shoppers searching for the official Nothing store in Pakistan. It explains the website domain, registered company identity, product categories, support routes, delivery context, and safe buying checks before placing an order.',
    directAnswer: {
      question: 'What is the Nothing official store website in Pakistan?',
      answer:
        `The Pakistan storefront is ${companyWebsite}. It is operated by ${companyLegalName}, an SECP registered Pakistani company with ${companyIdentifier}. Customers can use the site to browse Nothing and CMF products, review PKR prices, verify company details, and contact support before ordering.`,
    },
    keywords: [
      'nothing official store pakistan',
      'official nothing pakistan store',
      'buy nothing phone pakistan online',
      'nothing phone original pakistan',
      'cmfbynothing.pk',
    ],
    introPoints: [
      `Verify the business identity: ${companyLegalName}, ${companyIdentifier}, and the SECP certificate route.`,
      'Browse Nothing Phone, CMF Phone, earbuds, chargers, protectors, watches, and accessories from one Pakistan-focused store.',
      'Use WhatsApp support before payment for stock, colour, PTA context, delivery, pickup, or compatibility questions.',
    ],
    sections: [
      {
        title: 'Why official-store searches need a clear answer',
        body: [
          'Many Pakistan buyers search for Nothing official store Pakistan because they want to avoid fake sellers, copied product pages, confusing marketplace listings, and unsupported accessories. This page gives one direct answer about the website, legal identity, and safe next steps.',
          'The page also helps search engines and answer engines understand that cmfbynothing.pk is the domain that connects Nothing and CMF product discovery with company verification, order support, product pages, and policy pages for Pakistan users.',
        ],
      },
      {
        title: 'How to verify before ordering',
        body: [
          `Before paying, match the website address with ${companyWebsite}, open the Company Verification page, check ${companyLegalName}, review ${companyIdentifier}, and use the published support routes if anything looks unclear.`,
          'A safe order journey should keep you on cmfbynothing.pk for product pages, collection pages, support pages, policy pages, cart, and order flow. Be careful with sellers who copy product names but cannot show clear company verification or support details.',
        ],
      },
      {
        title: 'What you can buy from this store',
        body: [
          'The storefront is organized around Nothing phones, CMF phones, Nothing Ear and CMF Buds audio products, CMF watches, GaN chargers, USB-C cables, screen protectors, covers, and compatible accessories. Collection pages help users compare categories, while product pages carry price, images, specifications, FAQs, reviews, and order routes.',
          'For phone buyers, the most important checks are current PKR price, PTA or non-PTA context where relevant, compatible charger, protector or cover availability, delivery timing, support availability, and whether the exact model or colour is in stock before checkout.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is cmfbynothing.pk the Nothing official store website in Pakistan?',
        answer:
          `The Pakistan storefront is published at ${companyWebsite} and operated by ${companyLegalName}. Customers should verify the company details and use the support links on the site before ordering.`,
      },
      {
        question: 'How do I avoid fake Nothing sellers in Pakistan?',
        answer:
          'Check that the page is on cmfbynothing.pk, review the Company Verification page, confirm the legal company name and CUIN, avoid sending payment through unrelated links, and contact WhatsApp support from the website before ordering.',
      },
      {
        question: 'Can I buy Nothing Phone online in Pakistan from this store?',
        answer:
          'Yes. Use the Phones collection and individual product pages to review current phone listings, Pakistan price context, images, specifications, accessories, and order support.',
      },
      {
        question: 'Does Nothing Pakistan show prices in PKR?',
        answer:
          'Yes. Product pages and order flows are designed for Pakistan shoppers and show local PKR pricing where a product price is available.',
      },
      {
        question: 'Where can I verify the registered company?',
        answer:
          `Open the Company Verification page on ${companyWebsite} to review ${companyLegalName}, ${companyIdentifier}, incorporation details, official domains, and the SECP certificate route.`,
      },
      {
        question: 'Can I ask about PTA approval before buying a Nothing Phone?',
        answer:
          'Yes. Use the WhatsApp support route from the website to confirm current PTA or non-PTA context, model availability, delivery timing, and final order details before checkout.',
      },
    ],
    browseLinks: [
      { label: 'Phones collection', href: '/collections/phones', description: 'Compare current Nothing and CMF phone pages.' },
      { label: 'Shop all products', href: '/collections/shop-all', description: 'Browse phones, audio, chargers, protectors, covers, and accessories.' },
      { label: 'Company Verification', href: '/company-verification', description: 'Review legal company name, CUIN, and certificate details.' },
      { label: 'Product Authenticity', href: '/authenticity', description: 'Read how product sourcing and authenticity guidance is presented.' },
      { label: 'Contact Nothing Pakistan', href: '/contact-us', description: 'Use support routes before ordering or paying.' },
    ],
    relatedLinks: [
      { label: 'Nothing Pakistan', href: '/nothing-pakistan', description: 'Read the broader brand and storefront guide.' },
      { label: 'Nothing Phones Pakistan', href: '/nothing-phones-pakistan', description: 'Compare phone buying context and related accessories.' },
      { label: 'CMF by Nothing Pakistan', href: '/cmf-by-nothing-pakistan', description: 'Browse the CMF product ecosystem in Pakistan.' },
      ...sharedTrustLinks,
    ],
  },
  'nothing-phones-pakistan': {
    slug: 'nothing-phones-pakistan',
    title: 'Nothing Phones Pakistan | Prices, Models, PTA & Buying Guide',
    description:
      'Compare Nothing phones in Pakistan with buying guidance for models, price expectations, PTA and non-PTA context, accessories, software features, and support routes.',
    eyebrow: 'Nothing Phones Pakistan',
    heroTitle: 'Nothing Phones Pakistan for model comparison, pricing context, and buying guidance.',
    heroDescription:
      'This pillar page is built for shoppers looking for Nothing phone prices in Pakistan, the latest available models, and the right path to compare PTA context, accessories, AI features, and support before ordering.',
    directAnswer: {
      question: 'Where can I compare Nothing phones in Pakistan?',
      answer:
        'Use the Phones collection and product pages on www.cmfbynothing.pk to compare Nothing phones in Pakistan. The phone pages connect model discovery with pricing context, PTA or non-PTA guidance, accessories, support, and ordering routes.',
    },
    keywords: [
      'nothing phone pakistan',
      'buy nothing phone pakistan',
      'nothing phone price in pakistan',
      'nothing phone 2a price pakistan',
      'best nothing phone 2026',
    ],
    introPoints: [
      'Compare Nothing Phone and CMF Phone model pages from one phones hub.',
      'Review accessories, protectors, and chargers matched to each phone family.',
      'Use support routes when you need help with PTA context, stock, or compatibility.',
    ],
    sections: [
      {
        title: 'How to compare Nothing phones in Pakistan',
        body: [
          'Start with the phone family that matches your budget and feature priorities, then compare camera setup, battery life, RAM, storage, display, software experience, and the accessories you may need on day one. This keeps the buying decision grounded in real use instead of just marketing specs.',
          'Because Pakistan shoppers often ask about price, PTA status, and local buying context together, the best phone pages should answer all three rather than splitting them across different sources. That is why the phone catalog and supporting pages are linked so closely here.',
        ],
      },
      {
        title: 'What buyers usually want to know first',
        body: [
          'The most common questions are which Nothing phone is latest, which model offers the best value, how pricing changes between variants, and whether the right charger, protector, or earbuds are easy to add before checkout. A strong phone landing page needs to answer those questions quickly.',
          'This page also supports AI-answer visibility by keeping direct answers short, then using deeper sections and internal links for users who need product details, after-sales guidance, or support before placing an order.',
        ],
      },
      {
        title: 'Accessories and support matter in the decision',
        body: [
          'A phone purchase rarely stops at the handset. Buyers typically need a charger, cable, protector, case, or earbuds. Linking those pages from the phone journey improves user experience and creates stronger topical authority around Nothing phones in Pakistan.',
          'Support routes, authenticity guidance, and company verification are part of the buying decision too, especially when the customer wants reassurance before paying or needs clarification on stock and delivery.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is the best Nothing phone in Pakistan?',
        answer:
          'The best Nothing phone depends on your budget, camera needs, performance expectations, battery goals, and software priorities. Compare the current phone pages to see which model best fits your use case in Pakistan.',
      },
      {
        question: 'Can I buy Nothing Phone accessories in the same store?',
        answer:
          'Yes. The phone pages connect into chargers, protectors, audio products, and accessories so shoppers can build the full setup from the same storefront.',
      },
      {
        question: 'Does the site help with PTA or non-PTA context?',
        answer:
          'Yes. The phone-focused pages are written to support searches that combine model name, Pakistan pricing, and PTA or non-PTA buying context. Buyers should still confirm the exact listing details before ordering.',
      },
      {
        question: 'Where should I start if I only know I want a Nothing phone?',
        answer:
          'Start with the Phones collection, then open the phone pages that fit your budget and feature goals. From there you can move into product details, accessories, and support.',
      },
    ],
    browseLinks: [
      { label: 'Phones collection', href: '/collections/phones', description: 'Open current Nothing and CMF phone listings.' },
      { label: 'AI phone guide', href: '/ai-products', description: 'Review AI-focused Nothing phone features and software routes.' },
      { label: 'Chargers collection', href: '/collections/chargers', description: 'Compare chargers and power accessories for phone buyers.' },
      { label: 'Protectors collection', href: '/collections/protectors', description: 'Find glass, protectors, and cases for supported models.' },
      { label: 'Nothing Pakistan', href: '/nothing-pakistan', description: 'Return to the broader brand and storefront pillar page.' },
    ],
    relatedLinks: sharedTrustLinks,
  },
  'cmf-by-nothing-pakistan': {
    slug: 'cmf-by-nothing-pakistan',
    title: 'CMF by Nothing Pakistan | Phones, Buds, Watch & Chargers',
    description:
      'Explore CMF by Nothing in Pakistan with category guidance for CMF phones, buds, watches, chargers, pricing context, and how to compare the CMF ecosystem locally.',
    eyebrow: 'CMF by Nothing Pakistan',
    heroTitle: 'CMF by Nothing Pakistan for phones, buds, watches, and charging products.',
    heroDescription:
      'This page focuses on the CMF side of the ecosystem for shoppers in Pakistan who want budget-conscious Nothing hardware, from CMF phones and earbuds to watches and GaN charging accessories.',
    directAnswer: {
      question: 'What is CMF by Nothing in Pakistan?',
      answer:
        'CMF by Nothing in Pakistan refers to the CMF product ecosystem available through the storefront, including CMF phones, earbuds, watches, and chargers. It gives shoppers a simpler way to compare CMF products without mixing every search with the broader Nothing catalog.',
    },
    keywords: [
      'cmf pakistan',
      'cmf by nothing pakistan',
      'cmf phone 1 pakistan',
      'cmf buds pakistan',
      'cmf charger pakistan',
    ],
    introPoints: [
      'Open one page for the full CMF ecosystem in Pakistan.',
      'Compare CMF phones, buds, watches, and GaN chargers together.',
      'Move from brand research into current catalog pages and support routes quickly.',
    ],
    sections: [
      {
        title: 'Why shoppers search CMF separately',
        body: [
          'CMF attracts buyers who want Nothing design language and ecosystem thinking in a more budget-friendly range. That means CMF queries often need their own landing page instead of being buried inside general brand copy.',
          'A dedicated CMF page also helps search engines understand that CMF phones, buds, watches, and chargers are a coherent topic cluster rather than isolated product listings.',
        ],
      },
      {
        title: 'How to compare the CMF ecosystem',
        body: [
          'Phone buyers may care about design, battery, software, and value first. Audio buyers may care more about ANC, comfort, microphone quality, and battery life. Charger buyers often focus on wattage, port selection, and multi-device use. Grouping these comparisons under one CMF hub helps users move faster.',
          'This structure also supports internal linking because every CMF content piece can point back to a single authority page while still sending users into the right live collection or product page.',
        ],
      },
      {
        title: 'When to choose CMF instead of the main Nothing line',
        body: [
          'CMF is often the better route when you want practical value, clean industrial design, and ecosystem compatibility at a more approachable price point. The main Nothing line may be a better fit when your priority is the flagship or signature phone experience.',
          'Both routes matter for Pakistan shoppers, so this page links the CMF ecosystem to phones, chargers, accessories, and support without forcing users to start from a generic homepage search.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Where can I buy CMF by Nothing products in Pakistan?',
        answer:
          'Use the CMF by Nothing Pakistan page and the CMF collection on www.cmfbynothing.pk to browse current CMF phones, buds, watches, chargers, and related products.',
      },
      {
        question: 'What types of CMF products are available in Pakistan?',
        answer:
          'The storefront covers CMF phones, earbuds, watches, chargers, and related accessories, depending on current live catalog availability.',
      },
      {
        question: 'How do I compare CMF products with Nothing phones?',
        answer:
          'Start on the CMF page for the value-focused ecosystem, then compare with the Nothing Phones Pakistan page if you want to weigh broader phone-line options and accessories.',
      },
      {
        question: 'Can I contact support before buying a CMF product?',
        answer:
          'Yes. Use WhatsApp support or the Contact Us page to ask about stock, compatibility, delivery timing, or pickup before placing a CMF order.',
      },
    ],
    browseLinks: [
      { label: 'CMF collection', href: '/collections/nothing-pakistan-cmf', description: 'Browse the live CMF catalog.' },
      { label: 'Chargers collection', href: '/collections/chargers', description: 'Compare CMF Power GaN chargers and related accessories.' },
      { label: 'Audio collection', href: '/collections/earbuds', description: 'Browse CMF Buds and Nothing audio products.' },
      { label: 'Nothing Phones Pakistan', href: '/nothing-phones-pakistan', description: 'Compare CMF options with the broader phone lineup.' },
      { label: 'Nothing Pakistan', href: '/nothing-pakistan', description: 'Return to the broader brand authority page.' },
    ],
    relatedLinks: sharedTrustLinks,
  },
}

export function buildPillarPageMetadata(config: PillarPageConfig): Metadata {
  const canonicalPath = `/${config.slug}`

  return {
    title: {
      absolute: config.title,
    },
    description: config.description,
    keywords: buildSeoKeywords(siteKeywords, config.keywords),
    alternates: {
      canonical: buildAbsoluteUrl(canonicalPath),
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url: buildAbsoluteUrl(canonicalPath),
      type: 'website',
      images: [buildAbsoluteUrl('/social/nothing-pakistan-og.jpg')],
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: [buildAbsoluteUrl('/social/nothing-pakistan-og.jpg')],
    },
    robots: buildRobotsMetadata(),
  }
}

export function buildPillarPageStructuredData(config: PillarPageConfig) {
  const path = `/${config.slug}`
  const faqData = buildFaqStructuredData(config.faqs)

  return [
    buildBreadcrumbStructuredData([
      { label: 'Home', href: '/' },
      { label: config.eyebrow, href: path },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${buildAbsoluteUrl(path)}#webpage`,
      name: config.title,
      url: buildAbsoluteUrl(path),
      description: config.description,
      inLanguage: 'en-PK',
      about: {
        '@id': buildAbsoluteUrl('/#organization'),
        name: siteBrandName,
        legalName: companyLegalName,
        identifier: companyIdentifier,
      },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: config.browseLinks.map((link, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: buildAbsoluteUrl(link.href),
          name: link.label,
        })),
      },
    },
    ...(faqData ? [faqData] : []),
  ]
}

export const pillarSupportCta = {
  href: siteContactWhatsappUrl,
  label: 'Ask on WhatsApp',
}
