import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { HomeFaqTabs } from '@/components/HomeFaqTabs'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import {
  buildOrganizationStructuredData,
  buildWebsiteStructuredData,
  homeFaqCategories,
  homeSeoFaqs,
  homeSeoHighlights,
  siteBrandName,
  siteKeywords,
  siteTrustLinks,
} from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildFaqStructuredData, buildSeoKeywords } from '@/lib/utils/seo'

const homeMetaTitle = 'Nothing Pakistan | Phones, CMF, Chargers & Earbuds'
const homeMetaDescription =
  'Shop Nothing and CMF products in Pakistan with live pricing, WhatsApp support, Lahore pickup, and SECP registered company verification.'

const heroVideo = {
  src: 'https://res.cloudinary.com/dklsubnzb/video/upload/f_mp4,q_auto/nothing-official-store-pakistan/home/nothing-charli-hero-video.mp4',
  poster: 'https://res.cloudinary.com/dklsubnzb/video/upload/f_jpg,so_0,w_1600/nothing-official-store-pakistan/home/nothing-charli-hero-video.jpg',
} as const

const productImageUrls = {
  headphoneA: 'https://cdn.shopify.com/s/files/1/0376/5420/0459/files/Headphone-a-white.png?v=1771948423',
  phone4aPro: 'https://cdn.shopify.com/s/files/1/0376/5420/0459/files/Phone-4a-Pro-White.png?v=1771948315',
  headphone1: 'https://cdn.shopify.com/s/files/1/0376/5420/0459/files/0000s_0021_Headphone1-white.png?v=1753434394',
  ear3: 'https://cdn.shopify.com/s/files/1/0376/5420/0459/files/Ear3-white_9c7c5465-3f29-4bb9-a438-7883444a6bad.png?v=1756911995',
  phone4a: 'https://cdn.shopify.com/s/files/1/0376/5420/0459/files/Phone-4a-White.png?v=1771948069',
  phone3: 'https://cdn.shopify.com/s/files/1/0376/5420/0459/files/0000s_0011_Phone-3-white.png?v=1753434595',
} as const

const homeProductPanels = [
  {
    title: 'headphone ( a )',
    headline: 'Five days of back-to-back tracks',
    subline: 'w/ Global Brand Ambassador + Shareholder Charli xcx',
    href: '/products/nothing-pakistan-headphone-a',
    image: productImageUrls.headphoneA,
    background: 'https://cdn.sanity.io/images/gtd4w1cq/production/15fcb585ab7a03ec909309c84edbeea4ea6caf21-4096x2305.jpg?auto=format',
    objectPosition: '50% 50%',
  },
  {
    title: 'phone ( 4a ) pro',
    headline: 'Stay in the moment with Essential Notifications',
    subline: 'w/ Global Brand Ambassador + Shareholder Charli xcx',
    href: '/products/nothing-pakistan-phone-4a-pro',
    image: productImageUrls.phone4aPro,
    background: 'https://cdn.sanity.io/images/gtd4w1cq/production/a05e25f26a142d70dab62bbe79872a6bea922415-4096x2305.jpg?auto=format',
    objectPosition: '50% 50%',
  },
  {
    title: 'headphone ( 1 )',
    headline: 'Custom sound with tuning by KEF',
    subline: 'w/ Global Brand Ambassador + Shareholder Charli xcx',
    href: '/products/nothing-pakistan-headphone-1',
    image: productImageUrls.headphone1,
    background: 'https://cdn.sanity.io/images/gtd4w1cq/production/6e7ce8b020e81a6e157c8c0d7ccacc16961f7896-4096x2305.jpg?auto=format',
    objectPosition: '50% 50%',
  },
  {
    title: 'ear ( 3 )',
    headline: 'Cut out background noise with Super Mic',
    subline: 'w/ Global Brand Ambassador + Shareholder Charli xcx',
    href: '/products/nothing-pakistan-ear-3',
    image: productImageUrls.ear3,
    background: 'https://cdn.sanity.io/images/gtd4w1cq/production/697fde89d6c4734f07e67628875f81d148c0b17c-4096x2305.jpg?auto=format',
    objectPosition: '50% 50%',
  },
  {
    title: 'phone ( 4a )',
    headline: 'Get live delivery updates with the new Glyph Bar',
    subline: '',
    href: '/products/nothing-pakistan-phone-4a',
    image: productImageUrls.phone4a,
    background: 'https://cdn.sanity.io/images/gtd4w1cq/production/d2a928661850d77fa8db5489eb53af14990639e8-4096x2305.jpg?auto=format',
    objectPosition: '50% 50%',
  },
  {
    title: 'phone ( 3 )',
    headline: 'Take your best photos with four 50 MP cameras',
    subline: '',
    href: '/products/nothing-pakistan-phone-3',
    image: productImageUrls.phone3,
    background: 'https://cdn.sanity.io/images/gtd4w1cq/production/4ef2af4fc4259cb398efe107002fca5355159f73-4096x2305.jpg?auto=format',
    objectPosition: '50% 50%',
  },
] as const

export const metadata: Metadata = {
  title: {
    absolute: homeMetaTitle,
  },
  description: homeMetaDescription,
  keywords: buildSeoKeywords(siteKeywords, [
    `${siteBrandName} homepage`,
    'Nothing phone accessories Pakistan',
    'Nothing Pakistan accessories',
    'Nothing Pakistan chargers',
    'Nothing Pakistan phones',
    'Nothing audio Pakistan',
  ]),
  alternates: {
    canonical: buildAbsoluteUrl('/'),
  },
  openGraph: {
    title: homeMetaTitle,
    description: homeMetaDescription,
    url: buildAbsoluteUrl('/'),
    type: 'website',
    images: [
      {
        url: buildAbsoluteUrl('/opengraph-image'),
        width: 1200,
        height: 630,
        alt: homeMetaTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: homeMetaTitle,
    description: homeMetaDescription,
    images: [buildAbsoluteUrl('/twitter-image')],
  },
}

function ProductCard({
  title,
  headline,
  subline,
  image,
  href,
}: {
  title: string
  headline: string
  subline: string
  image: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="relative z-10 block w-[min(calc(100vw-2rem),480px)] rounded-[7px] bg-[#f4f4f1] p-4 text-black shadow-[0_22px_70px_rgba(0,0,0,0.12)] sm:p-5"
    >
      <div className="relative min-h-[220px] sm:min-h-[214px]">
        <p className="pr-32 [font-family:var(--font-ndot57)] text-[1.02rem] leading-none tracking-[0.06em] text-black/70 sm:text-[1.08rem]">
          {title}
        </p>
        <Image
          src={image}
          alt=""
          width={168}
          height={168}
          unoptimized
          className="absolute right-1 top-2 h-[118px] w-[118px] object-contain sm:right-2 sm:top-1 sm:h-[148px] sm:w-[148px]"
        />
        <div className="absolute inset-x-0 bottom-0">
          <h2 className="[font-family:var(--font-ntype82-headline)] text-[1.16rem] leading-[1.12] text-black sm:max-w-[330px] sm:text-[1.32rem]">
            {headline}
          </h2>
          {subline ? (
            <p className="mt-3 [font-family:var(--font-ntype82)] text-[0.78rem] leading-5 text-black sm:text-[0.84rem]">
              {subline}
            </p>
          ) : null}
          <span className="mt-4 flex h-10 w-full items-center justify-center rounded-[5px] bg-black [font-family:var(--font-lettera-regular)] text-[0.68rem] uppercase tracking-[0.14em] text-white">
            Discover
          </span>
        </div>
      </div>
    </Link>
  )
}

function HeroSection() {
  return (
    <section className="relative flex min-h-[100svh] items-end justify-center overflow-hidden bg-black px-4 pb-4 pt-28">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={heroVideo.poster}
        preload="auto"
      >
        <source src={heroVideo.src} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/20" />
      <ProductCard
        title="NOTHING ( CHARLI XCX )"
        headline="Our new campaign for Headphone (a)"
        subline="Shot by Aidan Zamiri in London"
        href="/products/nothing-pakistan-headphone-a"
        image={productImageUrls.headphoneA}
      />
    </section>
  )
}

function CampaignStorySection() {
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#0d0d0d] px-5 py-24 text-center text-white">
      <div className="relative z-10 mx-auto max-w-[700px]">
        <p className="dot-heading text-[0.82rem] leading-none tracking-[0.14em] text-white/84">
          Nothing (Charli xcx)
        </p>
        <div className="mt-5 space-y-8 [font-family:var(--font-ntype82)] text-[1.34rem] leading-[1.22] text-white sm:text-[1.5rem]">
          <p>
            Our first Global Brand Ambassador and latest Shareholder, Charli xcx brings her genre-crossing instincts to our new partnership. Together, we&apos;re changing how things are done - with music and machines for a new generation.
          </p>
          <p>
            In a campaign shot by Aidan Zamiri, we put her in a room for five days to test the battery on Headphone (a).
          </p>
          <p>It lasted the whole time.</p>
        </div>
      </div>
    </section>
  )
}

function HomeProductPanel({ panel }: { panel: (typeof homeProductPanels)[number] }) {
  return (
    <section className="relative flex min-h-[100svh] items-end justify-center overflow-hidden bg-[#f1f1ef] px-4 pb-4 pt-28">
      <Image
        src={panel.background}
        alt=""
        fill
        unoptimized
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: panel.objectPosition }}
      />
      <ProductCard
        title={panel.title}
        headline={panel.headline}
        subline={panel.subline}
        href={panel.href}
        image={panel.image}
      />
    </section>
  )
}

const homeAnswerBlocks = [
  {
    question: 'What can I shop on cmfbynothing.pk?',
    answer:
      'www.cmfbynothing.pk brings together Nothing and CMF phones, earbuds, headphones, watches, chargers, cables, protectors, covers, and accessories with prices shown in PKR.',
  },
  {
    question: 'Can I order from anywhere in Pakistan?',
    answer:
      'Yes. Customers can place delivery orders from cities across Pakistan. The checkout collects the delivery address, city, district, phone number, and selected payment method.',
  },
  {
    question: 'Can I collect an order in Lahore?',
    answer:
      'Yes. Choose store pickup on the order page to open a WhatsApp message for the Garden Town, Lahore location and confirm when your selected item will be ready.',
  },
  {
    question: 'How can I verify the business before ordering?',
    answer:
      'Open the Company Verification page on www.cmfbynothing.pk to review the registered company name, CUIN, incorporation details, contact routes, and SECP certificate link.',
  },
] as const

function HomeSeoSection() {
  return (
    <section className="bg-transparent px-4 py-16 [font-family:var(--font-ntype82)] text-black md:px-8 md:py-24">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.45fr)] lg:items-start">
          <div>
            <p className="[font-family:var(--font-lettera-regular)] text-[12px] uppercase leading-none tracking-[0.18em] text-black/46">Official Nothing Pakistan</p>
            <h1 className="mt-6 max-w-4xl text-[42px] font-normal leading-[0.95] tracking-normal text-black md:text-[58px]">
              Nothing Pakistan for phones, CMF, earbuds, chargers and accessories
            </h1>
            <div className="mt-7 max-w-[760px] space-y-[18px] text-[15px] leading-[1.55] text-black/70 md:text-base">
              <p>
                Nothing Pakistan is built for shoppers who want a clear local source for Nothing Phone, CMF by Nothing, Nothing Ear, chargers, cables, protectors, watches, and everyday mobile accessories in Pakistan. The site connects product discovery with PKR pricing, model details, order routes, WhatsApp support, company verification, shipping guidance, returns information, and after-sales help so customers can move from research to purchase with fewer doubts.
              </p>
              <p>
                The catalog is structured around the way people search: Nothing Phone Pakistan, Nothing Phone 3 Pakistan, CMF by Nothing Pakistan, Nothing Ear Pakistan, buy Nothing products Pakistan, and official Nothing partner Pakistan. Each collection links to relevant product pages, and every product page is designed to answer price, compatibility, specification, warranty, delivery, and support questions before checkout.
              </p>
            </div>
          </div>

          <div className="border-y border-dotted border-black/55 py-6 lg:mt-1">
            <p className="[font-family:var(--font-lettera-regular)] text-[12px] uppercase leading-none tracking-[0.18em] text-black/46">Quick Answers</p>
            <div className="mt-6 divide-y divide-dotted divide-black/35">
              {homeAnswerBlocks.map((item) => (
                <article key={item.question} className="py-5 first:pt-0 last:pb-0">
                  <h2 className="text-base font-normal leading-[1.45] text-black">{item.question}</h2>
                  <p className="mt-3 text-[15px] leading-[1.55] text-black/68">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 grid gap-x-8 gap-y-10 border-t border-dotted border-black/55 pt-10 md:grid-cols-3">
          {homeSeoHighlights.map((item) => (
            <article key={item.href}>
              <h2 className="text-[24px] font-normal leading-[1.08] tracking-normal text-black">{item.title}</h2>
              <p className="mt-5 text-[15px] leading-[1.55] text-black/68">{item.description}</p>
              <Link href={item.href} className="mt-6 inline-flex [font-family:var(--font-lettera-regular)] text-[12px] uppercase tracking-[0.12em] text-black underline underline-offset-4">
                {item.label}
              </Link>
            </article>
          ))}
        </div>

        <section className="mt-20 border-t border-dotted border-black/55 pt-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.52fr)_minmax(0,1fr)]">
            <div>
              <p className="[font-family:var(--font-lettera-regular)] text-[12px] uppercase leading-none tracking-[0.18em] text-black/46">Buying Guide</p>
              <h2 className="mt-6 text-[30px] font-normal leading-none tracking-normal text-black md:text-[46px]">
                How to choose Nothing and CMF products in Pakistan
              </h2>
            </div>
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
              <article className="border-t border-dotted border-black/35 pt-5">
                <h2 className="text-xl font-normal leading-tight text-black">Compare by product family</h2>
                <p className="mt-4 text-[15px] leading-[1.55] text-black/68">
                  Start with phones when you need Nothing OS, AI features, camera hardware, battery life, storage, RAM, display quality, and compatible accessories. Use audio and CMF collections when you are comparing earbuds, watches, charging products, or budget-friendly ecosystem options.
                </p>
              </article>
              <article className="border-t border-dotted border-black/35 pt-5">
                <h2 className="text-xl font-normal leading-tight text-black">Check price and compatibility</h2>
                <p className="mt-4 text-[15px] leading-[1.55] text-black/68">
                  Product pages show local buying context, image alt text, product descriptions, and internal links so shoppers can confirm the right charger, cable, protector, cover, or earbud before placing an order from Lahore, Karachi, Islamabad, Rawalpindi, Multan, and other cities.
                </p>
              </article>
              <article className="border-t border-dotted border-black/35 pt-5">
                <h2 className="text-xl font-normal leading-tight text-black">Review trust signals</h2>
                <p className="mt-4 text-[15px] leading-[1.55] text-black/68">
                  Nothing Pakistan publishes contact information, support pages, policies, SECP company verification, and after-sales routes to help customers understand who they are buying from, how delivery works, and what to do if they need help after receiving an order.
                </p>
              </article>
              <article className="border-t border-dotted border-black/35 pt-5">
                <h2 className="text-xl font-normal leading-tight text-black">Use answer-ready pages</h2>
                <p className="mt-4 text-[15px] leading-[1.55] text-black/68">
                  FAQ blocks, structured data, concise answers, breadcrumbs, and clear headings help Google, AI Overviews, ChatGPT, Gemini, Perplexity, Claude, Copilot, and other answer engines understand what Nothing Pakistan offers and where each product fits.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="mt-20 border-t border-dotted border-black/55 pt-10">
          <div>
            <h2 className="text-[30px] font-normal leading-none tracking-normal text-black md:text-[46px]">
              Questions about shopping on cmfbynothing.pk
            </h2>
          </div>
          <HomeFaqTabs categories={homeFaqCategories} />
        </section>

        <section className="mt-20 border-t border-dotted border-black/55 pt-10">
          <p className="[font-family:var(--font-lettera-regular)] text-[12px] uppercase leading-none tracking-[0.18em] text-black/46">Trust and support</p>
          <h2 className="mt-6 text-[30px] font-normal leading-none tracking-normal text-black">Review the store before you order</h2>
          <div className="mt-8 grid border-t border-dotted border-black/35 sm:grid-cols-2 lg:grid-cols-3">
            {siteTrustLinks.map((link) => (
              <Link key={link.href} href={link.href} className="border-b border-dotted border-black/35 py-6 pr-6 transition-opacity hover:opacity-55 sm:[&:nth-child(even)]:pl-6 lg:[&:nth-child(3n+2)]:px-6 lg:[&:nth-child(3n)]:pl-6">
                <span className="block text-base font-normal leading-[1.45]">{link.title}</span>
                <span className="mt-3 block text-[14px] leading-[1.55] opacity-[0.68]">{link.description}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}

export default async function Home() {
  const homeFaqStructuredData = buildFaqStructuredData([
    ...homeSeoFaqs,
    ...homeAnswerBlocks,
    ...homeFaqCategories.flatMap((category) => category.items),
  ])
  const homeStructuredData: Record<string, unknown>[] = [
    buildOrganizationStructuredData(),
    buildWebsiteStructuredData(),
    ...(homeFaqStructuredData ? [homeFaqStructuredData] : []),
  ]

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f4f4f1] text-[#111]">
      <SeoStructuredData data={homeStructuredData} />
      <NothingHeader />

      <main>
        <HeroSection />
        <CampaignStorySection />
        {homeProductPanels.map((panel) => (
          <HomeProductPanel key={panel.title} panel={panel} />
        ))}
        <HomeSeoSection />
      </main>

      <NothingFooter />
    </div>
  )
}
