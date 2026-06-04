import { companyLegalName } from '@/lib/data/company'

export type BlogLink = {
  label: string
  href: string
}

export type BlogSection = {
  title: string
  paragraphs: string[]
}

export type BlogPost = {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  excerpt: string
  author: string
  authorHref: string
  updatedDate: string
  heroImage: string
  productLinks: BlogLink[]
  collectionLinks: BlogLink[]
  sections: BlogSection[]
  faqs: Array<{ question: string; answer: string }>
}

const author = 'Usman Afzal'
const authorHref = '/authors/usman-afzal'
const updatedDate = '2026-05-19'
const heroImage = '/social/nothing-pakistan-og.jpg'

const commonTrustSection: BlogSection = {
  title: 'Why company verification matters',
  paragraphs: [
    `Before buying, customers should check the seller identity, support channel, return policy, payment instructions, and company information. Nothing Official Store Pakistan is operated by ${companyLegalName}, an SECP registered Pakistani company. This business identity is published on the Company Verification page so customers can review the legal name, CUIN, incorporation date, and certificate link before ordering.`,
    'Company registration is not the same as brand distributor authorization. It is a business identity signal that helps customers understand who operates the storefront. Buyers should still review product details, packaging expectations, warranty terms, and support communication before payment. Good purchasing decisions come from clear information rather than rushed checkout or unsupported claims.',
  ],
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'where-to-buy-original-nothing-products-in-pakistan',
    title: 'Where to Buy Original Nothing Products in Pakistan',
    metaTitle: 'Where to Buy Nothing Products in Pakistan',
    metaDescription:
      'Learn where to buy original Nothing and CMF products in Pakistan, what to verify, and how Nothing Official Store Pakistan supports safer online shopping.',
    excerpt:
      'A practical guide for Pakistan buyers who want Nothing or CMF products with clearer seller identity, support, delivery, and verification checks.',
    author,
    authorHref,
    updatedDate,
    heroImage,
    productLinks: [
      { label: 'CMF Buds Pro 2', href: '/products/cmf-buds-pro-2' },
      { label: 'Nothing Power 45W', href: '/products/nothing-power-45w' },
      { label: 'CMF Power 65W GaN', href: '/products/cmf-power-65w-gan' },
    ],
    collectionLinks: [
      { label: 'Shop All', href: '/collections/shop-all' },
      { label: 'Audio', href: '/collections/audio' },
      { label: 'Chargers', href: '/collections/chargers' },
    ],
    sections: [
      {
        title: 'Start with seller identity',
        paragraphs: [
          'When searching for Nothing products in Pakistan, the first question is not only which store has stock. It is whether the seller provides enough information for you to verify who you are buying from. A strong product page should show the product name, price in Pakistan, delivery route, support channel, return expectations, and business identity. If any of those details are missing, ask before ordering.',
          'Nothing Official Store Pakistan publishes a dedicated company verification page, contact page, policy pages, and WhatsApp support route. These pages help customers check the registered company name, support details, and certificate link before placing an order. That makes the buying process more transparent for phones, earbuds, chargers, protectors, and CMF products.',
        ],
      },
      {
        title: 'Check product fit before payment',
        paragraphs: [
          'Nothing and CMF products often look similar across generations, but compatibility can be specific. A protector for one phone may not fit another model. A charger may support a wattage that is suitable for one device but unnecessary for another. Earbuds can differ by ANC, microphone performance, battery life, and app support. Before buying, confirm the exact model and use case.',
          'For accessories, share your phone model with support if you are unsure. For chargers, confirm your device charging requirements and whether you need a cable. For earbuds, compare calling, gaming, battery, ANC, and comfort needs. The safest purchase is the one where the listing, support answer, and order confirmation all match.',
        ],
      },
      {
        title: 'Review delivery and payment expectations',
        paragraphs: [
          'Customers in Pakistan often compare COD, bank transfer, courier coverage, city delivery timing, and dispatch confirmation. A reliable checkout should make those expectations clear before payment. If an item is high value, ask whether pre-payment is required, how the order is documented, and how support will confirm dispatch.',
          'Keep screenshots of product pages, order confirmation, payment records, and support messages. These records help if you need delivery updates, replacement review, or return assistance. They also reduce confusion when multiple products or variants are available.',
        ],
      },
      commonTrustSection,
    ],
    faqs: [
      {
        question: 'Where can I buy Nothing products in Pakistan?',
        answer:
          'You can browse Nothing and CMF products on Nothing Official Store Pakistan, including phones, earbuds, chargers, protectors, and accessories. Check company verification and product details before buying.',
      },
      {
        question: 'What should I verify before ordering?',
        answer:
          'Verify the seller identity, product model, price in Pakistan, support channel, delivery terms, return policy, and company verification page before payment.',
      },
      {
        question: 'Does Nothing Official Store Pakistan provide company verification?',
        answer:
          'Yes. Nothing Official Store Pakistan links its SECP company verification page and certificate so customers can review the legal business identity.',
      },
    ],
  },
  {
    slug: 'nothing-phone-price-in-pakistan',
    title: 'Nothing Phone Price in Pakistan',
    metaTitle: 'Nothing Phone Price in Pakistan Guide',
    metaDescription:
      'Compare Nothing phone price expectations in Pakistan, accessories, compatibility, delivery, and seller verification before buying.',
    excerpt:
      'Understand Nothing phone pricing, compatibility, accessories, and trust checks for Pakistan buyers.',
    author,
    authorHref,
    updatedDate,
    heroImage,
    productLinks: [
      { label: 'Nothing Phone 3', href: '/products/phone-3' },
      { label: 'Nothing Phone 3a', href: '/products/phone-3a' },
      { label: 'Nothing Phone 3a Pro', href: '/products/phone-3a-pro' },
    ],
    collectionLinks: [
      { label: 'Phones', href: '/collections/phones' },
      { label: 'Protectors', href: '/collections/protectors' },
      { label: 'Chargers', href: '/collections/chargers' },
    ],
    sections: [
      {
        title: 'How to read phone prices',
        paragraphs: [
          'Nothing phone prices in Pakistan can vary by model, storage, color, import timing, availability, and market demand. When comparing prices, do not look at the number alone. Check whether the listing is for a phone, a phone compatibility hub, or an accessory page connected to a phone model. Also confirm whether accessories, delivery, or taxes are included.',
          'A good phone page should help buyers understand the device, compatible chargers, protectors, earbuds, and support routes. Even if you are only checking price, the surrounding information matters because phones often lead to accessory purchases and warranty questions.',
        ],
      },
      {
        title: 'Accessories affect real ownership cost',
        paragraphs: [
          'The real cost of owning a phone usually includes a charger, cable, screen protector, cover, and sometimes earbuds. When comparing a Nothing phone price in Pakistan, consider the accessories you will need on day one. A lower phone price can become less useful if compatible accessories are hard to find or support is unclear.',
          'Nothing Official Store Pakistan connects phone pages with related accessories where possible. This helps buyers move from phone interest to compatible products without guessing model names or protector sizes.',
        ],
      },
      {
        title: 'Delivery and support checks',
        paragraphs: [
          'Phone orders require careful delivery and payment handling. Confirm the city, dispatch timing, payment method, support channel, and return expectations before placing an order. For high-value products, ask how the order is documented and what proof you will receive after confirmation.',
          'If a phone listing seems unclear, contact support with the exact model name and storage requirement. It is better to ask twice before payment than to manage a mismatch after dispatch.',
        ],
      },
      commonTrustSection,
    ],
    faqs: [
      {
        question: 'What affects Nothing phone price in Pakistan?',
        answer:
          'Model, storage, color, availability, import timing, delivery, and accessories can affect Nothing phone pricing in Pakistan.',
      },
      {
        question: 'Should I buy accessories with a Nothing phone?',
        answer:
          'Most buyers should consider a compatible charger, cable, protector, and cover so the device is ready for everyday use.',
      },
      {
        question: 'How do I verify the seller?',
        answer:
          'Check the company verification page, support channel, return policy, delivery details, and payment instructions before ordering.',
      },
    ],
  },
  {
    slug: 'cmf-products-price-in-pakistan',
    title: 'CMF Products Price in Pakistan',
    metaTitle: 'CMF Products Price in Pakistan',
    metaDescription:
      'Explore CMF product prices in Pakistan, earbuds, chargers, phones, accessories, support checks, and safer seller verification.',
    excerpt:
      'A CMF buyer guide for Pakistan covering prices, product types, compatibility, and company verification.',
    author,
    authorHref,
    updatedDate,
    heroImage,
    productLinks: [
      { label: 'CMF Buds Pro 2', href: '/products/cmf-buds-pro-2' },
      { label: 'CMF Power 65W GaN', href: '/products/cmf-power-65w-gan' },
      { label: 'CMF Buds Pro', href: '/products/cmf-buds-pro' },
    ],
    collectionLinks: [
      { label: 'CMF', href: '/collections/cmf' },
      { label: 'Audio', href: '/collections/audio' },
      { label: 'Chargers', href: '/collections/chargers' },
    ],
    sections: [
      {
        title: 'What CMF buyers compare',
        paragraphs: [
          'CMF products are popular because they bring distinctive design and strong value into earbuds, chargers, wearables, and phone-related categories. Pakistan buyers often compare battery life, ANC, microphone quality, charging wattage, portability, and price. A useful listing should explain which product is being sold, what it is best for, and how support handles delivery and ordering.',
          'CMF pricing can change with availability, launches, and import cost. Always check the current product page before placing an order, then confirm stock and delivery through support if timing matters.',
        ],
      },
      {
        title: 'Earbuds and charger decisions',
        paragraphs: [
          'For CMF earbuds, compare call quality, ANC strength, comfort, app support, battery life, and case design. For CMF chargers, compare wattage, port layout, cable needs, and device compatibility. These details matter more than a small price difference because the wrong product can be inconvenient even if it looks affordable.',
          'If you are buying for a specific Nothing phone, Android phone, laptop, or daily travel setup, ask support before ordering. A short compatibility check can prevent the most common buying mistakes.',
        ],
      },
      {
        title: 'Pakistan shopping checklist',
        paragraphs: [
          'Check PKR price, product name, product image, packaging expectation, delivery city, payment method, return policy, and support channel. Keep order records and inspect the product when it arrives. If something does not match your order confirmation, report it quickly with photos and details.',
        ],
      },
      commonTrustSection,
    ],
    faqs: [
      {
        question: 'Where can I browse CMF products in Pakistan?',
        answer:
          'Use the CMF collection on Nothing Official Store Pakistan to browse available CMF products, including earbuds, chargers, and related accessories.',
      },
      {
        question: 'What should I compare in CMF earbuds?',
        answer:
          'Compare ANC, microphone quality, battery life, comfort, app features, case size, and current price in Pakistan.',
      },
      {
        question: 'Are CMF chargers compatible with all phones?',
        answer:
          'Compatibility depends on the charger wattage, port type, cable, and device charging standard. Confirm your device requirements before buying.',
      },
    ],
  },
  {
    slug: 'original-vs-fake-nothing-accessories-pakistan',
    title: 'Original vs Unverified Nothing Accessories in Pakistan',
    metaTitle: 'Original Nothing Accessories Pakistan Guide',
    metaDescription:
      'Learn how to identify unverified sellers, check Nothing accessory packaging, review invoices, and shop carefully in Pakistan.',
    excerpt:
      'A careful guide to evaluating Nothing accessories without naming competitors or using aggressive claims.',
    author,
    authorHref,
    updatedDate,
    heroImage,
    productLinks: [
      { label: 'Nothing USB-C Cable', href: '/products/nothing-usb-c-to-usb-c-cable' },
      { label: 'Nothing Power 45W', href: '/products/nothing-power-45w' },
      { label: 'CMF Power 65W GaN', href: '/products/cmf-power-65w-gan' },
    ],
    collectionLinks: [
      { label: 'Accessories', href: '/collections/accessories' },
      { label: 'Chargers', href: '/collections/chargers' },
      { label: 'Protectors', href: '/collections/protectors' },
    ],
    sections: [
      {
        title: 'Use careful verification signals',
        paragraphs: [
          'Accessory buyers should focus on verifiable details rather than aggressive claims. Check the product name, connector type, packaging condition, listing images, invoice or order record, return policy, and support channel. If the seller avoids basic questions or cannot explain compatibility, treat that as a reason to pause and ask for more clarity.',
          'Unverified sellers may provide incomplete listings, unclear payment instructions, inconsistent contact details, or weak return information. The safest response is not to accuse anyone. It is to compare facts, ask for documentation, and buy from a business that publishes identity and support details.',
        ],
      },
      {
        title: 'Packaging and product match',
        paragraphs: [
          'When an accessory arrives, compare the delivered item with your order confirmation. Check the model, color, cable length, wattage, port type, or phone compatibility. For protectors and covers, confirm the phone model before opening or applying the item. For chargers and cables, check the connector and expected use case before regular use.',
          'Keep photos of the packaging if there is a problem. Clear photos help support review incorrect items, damage, or mismatch claims. Report issues quickly because delays can make return review harder.',
        ],
      },
      {
        title: 'Invoice and support records',
        paragraphs: [
          'A proper buying process should leave a trail: product page, order confirmation, support conversation, payment record, and delivery details. These records matter if you need replacement or return support. If a seller asks you to move to a channel that does not match the published store information, verify the instruction before paying.',
        ],
      },
      commonTrustSection,
    ],
    faqs: [
      {
        question: 'How can I identify unverified sellers?',
        answer:
          'Look for missing business identity, unclear support, incomplete product details, inconsistent payment instructions, and weak return information.',
      },
      {
        question: 'What should I check on Nothing accessories?',
        answer:
          'Check product model, packaging condition, connector type, wattage, compatibility, invoice or order record, and return expectations.',
      },
      {
        question: 'Should I name competitors when comparing sellers?',
        answer:
          'No. It is better to compare verifiable trust signals and avoid unsupported claims about other sellers.',
      },
    ],
  },
  {
    slug: 'best-nothing-accessories-in-pakistan',
    title: 'Best Nothing Accessories in Pakistan',
    metaTitle: 'Best Nothing Accessories in Pakistan',
    metaDescription:
      'Compare useful Nothing accessories in Pakistan, including chargers, cables, protectors, covers, earbuds, and safe buying checks.',
    excerpt:
      'A practical accessory guide for Nothing phone owners in Pakistan.',
    author,
    authorHref,
    updatedDate,
    heroImage,
    productLinks: [
      { label: 'Nothing Power 45W', href: '/products/nothing-power-45w' },
      { label: 'Nothing USB-C Cable', href: '/products/nothing-usb-c-to-usb-c-cable' },
      { label: 'CMF Buds Pro 2', href: '/products/cmf-buds-pro-2' },
    ],
    collectionLinks: [
      { label: 'Accessories', href: '/collections/accessories' },
      { label: 'Chargers', href: '/collections/chargers' },
      { label: 'Audio', href: '/collections/audio' },
    ],
    sections: [
      {
        title: 'Start with your phone model',
        paragraphs: [
          'The best accessory is the one that matches your device and daily routine. A Nothing phone owner may need a charger, cable, screen protector, cover, and earbuds. The exact choice depends on the phone model, charging habits, travel needs, and whether you use earbuds for calls, music, gaming, or workouts.',
          'Before buying, check the product page and ask support if a protector or cover fits your exact model. This is especially important where model names are similar or where a Pro, Plus, or Lite variant changes dimensions.',
        ],
      },
      {
        title: 'Chargers, cables, and protectors',
        paragraphs: [
          'Chargers and cables should be chosen around wattage, USB-C support, portability, and the devices you charge most often. Protectors should be chosen around fit, privacy preference, installation style, and case compatibility. A low-friction buying experience explains those details before checkout.',
          'Nothing Official Store Pakistan groups chargers, protectors, and accessories into collection pages so buyers can compare product types quickly. Product pages also link to support and verification routes for safer ordering.',
        ],
      },
      {
        title: 'Audio accessories',
        paragraphs: [
          'Earbuds are often the most personal accessory. Compare battery life, ANC, microphone performance, comfort, case size, and app support. If you take many calls, microphone quality may matter more than bass. If you commute, ANC and fit may matter more.',
        ],
      },
      commonTrustSection,
    ],
    faqs: [
      {
        question: 'Which accessories should I buy first?',
        answer:
          'Most buyers start with a charger, cable, screen protector, and cover. Earbuds are a strong next choice for calls and music.',
      },
      {
        question: 'How do I know a protector fits my phone?',
        answer:
          'Match the exact phone model and ask support before ordering if the model name or variant is unclear.',
      },
      {
        question: 'Where can I browse accessories?',
        answer:
          'Use the accessories, chargers, protectors, and audio collections on Nothing Official Store Pakistan.',
      },
    ],
  },
  {
    slug: 'nothing-earbuds-buying-guide-pakistan',
    title: 'Nothing Earbuds Buying Guide Pakistan',
    metaTitle: 'Nothing Earbuds Buying Guide Pakistan',
    metaDescription:
      'Compare Nothing and CMF earbuds in Pakistan by ANC, calls, comfort, battery, app features, price, and seller verification.',
    excerpt:
      'A buyer guide for Nothing and CMF earbuds shoppers in Pakistan.',
    author,
    authorHref,
    updatedDate,
    heroImage,
    productLinks: [
      { label: 'CMF Buds Pro 2', href: '/products/cmf-buds-pro-2' },
      { label: 'CMF Buds Pro', href: '/products/cmf-buds-pro' },
      { label: 'Nothing Ear A', href: '/products/ear-a' },
    ],
    collectionLinks: [
      { label: 'Audio', href: '/collections/audio' },
      { label: 'CMF', href: '/collections/cmf' },
      { label: 'Shop All', href: '/collections/shop-all' },
    ],
    sections: [
      {
        title: 'Choose by use case',
        paragraphs: [
          'Earbuds should be chosen around how you listen. For calls, prioritize microphone clarity and stable connection. For commuting, ANC and comfort matter. For workouts, fit and case convenience matter. For music, sound profile and app controls can become more important than the lowest price.',
          'Nothing and CMF earbuds vary by feature set, so read the product page carefully. If you are unsure between two models, ask support about your main use case before ordering.',
        ],
      },
      {
        title: 'What to compare',
        paragraphs: [
          'Compare ANC, transparency mode, microphone count, battery life, case charging, low latency, app controls, water resistance, and warranty expectations. Also check whether the earbuds are better suited for calls, music, gaming, or everyday commuting.',
          'Price in Pakistan is important, but it should be weighed against feature fit. A slightly higher price can be worthwhile if the earbuds solve your actual use case better.',
        ],
      },
      {
        title: 'Before and after delivery',
        paragraphs: [
          'Before delivery, keep the order confirmation and product link. After delivery, check packaging, model name, included accessories, and charging behavior. If something seems wrong, contact support with photos before extended use.',
        ],
      },
      commonTrustSection,
    ],
    faqs: [
      {
        question: 'Which Nothing earbuds are best for calls?',
        answer:
          'Choose earbuds with strong microphone performance, stable Bluetooth, and good fit. Ask support for current model guidance before ordering.',
      },
      {
        question: 'Do CMF earbuds work with Android phones?',
        answer:
          'CMF earbuds are designed for Bluetooth use with compatible devices. Check app and feature compatibility for your phone before buying.',
      },
      {
        question: 'What should I check when earbuds arrive?',
        answer:
          'Check packaging, model name, charging case, included tips, pairing behavior, and whether the delivered item matches your order.',
      },
    ],
  },
  {
    slug: 'nothing-charger-compatibility-guide',
    title: 'Nothing Charger Compatibility Guide',
    metaTitle: 'Nothing Charger Compatibility Guide',
    metaDescription:
      'Learn how to choose Nothing and CMF chargers in Pakistan by wattage, USB-C support, cables, device compatibility, and safe ordering.',
    excerpt:
      'A charger compatibility guide for Nothing, CMF, Android, and USB-C device buyers in Pakistan.',
    author,
    authorHref,
    updatedDate,
    heroImage,
    productLinks: [
      { label: 'Nothing Power 45W', href: '/products/nothing-power-45w' },
      { label: 'CMF Power 65W GaN', href: '/products/cmf-power-65w-gan' },
      { label: 'Nothing USB-C Cable', href: '/products/nothing-usb-c-to-usb-c-cable' },
    ],
    collectionLinks: [
      { label: 'Chargers', href: '/collections/chargers' },
      { label: 'Accessories', href: '/collections/accessories' },
      { label: 'Phones', href: '/collections/phones' },
    ],
    sections: [
      {
        title: 'Wattage is only one part',
        paragraphs: [
          'A charger should be chosen around device support, wattage, charging protocol, cable quality, number of ports, and daily use. Higher wattage does not always mean your phone will charge faster if the phone does not support that level. It may still be useful for charging multiple devices or a laptop, but compatibility should come first.',
          'When comparing Nothing and CMF chargers in Pakistan, check whether the product page explains port type, power output, and cable needs. If a cable is not included, plan for a compatible USB-C cable as part of the purchase.',
        ],
      },
      {
        title: 'Match charger to device',
        paragraphs: [
          'For phones, confirm the device charging capability. For earbuds and smaller accessories, a lower power charger may be enough. For laptops or multi-device setups, a GaN charger with more wattage and multiple ports may be useful. Ask support if you are unsure whether a charger is appropriate for your phone, laptop, or travel setup.',
        ],
      },
      {
        title: 'Safety and ordering',
        paragraphs: [
          'Use clear product listings and verified seller details when buying chargers. Keep the order record, inspect packaging, and report damage or mismatch quickly. Chargers are functional accessories, so it is worth checking compatibility carefully before payment.',
        ],
      },
      commonTrustSection,
    ],
    faqs: [
      {
        question: 'Which charger should I buy for a Nothing phone?',
        answer:
          'Choose based on your phone charging support, cable type, and whether you need multi-device charging. Ask support if unsure.',
      },
      {
        question: 'Do I need a separate USB-C cable?',
        answer:
          'Some charger listings may not include a cable. Check the product page and plan for a compatible USB-C cable if needed.',
      },
      {
        question: 'Is a higher watt charger always faster?',
        answer:
          'No. Charging speed depends on both the charger and the device charging standard.',
      },
    ],
  },
  {
    slug: 'cmf-buds-pro-2-price-in-pakistan',
    title: 'CMF Buds Pro 2 Price in Pakistan',
    metaTitle: 'CMF Buds Pro 2 Price in Pakistan',
    metaDescription:
      'Check CMF Buds Pro 2 price in Pakistan, features, ANC, battery, calls, packaging checks, and seller verification tips.',
    excerpt:
      'A focused CMF Buds Pro 2 guide for Pakistan buyers comparing price, features, and trust checks.',
    author,
    authorHref,
    updatedDate,
    heroImage,
    productLinks: [
      { label: 'CMF Buds Pro 2', href: '/products/cmf-buds-pro-2' },
      { label: 'CMF Buds Pro', href: '/products/cmf-buds-pro' },
      { label: 'CMF Buds 2a', href: '/products/cmf-buds-2a' },
    ],
    collectionLinks: [
      { label: 'Audio', href: '/collections/audio' },
      { label: 'CMF', href: '/collections/cmf' },
      { label: 'Shop All', href: '/collections/shop-all' },
    ],
    sections: [
      {
        title: 'Price and feature fit',
        paragraphs: [
          'CMF Buds Pro 2 price in Pakistan should be considered alongside ANC, sound quality, microphone performance, battery life, comfort, app features, and seller support. A buyer who mainly takes calls may care more about microphones than bass. A commuter may care more about ANC and fit. A student may care more about battery and value.',
          'Always check the current product page for live price and availability. Prices can change with stock, import cost, and launch timing, so confirm before placing an order.',
        ],
      },
      {
        title: 'What to check before ordering',
        paragraphs: [
          'Check the exact model name, color, product images, packaging expectation, return policy, delivery city, payment method, and support channel. If you are comparing CMF Buds Pro 2 with another earbud model, ask support which one better matches your use case.',
          'When the product arrives, inspect packaging, case condition, included ear tips, pairing, charging, and whether the delivered item matches your order. Keep your order confirmation in case support needs it later.',
        ],
      },
      commonTrustSection,
    ],
    faqs: [
      {
        question: 'Where can I check CMF Buds Pro 2 price in Pakistan?',
        answer:
          'Open the CMF Buds Pro 2 product page on Nothing Official Store Pakistan and confirm current stock and delivery details through support before ordering.',
      },
      {
        question: 'What matters most in CMF Buds Pro 2?',
        answer:
          'Compare ANC, call quality, sound, battery life, comfort, app controls, and price in Pakistan.',
      },
      {
        question: 'Should I verify the company before buying?',
        answer:
          'Yes. Review the company verification page and support details before placing an order.',
      },
    ],
  },
]

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}
