import { buildAbsoluteUrl } from '@/lib/utils/seo'

export type PolicySlug =
  | 'privacy-policy'
  | 'terms-of-sale'
  | 'shipping-and-delivery-policy'
  | 'return-and-refund-policy'
  | 'warranty-policy'
  | 'acceptable-use-policy'
  | 'user-agreement'

type PolicySection = {
  title: string
  paragraphs: string[]
}

export type PolicyDocument = {
  slug: PolicySlug
  title: string
  summary: string
  effectiveDate: string
  lastUpdated: string
  sections: PolicySection[]
}

const policies: PolicyDocument[] = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    summary:
      'This Privacy Policy explains how the Nothing Pakistan collects, uses, stores, and protects your personal information when you browse, order, or request support.',
    effectiveDate: 'May 19, 2026',
    lastUpdated: 'May 19, 2026',
    sections: [
      {
        title: '1. Scope',
        paragraphs: [
          'This Privacy Policy applies to all services, pages, and checkout flows operated by the Nothing Pakistan.',
          'By using this website, you agree that the Nothing Pakistan may process your information as described in this policy and applicable law.',
        ],
      },
      {
        title: '2. Information We Collect',
        paragraphs: [
          'The Nothing Pakistan may collect your name, phone number, shipping address, city, district, and optional postal code to fulfill orders.',
          'We may also collect technical information such as device type, browser, IP address, and usage events to improve performance and prevent abuse.',
        ],
      },
      {
        title: '3. How We Use Information',
        paragraphs: [
          'The Nothing Pakistan uses your data to confirm orders, arrange delivery, provide support, and manage returns or warranty requests.',
          'We may use aggregated and de-identified analytics for service optimization, fraud prevention, and customer experience improvements.',
        ],
      },
      {
        title: '4. Sharing and Disclosure',
        paragraphs: [
          'The Nothing Pakistan may share relevant order data with logistics, payment, and support partners only to deliver services.',
          'We do not sell personal data to unrelated third parties for independent marketing purposes.',
        ],
      },
      {
        title: '5. Cookies and Tracking',
        paragraphs: [
          'The Nothing Pakistan uses cookies and similar technologies for session continuity, cart behavior, and website analytics.',
          'You can control cookie settings in your browser, but disabling some cookies may reduce website functionality.',
        ],
      },
      {
        title: '6. Data Retention and Security',
        paragraphs: [
          'The Nothing Pakistan retains personal information only as long as needed for order completion, legal obligations, and dispute handling.',
          'We apply reasonable technical and organizational safeguards, but no internet system can be guaranteed as fully secure.',
        ],
      },
      {
        title: '7. Your Rights',
        paragraphs: [
          'Subject to applicable law, you may request access, correction, or deletion of personal information held by the Nothing Pakistan.',
          'To make a request, contact our support team and include enough detail for account verification.',
        ],
      },
      {
        title: '8. Contact',
        paragraphs: [
          'For privacy questions, contact the Nothing Pakistan through the support centre or the contact methods shown on this website.',
        ],
      },
    ],
  },
  {
    slug: 'terms-of-sale',
    title: 'Terms of Sale',
    summary:
      'These Terms of Sale govern product purchases made through the Nothing Pakistan, including pricing, delivery, returns, and warranty handling.',
    effectiveDate: 'May 19, 2026',
    lastUpdated: 'May 19, 2026',
    sections: [
      {
        title: '1. Seller Identity',
        paragraphs: [
          'All orders placed on this website are processed by the Nothing Pakistan.',
          'These terms apply to every product order confirmed through this storefront.',
        ],
      },
      {
        title: '2. Order Placement and Acceptance',
        paragraphs: [
          'When you place an order, you submit a purchase offer to the Nothing Pakistan.',
          'Order acceptance occurs after confirmation and availability checks; we may cancel or limit quantities for stock, payment, or risk reasons.',
        ],
      },
      {
        title: '3. Pricing and Payments',
        paragraphs: [
          'Prices shown by the Nothing Pakistan are listed in the currency shown at checkout and may include or exclude taxes as indicated.',
          'You agree to provide valid payment details and authorize charges related to your order, including delivery charges where applicable.',
        ],
      },
      {
        title: '4. Shipping and Delivery',
        paragraphs: [
          'The Nothing Pakistan arranges shipping through delivery partners and provides estimated timelines where available.',
          'Delivery dates are estimates and may be affected by weather, public holidays, logistics constraints, or address verification issues.',
        ],
      },
      {
        title: '5. Returns, Replacements, and Refunds',
        paragraphs: [
          'Return and replacement eligibility at the Nothing Pakistan depends on product condition, proof of purchase, and return window rules.',
          'Approved refunds are processed through the original payment method or another compliant method offered at the time of refund.',
        ],
      },
      {
        title: '6. Warranty and Product Support',
        paragraphs: [
          'Products sold by the Nothing Pakistan may include manufacturer or seller warranty terms shown in product or support documentation.',
          'Warranty coverage can be refused for unauthorized repairs, accidental damage outside coverage, or policy violations.',
        ],
      },
      {
        title: '7. Limitation of Liability',
        paragraphs: [
          'To the maximum extent permitted by law, the Nothing Pakistan is not liable for indirect, incidental, or consequential damages.',
          'Nothing in these terms excludes rights that cannot be waived under applicable law.',
        ],
      },
      {
        title: '8. Governing Rules',
        paragraphs: [
          'These Terms of Sale are interpreted in line with applicable legal requirements in Pakistan unless mandatory law requires otherwise.',
          'Disputes should first be raised with the Nothing Pakistan support team for resolution.',
        ],
      },
    ],
  },
  {
    slug: 'shipping-and-delivery-policy',
    title: 'Shipping and Delivery Policy',
    summary:
      'This Shipping and Delivery Policy explains how the Nothing Pakistan handles dispatch timing, delivery expectations, address validation, and fulfillment communication.',
    effectiveDate: 'May 19, 2026',
    lastUpdated: 'May 19, 2026',
    sections: [
      {
        title: '1. Delivery Coverage',
        paragraphs: [
          'The Nothing Pakistan accepts orders for delivery to serviceable locations within Pakistan, subject to courier coverage and operational limitations.',
          'Some remote areas may require additional verification time or may not be eligible for standard delivery timelines.',
        ],
      },
      {
        title: '2. Dispatch and Confirmation',
        paragraphs: [
          'Orders are reviewed before dispatch to confirm stock, address details, and customer contact information.',
          'Dispatch timing may vary during launches, promotional periods, public holidays, or inventory updates.',
        ],
      },
      {
        title: '3. Delivery Timelines',
        paragraphs: [
          'Estimated delivery windows shown by the Nothing Pakistan are guidance only and are not guaranteed unless stated otherwise.',
          'Delays may occur due to courier disruption, weather events, incomplete addresses, verification holds, or force majeure circumstances.',
        ],
      },
      {
        title: '4. Customer Responsibilities',
        paragraphs: [
          'Customers must provide accurate delivery details including name, phone number, city, district, and complete address.',
          'If our team cannot confirm the order or the delivery information is incomplete, the Nothing Pakistan may delay, suspend, or cancel fulfillment.',
        ],
      },
      {
        title: '5. Failed Delivery Attempts',
        paragraphs: [
          'If a delivery attempt fails because the customer is unavailable, the address is incorrect, or the order cannot be handed over safely, the shipment may be returned or rescheduled.',
          'Additional delivery charges may apply where permitted and communicated in advance.',
        ],
      },
      {
        title: '6. Delivery Issues',
        paragraphs: [
          'If a parcel arrives damaged, incomplete, or significantly delayed, customers should contact the Nothing Pakistan support team as soon as possible.',
          'We may request order details, photos, or courier information to investigate the issue.',
        ],
      },
    ],
  },
  {
    slug: 'return-and-refund-policy',
    title: 'Return and Refund Policy',
    summary:
      'This Return and Refund Policy explains how the Nothing Pakistan reviews return eligibility, replacements, rejected deliveries, and approved refunds.',
    effectiveDate: 'May 19, 2026',
    lastUpdated: 'May 19, 2026',
    sections: [
      {
        title: '1. Eligibility Window',
        paragraphs: [
          'Return requests to the Nothing Pakistan must be made within the applicable return window communicated for the product or order type.',
          'Products returned outside the allowed period may be refused unless required by applicable law or warranty obligations.',
        ],
      },
      {
        title: '2. Product Condition',
        paragraphs: [
          'Returned items must generally be unused, complete, and accompanied by original packaging, accessories, and proof of purchase unless the item is faulty.',
          'The Nothing Pakistan may reject returns for damage caused after delivery, misuse, or missing components not attributable to the seller.',
        ],
      },
      {
        title: '3. Faulty, Damaged, or Incorrect Items',
        paragraphs: [
          'If you receive a defective, damaged, or incorrect product, contact support promptly so the Nothing Pakistan can review replacement or refund options.',
          'We may request photos, serial information, packaging details, or a courier incident summary before approving the claim.',
        ],
      },
      {
        title: '4. Refund Processing',
        paragraphs: [
          'Approved refunds are processed through the original payment method or another compliant method communicated by the Nothing Pakistan.',
          'Refund timing depends on internal review, banking timelines, payment provider processing, and successful return verification where applicable.',
        ],
      },
      {
        title: '5. Non-Returnable Situations',
        paragraphs: [
          'Products may be non-returnable where hygiene, activation, digital content access, tamper evidence, or product-specific restrictions reasonably apply.',
          'Items damaged by unauthorized repair attempts, accidental damage outside policy coverage, or policy abuse may be refused.',
        ],
      },
      {
        title: '6. Policy Abuse and Exceptions',
        paragraphs: [
          'The Nothing Pakistan may deny claims that appear fraudulent, repetitive, abusive, or inconsistent with the condition and order history of the item.',
          'Nothing in this policy removes rights that cannot be excluded under applicable law.',
        ],
      },
    ],
  },
  {
    slug: 'warranty-policy',
    title: 'Warranty Policy',
    summary:
      'This Warranty Policy explains how Nothing Pakistan reviews warranty expectations, seller support, manufacturer support, proof of purchase, and product issue reports.',
    effectiveDate: 'May 19, 2026',
    lastUpdated: 'May 19, 2026',
    sections: [
      {
        title: '1. Scope',
        paragraphs: [
          'This Warranty Policy applies to products purchased through Nothing Pakistan and operated by NOTHING OFFICIAL (SMC-PRIVATE) LIMITED.',
          'Warranty handling depends on the product type, order record, product condition, and any warranty terms communicated on the product page or during support confirmation.',
        ],
      },
      {
        title: '2. Proof of Purchase',
        paragraphs: [
          'Customers should keep order confirmation, payment records, invoice details where provided, packaging photos, and support messages.',
          'Warranty or replacement review may be delayed or refused if the customer cannot provide enough information to verify the order.',
        ],
      },
      {
        title: '3. What Warranty Review May Cover',
        paragraphs: [
          'Warranty review may cover verified manufacturing faults, incorrect items, or defects reported within the applicable support window.',
          'Coverage does not automatically include accidental damage, liquid damage, misuse, unauthorized repair, missing accessories, cosmetic wear after use, or issues caused by incompatible third-party products.',
        ],
      },
      {
        title: '4. Reporting a Warranty Issue',
        paragraphs: [
          'Contact support as soon as an issue is noticed and provide order details, product photos, packaging photos, videos where useful, and a clear description of the problem.',
          'Nothing Pakistan may ask for additional evidence before approving inspection, replacement, repair guidance, or another support outcome.',
        ],
      },
      {
        title: '5. Manufacturer and Seller Support',
        paragraphs: [
          'Some products may be handled through manufacturer support, seller support, or a product-specific review process depending on availability and warranty terms.',
          'Company registration verifies the Pakistani business identity behind the storefront and does not replace product-specific warranty terms.',
        ],
      },
      {
        title: '6. Contact',
        paragraphs: [
          'For warranty help, contact Nothing Pakistan through the support centre, contact page, or WhatsApp support route published on this website.',
        ],
      },
    ],
  },
  {
    slug: 'acceptable-use-policy',
    title: 'Acceptable Use Policy',
    summary:
      'This Acceptable Use Policy sets behavior rules for use of the Nothing Pakistan website, support features, and account tools.',
    effectiveDate: 'May 19, 2026',
    lastUpdated: 'May 19, 2026',
    sections: [
      {
        title: '1. Purpose',
        paragraphs: [
          'This policy protects customers, systems, and staff of the Nothing Pakistan from abuse, fraud, and unlawful activity.',
          'By using this website, you agree to follow this Acceptable Use Policy at all times.',
        ],
      },
      {
        title: '2. Permitted Use',
        paragraphs: [
          'You may use the Nothing Pakistan website for lawful product browsing, purchasing, support requests, and account management.',
          'Any use must be honest, accurate, and consistent with these policies.',
        ],
      },
      {
        title: '3. Prohibited Conduct',
        paragraphs: [
          'You must not attempt unauthorized access, exploit vulnerabilities, scrape restricted data, or interfere with service availability.',
          'You must not submit false orders, use stolen payment methods, impersonate others, or post abusive, illegal, or harmful content through support channels.',
        ],
      },
      {
        title: '4. Account and Checkout Integrity',
        paragraphs: [
          'The Nothing Pakistan may suspend accounts or block orders that appear fraudulent, automated, or policy-violating.',
          'Repeated invalid transactions or abuse of promotions may result in permanent restrictions.',
        ],
      },
      {
        title: '5. Security Testing and Automation',
        paragraphs: [
          'Any automated testing, scraping, crawling, or bot traffic against the Nothing Pakistan requires prior written authorization.',
          'Unauthorized load generation, vulnerability probing, or bypass attempts are strictly prohibited.',
        ],
      },
      {
        title: '6. Enforcement',
        paragraphs: [
          'The Nothing Pakistan may investigate violations and take action including warning, suspension, cancellation, and legal escalation where needed.',
          'We may cooperate with lawful requests from authorities consistent with applicable law.',
        ],
      },
      {
        title: '7. Reporting Abuse',
        paragraphs: [
          'If you discover misuse or security concerns affecting the Nothing Pakistan, report it via the support centre as soon as possible.',
        ],
      },
    ],
  },
  {
    slug: 'user-agreement',
    title: 'User Agreement',
    summary:
      'This User Agreement defines the general terms for accessing and using the Nothing Pakistan website and related support services.',
    effectiveDate: 'May 19, 2026',
    lastUpdated: 'May 19, 2026',
    sections: [
      {
        title: '1. Agreement to Terms',
        paragraphs: [
          'By visiting or using this website, you agree to this User Agreement with the Nothing Pakistan.',
          'If you do not agree, you must stop using the website and related services.',
        ],
      },
      {
        title: '2. Eligibility and Accuracy',
        paragraphs: [
          'You confirm that information provided to the Nothing Pakistan is true, complete, and updated when required.',
          'You are responsible for keeping account and contact details accurate for delivery and support purposes.',
        ],
      },
      {
        title: '3. Product and Content Information',
        paragraphs: [
          'The Nothing Pakistan works to keep product details accurate, but images, availability, and technical specs may change without notice.',
          'Pricing, offers, and stock status are not guaranteed until order confirmation.',
        ],
      },
      {
        title: '4. Intellectual Property',
        paragraphs: [
          'All trademarks, logos, text, graphics, and site design used by the Nothing Pakistan remain protected intellectual property.',
          'You may not copy, republish, reverse engineer, or commercially exploit site content without written permission.',
        ],
      },
      {
        title: '5. Third-Party Services',
        paragraphs: [
          'The Nothing Pakistan may link to external services for payments, support, or social channels; those services follow their own terms.',
          'We are not responsible for policies or outages on third-party platforms beyond our control.',
        ],
      },
      {
        title: '6. Service Changes and Availability',
        paragraphs: [
          'The Nothing Pakistan may update, suspend, or discontinue site features, promotions, or pages at any time.',
          'Planned and unplanned downtime may occur for maintenance, upgrades, or infrastructure events.',
        ],
      },
      {
        title: '7. Limitation and Indemnity',
        paragraphs: [
          'To the extent permitted by law, the Nothing Pakistan is not responsible for indirect or consequential losses arising from website use.',
          'You agree to indemnify the Nothing Pakistan against losses caused by your violation of this User Agreement.',
        ],
      },
      {
        title: '8. Updates to This Agreement',
        paragraphs: [
          'The Nothing Pakistan may revise this User Agreement periodically, and updated terms become effective when posted.',
          'Continuing to use the website after updates means you accept the revised agreement.',
        ],
      },
    ],
  },
]

export const policySlugs: PolicySlug[] = policies.map((policy) => policy.slug)

export function getPolicyBySlug(slug: string): PolicyDocument | undefined {
  return policies.find((policy) => policy.slug === slug)
}

export function getPolicyCanonical(slug: PolicySlug): string {
  return buildAbsoluteUrl(`/pages/policies/${slug}`)
}

export const allPolicies = policies
