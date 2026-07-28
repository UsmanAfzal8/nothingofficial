import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { HomeFaqTabs } from '@/components/HomeFaqTabs'
import { LazyCampaignVideo } from '@/components/LazyCampaignVideo'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import { buildCloudinaryImageUrl } from '@/lib/cloudinary-image-loader'
import { getHomeBlogPosts } from '@/lib/data/blog-repository'
import {
  buildOrganizationStructuredData,
  buildLocalBusinessStructuredData,
  buildWebsiteStructuredData,
  homeFaqCategories,
  homeSeoFaqs,
  homeSeoHighlights,
  siteBrandName,
  siteKeywords,
  siteTrustLinks,
} from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildFaqStructuredData, buildSeoKeywords } from '@/lib/utils/seo'

const homeMetaTitle = 'Nothing Pakistan | Phone (4b), Phones, CMF & Earbuds'
const homeMetaDescription =
  'Discover Nothing Phone (4b) in Pakistan before its 7 July 2026 reveal. Get launch updates on WhatsApp and shop Nothing phones, CMF, audio, and accessories.'

const productImageUrls = {
  ear3a:
    'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto/v1783803777/nothing-official-store-pakistan/home/phone-4b-launch/nothing-ear-3a-product.png',
  phone4b:
    'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto/v1783803781/nothing-official-store-pakistan/home/phone-4b-launch/nothing-phone-4b-blue-product.png',
  headphoneA:
    'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto/v1782595495/nothing-official-store-pakistan/home/phone-4b-launch/nothing-headphone-a-product.png',
  phone4aPro:
    'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto/v1782595488/nothing-official-store-pakistan/home/phone-4b-launch/nothing-phone-4a-pro-product.png',
  headphone1:
    'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto/v1782595498/nothing-official-store-pakistan/home/phone-4b-launch/nothing-headphone-1-product.png',
  ear3:
    'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto/v1782595501/nothing-official-store-pakistan/home/phone-4b-launch/nothing-ear-3-product.png',
  phone4a:
    'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto/v1782595492/nothing-official-store-pakistan/home/phone-4b-launch/nothing-phone-4a-product.png',
  phone3:
    'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto/v1782595505/nothing-official-store-pakistan/home/phone-4b-launch/nothing-phone-3-product.png',
} as const

const campaignMediaUrls = {
  ear3a:
    'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto/v1783803753/nothing-official-store-pakistan/home/phone-4b-launch/nothing-ear-3a-homepage.jpg',
  ear3aMobile:
    'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto/v1783803761/nothing-official-store-pakistan/home/phone-4b-launch/nothing-ear-3a-homepage-mobile.jpg',
  phone4b:
    'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto/v1783803767/nothing-official-store-pakistan/home/phone-4b-launch/nothing-phone-4b-blue-homepage.jpg',
  phone4bMobile:
    'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto/v1783803771/nothing-official-store-pakistan/home/phone-4b-launch/nothing-phone-4b-blue-homepage-mobile.jpg',
  phone4aPro:
    'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto/v1782595469/nothing-official-store-pakistan/home/phone-4b-launch/nothing-phone-4a-pro-homepage.jpg',
  phone4a:
    'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto/v1782595474/nothing-official-store-pakistan/home/phone-4b-launch/nothing-phone-4a-homepage.jpg',
  headphone1:
    'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto/v1782595478/nothing-official-store-pakistan/home/phone-4b-launch/nothing-headphone-1-homepage.jpg',
  phone3:
    'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto/v1782595485/nothing-official-store-pakistan/home/phone-4b-launch/nothing-phone-3-homepage.jpg',
  headphoneAVideo:
    'https://res.cloudinary.com/dklsubnzb/video/upload/f_mp4,q_auto/v1782595518/nothing-official-store-pakistan/home/phone-4b-launch/nothing-headphone-a-homepage-video.mp4',
  headphoneAPoster:
    'https://res.cloudinary.com/dklsubnzb/video/upload/f_jpg,so_0,q_auto,w_1600/v1782595518/nothing-official-store-pakistan/home/phone-4b-launch/nothing-headphone-a-homepage-video.jpg',
  ear3Video:
    'https://res.cloudinary.com/dklsubnzb/video/upload/f_mp4,q_auto/v1782595539/nothing-official-store-pakistan/home/phone-4b-launch/nothing-ear-3-homepage-video.mp4',
  ear3Poster:
    'https://res.cloudinary.com/dklsubnzb/video/upload/f_jpg,so_0,q_auto,w_1600/v1782595539/nothing-official-store-pakistan/home/phone-4b-launch/nothing-ear-3-homepage-video.jpg',
} as const

const homeCampaignPanels = [
  {
    title: 'ear ( 3a )',
    headline: 'Your new party pill',
    subline: '',
    href: '/collections/nothing-pakistan-audio',
    image: productImageUrls.ear3a,
    background: campaignMediaUrls.ear3a,
    mobileBackground: campaignMediaUrls.ear3aMobile,
    mediaType: 'image',
    objectPosition: '50% 50%',
    cta: 'Discover',
  },
  {
    title: 'phone ( 4b )',
    headline: "You're hot, so is your phone",
    subline: 'Follow verified price and availability updates for Pakistan',
    href: '/nothing-phone-4b-pakistan',
    image: productImageUrls.phone4b,
    background: campaignMediaUrls.phone4b,
    mobileBackground: campaignMediaUrls.phone4bMobile,
    mediaType: 'image',
    objectPosition: '50% 50%',
    cta: 'Discover',
  },
  {
    title: 'phone ( 4a ) pro',
    headline: 'Stay in the moment with Essential Notification',
    subline: '',
    href: '/products/nothing-pakistan-phone-4a-pro',
    image: productImageUrls.phone4aPro,
    background: campaignMediaUrls.phone4aPro,
    mediaType: 'image',
    objectPosition: '50% 50%',
    cta: 'Discover',
  },
  {
    title: 'phone ( 4a )',
    headline: 'Get live delivery updates with the new Glyph Bar',
    subline: '',
    href: '/products/nothing-pakistan-phone-4a',
    image: productImageUrls.phone4a,
    background: campaignMediaUrls.phone4a,
    mediaType: 'image',
    objectPosition: '50% 50%',
    cta: 'Discover',
  },
  {
    title: 'headphone ( a )',
    headline: 'Five days of back-to-back tracks',
    subline: 'w/ Global Brand Ambassador + Shareholder Charli xcx',
    href: '/products/nothing-pakistan-headphone-a',
    image: productImageUrls.headphoneA,
    background: campaignMediaUrls.headphoneAVideo,
    poster: campaignMediaUrls.headphoneAPoster,
    mediaType: 'video',
    objectPosition: '50% 50%',
    cta: 'Discover',
  },
  {
    title: 'headphone ( 1 )',
    headline: 'Custom sound with tuning by KEF',
    subline: '',
    href: '/products/nothing-pakistan-headphone-1',
    image: productImageUrls.headphone1,
    background: campaignMediaUrls.headphone1,
    mediaType: 'image',
    objectPosition: '50% 50%',
    cta: 'Discover',
  },
  {
    title: 'ear ( 3 )',
    headline: 'Cut out background noise with Super Mic',
    subline: '',
    href: '/products/nothing-pakistan-ear-3',
    image: productImageUrls.ear3,
    background: campaignMediaUrls.ear3Video,
    poster: campaignMediaUrls.ear3Poster,
    mediaType: 'video',
    objectPosition: '50% 50%',
    cta: 'Discover',
  },
  {
    title: 'phone ( 3 )',
    headline: 'Take your best photos with four 50 MP cameras',
    subline: '',
    href: '/products/nothing-pakistan-phone-3',
    image: productImageUrls.phone3,
    background: campaignMediaUrls.phone3,
    mediaType: 'image',
    objectPosition: '50% 50%',
    cta: 'Discover',
  },
] as const

export const metadata: Metadata = {
  title: {
    absolute: homeMetaTitle,
  },
  description: homeMetaDescription,
  keywords: buildSeoKeywords(siteKeywords, [
    `${siteBrandName} homepage`,
    'Nothing Phone 4b Pakistan',
    'Nothing Phone 4b price in Pakistan',
    'Nothing Phone 4b launch date Pakistan',
    'Nothing Phone 4b availability Pakistan',
    'Nothing Phone 4b specifications',
    'Nothing Phone 4b PTA approved',
    'buy Nothing Phone 4b Pakistan',
    'Nothing Phone price in Pakistan',
    'Nothing mobiles price in Pakistan',
    'CMF Phone 2 Pro price in Pakistan',
    'Nothing Earbuds price in Pakistan',
    'CMF Power 140W GaN price in Pakistan',
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
    siteName: siteBrandName,
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
  cta,
  external = false,
  priority = false,
}: {
  title: string
  headline: string
  subline: string
  image?: string
  href: string
  cta: string
  external?: boolean
  priority?: boolean
}) {
  const card = (
    <>
      <div className="relative min-h-[220px] sm:min-h-[214px]">
        <p className={image ? 'pr-32 [font-family:var(--font-ndot57)] text-[1.02rem] leading-none tracking-[0.06em] text-black/70 sm:text-[1.08rem]' : '[font-family:var(--font-ndot57)] text-[1.02rem] leading-none tracking-[0.06em] text-black/70 sm:text-[1.08rem]'}>
          {title}
        </p>
        {image ? (
          <Image
            src={image}
            alt={`${title} product image from Nothing Pakistan`}
            width={168}
            height={168}
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            fetchPriority={priority ? 'high' : 'low'}
            className="absolute right-1 top-2 h-[118px] w-[118px] object-contain sm:right-2 sm:top-1 sm:h-[148px] sm:w-[148px]"
          />
        ) : null}
        <div className="absolute inset-x-0 bottom-0">
          <h2 className={`[font-family:var(--font-ntype82-headline)] text-[1.16rem] leading-[1.12] text-black sm:text-[1.32rem] ${image ? 'sm:max-w-[330px]' : ''}`}>
            {headline}
          </h2>
          {subline ? (
            <p className="mt-3 [font-family:var(--font-ntype82)] text-[0.78rem] leading-5 text-black sm:text-[0.84rem]">
              {subline}
            </p>
          ) : null}
          <span className="mt-4 flex h-10 w-full items-center justify-center rounded-[5px] bg-black [font-family:var(--font-lettera-regular)] text-[0.68rem] uppercase tracking-[0.14em] text-white">
            {cta}
          </span>
        </div>
      </div>
    </>
  )

  const className =
    'relative z-10 block w-[min(calc(100vw-2rem),480px)] rounded-[7px] bg-[#f4f4f1] p-4 text-black shadow-[0_22px_70px_rgba(0,0,0,0.12)] sm:p-5'

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className} aria-label={`${cta}: ${headline}`}>
        {card}
      </a>
    )
  }

  return (
    <Link href={href} className={className}>
      {card}
    </Link>
  )
}

function HomeCampaignPanel({
  panel,
  priority,
}: {
  panel: (typeof homeCampaignPanels)[number]
  priority: boolean
}) {
  return (
    <section
      className="relative flex min-h-[100svh] items-end justify-center overflow-hidden bg-[#f1f1ef] px-4 pb-4 pt-28"
      aria-label={`${panel.title} campaign`}
    >
      {panel.mediaType === 'video' ? (
        <LazyCampaignVideo
          src={panel.background}
          poster={panel.poster}
          objectPosition={panel.objectPosition}
          label={`${panel.title} campaign video`}
        />
      ) : (
        'mobileBackground' in panel ? (
          <picture className="absolute inset-0 block h-full w-full">
            <source
              media="(max-width: 767px)"
              sizes="100vw"
              srcSet={`${buildCloudinaryImageUrl(panel.mobileBackground, { width: 480 })} 480w, ${buildCloudinaryImageUrl(panel.mobileBackground, { width: 768 })} 768w, ${buildCloudinaryImageUrl(panel.mobileBackground, { width: 900 })} 900w`}
            />
            <img
              src={buildCloudinaryImageUrl(panel.background, { width: 1920 })}
              srcSet={`${buildCloudinaryImageUrl(panel.background, { width: 1024 })} 1024w, ${buildCloudinaryImageUrl(panel.background, { width: 1600 })} 1600w, ${buildCloudinaryImageUrl(panel.background, { width: 1920 })} 1920w`}
              sizes="100vw"
              alt={`${panel.title} campaign from Nothing Pakistan`}
              className="h-full w-full object-cover"
              style={{ objectPosition: panel.objectPosition }}
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
            />
          </picture>
        ) : (
          <Image
            src={panel.background}
            alt={`${panel.title} campaign from Nothing Pakistan`}
            fill
            priority={priority}
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: panel.objectPosition }}
          />
        )
      )}
      <ProductCard
        title={panel.title}
        headline={panel.headline}
        subline={panel.subline}
        href={panel.href}
        image={'image' in panel ? panel.image : undefined}
        cta={panel.cta}
        external={false}
        priority={priority}
      />
    </section>
  )
}

const homeAnswerBlocks = [
  {
    question: 'When will Nothing Phone (4b) be revealed?',
    answer:
      'Nothing has confirmed a Phone (4b) reveal for 7 July 2026 at 11:00 BST, which is 3:00 PM in Pakistan. Final specifications, price, and Pakistan stock are not confirmed before the reveal.',
  },
  {
    question: 'How can I get a Nothing Phone (4b) availability reminder?',
    answer:
      'Select Remind Me on the Nothing Pakistan homepage. WhatsApp will open with a ready message asking Nothing Pakistan to inform you when Phone (4b) becomes available.',
  },
  {
    question: 'What can I shop on nothingpakistan.pk?',
    answer:
      'www.nothingpakistan.pk brings together Nothing and CMF phones, earbuds, headphones, watches, chargers, cables, protectors, covers, and accessories with prices shown in PKR.',
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
      'Open the Company Verification page on www.nothingpakistan.pk to review the legal company name, company ID, incorporation details, contact routes, and official domains.',
  },
] as const

type HomeBlogPosts = Awaited<ReturnType<typeof getHomeBlogPosts>>

function HomeSeoSection({ blogPosts }: { blogPosts: HomeBlogPosts }) {
  return (
    <section className="bg-transparent px-4 py-16 [font-family:var(--font-ntype82)] text-black md:px-8 md:py-24">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.45fr)] lg:items-start">
          <div>
            <p className="[font-family:var(--font-lettera-regular)] text-[12px] uppercase leading-none tracking-[0.18em] text-black/46">Nothing Phone (4b) Pakistan</p>
            <h1 className="mt-6 max-w-4xl text-[42px] font-normal leading-[0.95] tracking-normal text-black md:text-[58px]">
              Nothing Phone (4b) launch updates for Pakistan
            </h1>
            <div className="mt-7 max-w-[760px] space-y-[18px] text-[15px] leading-[1.55] text-black/70 md:text-base">
              <p>
                Nothing Phone (4b) is the newest confirmed Nothing smartphone for 2026. Nothing has shown its blue unibody design, dual rear cameras, a slim Glyph-style light bar, and a 7 July reveal date. Until the launch presentation confirms the full hardware, Nothing Pakistan treats the processor, camera sensors, battery capacity, charging speed, memory variants, Pakistan price, PTA position, and local availability as unconfirmed.
              </p>
              <p>
                Pakistan buyers can use the Remind Me button to open WhatsApp and request an availability alert. This page will be updated as verified information becomes available, including Nothing Phone (4b) price in Pakistan, release timing, PTA approval guidance, supported network bands, storage options, colors, warranty route, delivery information, and comparisons with Phone (4a), Phone (4a) Pro, CMF Phone 2 Pro, and other Nothing phones.
              </p>
              <p>
                Nothing Pakistan also brings together Nothing and CMF phones, earbuds, headphones, chargers, watches, cables, cases, and screen protectors with PKR pricing and local support. Every launch update is written for Pakistan rather than copied from another market, because import cost, PTA registration, stock timing, warranty handling, and payment options can change the real buying decision.
              </p>
              <Link
                href="/nothing-phone-4b-pakistan"
                className="inline-flex [font-family:var(--font-lettera-regular)] text-[12px] uppercase tracking-[0.12em] text-black underline underline-offset-4"
              >
                Read the Phone (4b) Pakistan launch guide
              </Link>
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
                  Nothing Pakistan publishes contact information, support pages, policies, company verification, and after-sales routes to help customers understand who they are buying from, how delivery works, and what to do if they need help after receiving an order.
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
              Questions about shopping on nothingpakistan.pk
            </h2>
          </div>
          <HomeFaqTabs categories={homeFaqCategories} />
        </section>

        <section className="mt-20 border-t border-dotted border-black/55 pt-10" aria-labelledby="home-blog-heading">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="[font-family:var(--font-lettera-regular)] text-[12px] uppercase leading-none tracking-[0.18em] text-black/46">
                Latest stories
              </p>
              <h2 id="home-blog-heading" className="mt-6 text-[30px] font-normal leading-none tracking-normal text-black md:text-[46px]">
                From the Nothing Pakistan blog
              </h2>
            </div>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <article key={post.slug} className="flex min-w-0 flex-col overflow-hidden">
                <Link href={`/blog/${post.slug}`} className="block aspect-[4/3] overflow-hidden rounded-[8px] bg-black/5" aria-label={`Read ${post.title}`}>
                  {post.heroImage ? (
                    <Image
                      src={post.heroImage}
                      alt={post.title}
                      width={800}
                      height={600}
                      sizes="(max-width: 1023px) 50vw, 33vw"
                      className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-[1.02]"
                    />
                  ) : null}
                </Link>
                <div className="flex flex-1 flex-col pt-3 sm:pt-4">
                  <p className="[font-family:var(--font-lettera-regular)] text-[9px] uppercase tracking-[0.12em] text-black/45 sm:text-[10px]">
                    {new Date(post.updatedAt).toISOString().slice(0, 10)}
                  </p>
                  <h3 className="mt-3 text-[0.95rem] font-normal leading-[1.08] text-black sm:text-[1.25rem] lg:text-[1.45rem]">
                    <Link href={`/blog/${post.slug}`} className="transition-opacity hover:opacity-70">
                      {post.title}
                    </Link>
                  </h3>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-auto pt-4 [font-family:var(--font-lettera-regular)] text-[10px] uppercase tracking-[0.12em] text-black underline underline-offset-4 sm:text-[11px]"
                  >
                    Read more
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/blog"
              className="inline-flex h-12 min-w-[190px] items-center justify-center rounded-[6px] bg-black px-6 [font-family:var(--font-lettera-regular)] text-[11px] uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-80"
            >
              View all blogs
            </Link>
          </div>
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
  const blogPosts = await getHomeBlogPosts()
  const homeFaqStructuredData = buildFaqStructuredData([
    ...homeSeoFaqs,
    ...homeAnswerBlocks,
    ...homeFaqCategories.flatMap((category) => category.items),
  ])
  const homeStructuredData: Record<string, unknown>[] = [
    buildOrganizationStructuredData(),
    buildLocalBusinessStructuredData(),
    buildWebsiteStructuredData(),
    {
      '@context': 'https://schema.org',
      '@type': 'Thing',
      name: 'Nothing Phone (4b)',
      image: [campaignMediaUrls.phone4b],
      description:
        'Nothing Phone (4b) is a confirmed 2026 Nothing smartphone scheduled for reveal on 7 July 2026. Pakistan pricing and availability are not yet confirmed.',
      url: buildAbsoluteUrl('/nothing-phone-4b-pakistan'),
      category: 'Smartphone',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: 'Nothing Phone (4b) Reveal',
      startDate: '2026-07-07T15:00:00+05:00',
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
      image: [campaignMediaUrls.phone4b],
      description:
        'The confirmed Nothing Phone (4b) reveal, shown in Pakistan time. Follow Nothing Pakistan for local availability updates.',
      location: {
        '@type': 'VirtualLocation',
        url: buildAbsoluteUrl('/nothing-phone-4b-pakistan'),
      },
      organizer: {
        '@type': 'Organization',
        name: 'Nothing',
        url: 'https://nothing.tech/',
      },
    },
    ...(homeFaqStructuredData ? [homeFaqStructuredData] : []),
  ]

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f4f4f1] text-[#111]">
      <SeoStructuredData data={homeStructuredData} />
      <NothingHeader />

      <main>
        {homeCampaignPanels.map((panel, index) => (
          <HomeCampaignPanel key={panel.title} panel={panel} priority={index === 0} />
        ))}
        <HomeSeoSection blogPosts={blogPosts} />
      </main>

      <NothingFooter />
    </div>
  )
}
