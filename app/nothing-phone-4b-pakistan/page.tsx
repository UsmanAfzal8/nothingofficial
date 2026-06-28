import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import { buildAbsoluteUrl, buildFaqStructuredData, buildSeoKeywords } from '@/lib/utils/seo'

const title = 'Nothing Phone (4b) Pakistan: Launch Date, Price & Updates'
const description =
  'Nothing Phone (4b) launches on 7 July 2026. See confirmed design details, Pakistan launch time, expected availability, PTA guidance, FAQs, and WhatsApp reminders.'
const phone4bImage =
  'https://res.cloudinary.com/dklsubnzb/image/upload/v1782595462/nothing-official-store-pakistan/home/phone-4b-launch/nothing-phone-4b-blue-homepage.jpg'
const reminderUrl =
  'https://wa.me/923424476070?text=i%20need%20to%20buy%20phone%204b%20when%20avalible%20kindly%20inform%20me'

const faqs = [
  {
    question: 'What is Nothing Phone (4b)?',
    answer:
      'Nothing Phone (4b) is a confirmed 2026 smartphone from Nothing. It introduces the new b-series name and is positioned below the Phone (4a) family, although Nothing has not yet published the complete specifications or final market positioning.',
  },
  {
    question: 'When is Nothing Phone (4b) launching?',
    answer:
      'Nothing has scheduled the Phone (4b) reveal for 7 July 2026 at 11:00 BST. That is 3:00 PM Pakistan Standard Time on the same day.',
  },
  {
    question: 'What time is the Phone (4b) launch in Pakistan?',
    answer:
      'The reveal is scheduled for 3:00 PM PKT on Tuesday, 7 July 2026. Pakistan is four hours ahead of British Summer Time in July.',
  },
  {
    question: 'Is Nothing Phone (4b) officially confirmed?',
    answer:
      'Yes. Nothing has named the Phone (4b), announced its reveal date, and shown the exterior design. Processor, battery, charging, memory, exact camera hardware, price, and regional sales details remain unconfirmed before launch.',
  },
  {
    question: 'What does the Nothing Phone (4b) look like?',
    answer:
      'The confirmed blue model has a flat-sided unibody shape, a transparent-inspired rear panel, two vertically aligned rear cameras, a light strip near the lower-right corner, and a centered front camera cutout.',
  },
  {
    question: 'Does Nothing Phone (4b) have a Glyph Interface?',
    answer:
      'The official design image shows a slim illuminated strip on the rear. Nothing has not yet explained its functions, number of lighting zones, supported notifications, or whether it will use the same Glyph features as higher models.',
  },
  {
    question: 'How many rear cameras does Phone (4b) have?',
    answer:
      'The confirmed exterior shows two rear camera lenses. Sensor resolution, optical stabilization, ultrawide support, video modes, and camera software will need to be confirmed at the launch.',
  },
  {
    question: 'What is the Nothing Phone (4b) price in Pakistan?',
    answer:
      'No official Pakistan price has been announced. Any amount shown before the reveal should be treated as an estimate. The final local cost will depend on the international price, storage variant, currency movement, import costs, PTA status, and warranty route.',
  },
  {
    question: 'Will Nothing Phone (4b) be available in Pakistan?',
    answer:
      'Pakistan availability has not been confirmed yet. Nothing Pakistan is collecting reminder requests and will update the local product route when verified stock, variants, pricing, delivery, and support details are available.',
  },
  {
    question: 'How can I get a Phone (4b) availability reminder?',
    answer:
      'Select the Remind Me button on this page. WhatsApp will open with a prepared message asking Nothing Pakistan to inform you when Phone (4b) is available.',
  },
  {
    question: 'Is Nothing Phone (4b) PTA approved?',
    answer:
      'PTA approval is not confirmed before the phone is commercially available in Pakistan. Buyers should verify the exact IMEI status and whether a listing is PTA approved, non-PTA, or tax-unpaid before making payment.',
  },
  {
    question: 'What will the PTA tax be for Nothing Phone (4b)?',
    answer:
      'A reliable PTA tax figure cannot be published before the device and its customs valuation are available in Pakistan. Tax can also differ by registration method and government valuation changes.',
  },
  {
    question: 'Will Phone (4b) work on Jazz, Zong, Ufone, and Telenor?',
    answer:
      'Network compatibility cannot be finalized until Nothing publishes the supported bands for the relevant regional variant. Buyers should check the exact model number and band list before ordering an imported unit.',
  },
  {
    question: 'Is Nothing Phone (4b) a replacement for CMF Phone?',
    answer:
      'Nothing has not officially described Phone (4b) as a direct CMF replacement. Its timing follows confirmation that there will not be a new CMF phone in 2026, but the brands and product families remain distinct.',
  },
  {
    question: 'Is Phone (4b) cheaper than Phone (4a)?',
    answer:
      'The b-series is expected to sit below the a-series, but official pricing is required before calling it cheaper in Pakistan. Local stock, PTA status, storage, and launch promotions can change the final comparison.',
  },
  {
    question: 'Should I wait for Phone (4b) or buy Phone (4a)?',
    answer:
      'Wait until 7 July if you can postpone your purchase and want to compare the confirmed Phone (4b) specifications and price. Buy Phone (4a) now only when its known features, current price, and availability already meet your needs.',
  },
  {
    question: 'What colors will Phone (4b) have?',
    answer:
      'Blue is confirmed through the official design reveal. Additional colors have not been confirmed, so listings for other finishes should be treated cautiously until Nothing publishes the final range.',
  },
  {
    question: 'What storage and RAM options will Phone (4b) offer?',
    answer:
      'Nothing has not confirmed storage or RAM variants. Do not rely on pre-launch marketplace specifications because regional configurations can differ even after the global announcement.',
  },
  {
    question: 'Will a charger be included with Phone (4b)?',
    answer:
      'Box contents and charging specifications are not confirmed. Check the final Pakistan listing for the included cable, charger policy, supported wattage, and compatible Nothing or CMF charging accessories.',
  },
  {
    question: 'Where should I buy Nothing Phone (4b) in Pakistan?',
    answer:
      'Use a seller that clearly states the exact variant, PTA status, warranty route, box contents, delivery terms, and return process. Nothing Pakistan will publish a local buying route on nothingpakistan.pk when verified availability is ready.',
  },
] as const

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
  keywords: buildSeoKeywords([
    'Nothing Phone 4b Pakistan',
    'Nothing Phone 4b price in Pakistan',
    'Nothing Phone 4b launch date',
    'Nothing Phone 4b release date Pakistan',
    'Nothing Phone 4b PTA approved',
    'Nothing Phone 4b PTA tax',
    'Nothing Phone 4b specifications',
    'Nothing Phone 4b availability Pakistan',
    'Nothing Phone 4b pre order Pakistan',
    'buy Nothing Phone 4b Pakistan',
    'Phone 4b vs Phone 4a',
    'Nothing 4b Pakistan',
  ]),
  alternates: {
    canonical: buildAbsoluteUrl('/nothing-phone-4b-pakistan'),
  },
  openGraph: {
    title,
    description,
    url: buildAbsoluteUrl('/nothing-phone-4b-pakistan'),
    siteName: 'Nothing Pakistan',
    type: 'article',
    images: [
      {
        url: phone4bImage,
        width: 4096,
        height: 2305,
        alt: 'Blue Nothing Phone (4b) official design for Pakistan launch updates',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [phone4bImage],
  },
}

export default function NothingPhone4bPakistanPage() {
  const faqSchema = buildFaqStructuredData(faqs)
  const structuredData: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Nothing Phone (4b)',
      image: [phone4bImage],
      description,
      brand: {
        '@type': 'Brand',
        name: 'Nothing',
      },
      category: 'Smartphone',
      url: buildAbsoluteUrl('/nothing-phone-4b-pakistan'),
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'Reveal date',
          value: '7 July 2026',
        },
        {
          '@type': 'PropertyValue',
          name: 'Pakistan reveal time',
          value: '3:00 PM PKT',
        },
        {
          '@type': 'PropertyValue',
          name: 'Confirmed rear cameras',
          value: 'Two',
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: buildAbsoluteUrl('/'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Nothing Phone (4b) Pakistan',
          item: buildAbsoluteUrl('/nothing-phone-4b-pakistan'),
        },
      ],
    },
    ...(faqSchema ? [faqSchema] : []),
  ]

  return (
    <div className="min-h-screen bg-[#f4f4f1] text-black [font-family:var(--font-ntype82)]">
      <SeoStructuredData data={structuredData} />
      <NothingHeader />

      <main>
        <section className="relative flex min-h-[100svh] items-end justify-center overflow-hidden px-4 pb-4 pt-28">
          <Image
            src={phone4bImage}
            alt="Blue Nothing Phone (4b) shown in the official 2026 design reveal"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover"
          />
          <div className="relative z-10 w-[min(calc(100vw-2rem),520px)] rounded-[7px] bg-[#f4f4f1] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.12)]">
            <p className="[font-family:var(--font-ndot57)] text-[1.08rem] leading-none tracking-[0.06em] text-black/70">
              phone ( 4b )
            </p>
            <h1 className="mt-20 text-[1.65rem] font-normal leading-[1.06] sm:text-[2rem]">
              Nothing Phone (4b) Pakistan
            </h1>
            <p className="mt-3 text-[0.92rem] leading-6 text-black/70">
              Confirmed reveal: 7 July 2026, 3:00 PM Pakistan time
            </p>
            <a
              href={reminderUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 flex h-11 w-full items-center justify-center rounded-[5px] bg-black [font-family:var(--font-lettera-regular)] text-[0.7rem] uppercase tracking-[0.14em] text-white"
            >
              Remind me on WhatsApp
            </a>
          </div>
        </section>

        <section className="px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1180px]">
            <p className="[font-family:var(--font-lettera-regular)] text-[12px] uppercase tracking-[0.18em] text-black/46">
              Confirmed information
            </p>
            <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(300px,0.38fr)]">
              <div>
                <h2 className="max-w-3xl text-[38px] font-normal leading-[0.98] md:text-[56px]">
                  What Pakistan buyers know before launch
                </h2>
                <div className="mt-7 max-w-[760px] space-y-5 text-[16px] leading-[1.62] text-black/70">
                  <p>
                    Nothing Phone (4b) is official, but it is not fully announced yet. Nothing has confirmed the name, the
                    exterior design, and the 7 July reveal. The blue phone shown by the company uses a flatter unibody
                    shape, two rear cameras, a transparent-inspired panel, and a narrow rear light strip.
                  </p>
                  <p>
                    Everything else needs launch-day confirmation. That includes the chipset, RAM, storage, display
                    specification, camera sensors, battery, charging speed, software support, box contents, international
                    price, Pakistan price, PTA status, warranty route, and stock date.
                  </p>
                  <p>
                    Nothing Pakistan will keep this page factual. Rumours may help explain what buyers are discussing, but
                    they should not be presented as final specifications or used to collect advance payments.
                  </p>
                </div>
              </div>
              <dl className="border-y border-dotted border-black/45">
                {[
                  ['Product', 'Nothing Phone (4b)'],
                  ['Reveal date', '7 July 2026'],
                  ['Pakistan time', '3:00 PM PKT'],
                  ['Confirmed color', 'Blue'],
                  ['Rear cameras shown', 'Two'],
                  ['Pakistan price', 'Not announced'],
                  ['PTA status', 'Not confirmed'],
                ].map(([term, value]) => (
                  <div key={term} className="grid grid-cols-[0.9fr_1fr] gap-4 border-b border-dotted border-black/30 py-4 last:border-b-0">
                    <dt className="text-[13px] uppercase tracking-[0.08em] text-black/48">{term}</dt>
                    <dd className="text-[15px] leading-5">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="border-y border-dotted border-black/45 px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto grid max-w-[1180px] gap-x-10 gap-y-12 md:grid-cols-2">
            {[
              {
                title: 'Expected price in Pakistan',
                text: 'No official price is available yet. A useful Pakistan estimate can only be made after the international price and storage variants are announced. The final local amount may also change with exchange rates, import costs, PTA registration, seller warranty, and initial stock scarcity.',
              },
              {
                title: 'PTA approval and tax',
                text: 'Do not assume a launch-day imported unit is PTA approved. Ask for the exact IMEI status in writing and check it independently. A non-PTA price should never be compared directly with a PTA-approved price because the ownership cost is different.',
              },
              {
                title: 'Phone (4b) vs Phone (4a)',
                text: 'Phone (4a) is the known option; Phone (4b) is the upcoming option. Waiting until 7 July gives buyers real specifications and pricing to compare. The better model will depend on performance, cameras, battery, software support, and the final Pakistan price gap.',
              },
              {
                title: 'Buying safely at launch',
                text: 'Avoid advance payment to listings that cannot confirm the variant, PTA status, warranty, delivery date, and refund terms. Keep screenshots and invoices. A trustworthy launch listing should become more specific after the announcement, not remain vague.',
              },
            ].map((item) => (
              <article key={item.title} className="border-t border-dotted border-black/35 pt-6">
                <h2 className="text-[28px] font-normal leading-[1.05]">{item.title}</h2>
                <p className="mt-5 text-[15px] leading-[1.62] text-black/68">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1180px]">
            <div className="grid gap-8 lg:grid-cols-[0.42fr_1fr]">
              <div>
                <p className="[font-family:var(--font-lettera-regular)] text-[12px] uppercase tracking-[0.18em] text-black/46">
                  Launch checklist
                </p>
                <h2 className="mt-6 text-[34px] font-normal leading-none md:text-[46px]">
                  What to check on 7 July
                </h2>
              </div>
              <ol className="grid gap-0 border-t border-dotted border-black/35">
                {[
                  'Official processor, RAM, storage variants, and software support promise.',
                  'Display size, refresh rate, brightness, glass protection, and fingerprint hardware.',
                  'Main and secondary camera sensors, stabilization, video limits, and front camera.',
                  'Battery capacity, wired charging speed, charger policy, and box contents.',
                  'Supported 4G and 5G bands for the regional model likely to reach Pakistan.',
                  'International price, Pakistan estimate, PTA position, warranty, and delivery timing.',
                ].map((item, index) => (
                  <li key={item} className="grid grid-cols-[42px_1fr] gap-4 border-b border-dotted border-black/35 py-5 text-[15px] leading-[1.55]">
                    <span className="[font-family:var(--font-lettera-regular)] text-black/45">{String(index + 1).padStart(2, '0')}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="border-t border-dotted border-black/45 px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-[980px]">
            <p className="[font-family:var(--font-lettera-regular)] text-[12px] uppercase tracking-[0.18em] text-black/46">
              Nothing Phone (4b) FAQ
            </p>
            <h2 className="mt-6 text-[36px] font-normal leading-none md:text-[52px]">
              Questions Pakistan buyers are asking
            </h2>
            <div className="mt-10 border-t border-dotted border-black/40">
              {faqs.map((faq) => (
                <details key={faq.question} className="group border-b border-dotted border-black/40 py-5">
                  <summary className="cursor-pointer list-none pr-10 text-[18px] leading-[1.35] marker:hidden">
                    {faq.question}
                    <span className="float-right [font-family:var(--font-lettera-regular)] text-black/45 group-open:rotate-45">+</span>
                  </summary>
                  <p className="max-w-[800px] pt-4 text-[15px] leading-[1.62] text-black/68">{faq.answer}</p>
                </details>
              ))}
            </div>
            <div className="mt-12 flex flex-wrap gap-4">
              <a
                href={reminderUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-[5px] bg-black px-7 [font-family:var(--font-lettera-regular)] text-[11px] uppercase tracking-[0.12em] text-white"
              >
                Get availability reminder
              </a>
              <Link
                href="/blog"
                className="inline-flex h-12 items-center justify-center rounded-[5px] border border-black px-7 [font-family:var(--font-lettera-regular)] text-[11px] uppercase tracking-[0.12em]"
              >
                Read Phone (4b) guides
              </Link>
            </div>
          </div>
        </section>
      </main>

      <NothingFooter />
    </div>
  )
}
