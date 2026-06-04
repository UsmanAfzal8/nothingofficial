import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import {
  buildOrganizationStructuredData,
  buildWebsiteStructuredData,
  siteBrandName,
  siteKeywords,
} from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildSeoKeywords } from '@/lib/utils/seo'

const homeMetaTitle = 'Nothing Official Store Pakistan | Phones, CMF, Chargers & Earbuds'
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
    href: '/collections/audio',
    image: productImageUrls.headphoneA,
    background: 'https://cdn.sanity.io/images/gtd4w1cq/production/15fcb585ab7a03ec909309c84edbeea4ea6caf21-4096x2305.jpg?auto=format',
    objectPosition: '50% 50%',
  },
  {
    title: 'phone ( 4a ) pro',
    headline: 'Stay in the moment with Essential Notifications',
    subline: 'w/ Global Brand Ambassador + Shareholder Charli xcx',
    href: '/products/phone-4a-pro',
    image: productImageUrls.phone4aPro,
    background: 'https://cdn.sanity.io/images/gtd4w1cq/production/a05e25f26a142d70dab62bbe79872a6bea922415-4096x2305.jpg?auto=format',
    objectPosition: '50% 50%',
  },
  {
    title: 'headphone ( 1 )',
    headline: 'Custom sound with tuning by KEF',
    subline: 'w/ Global Brand Ambassador + Shareholder Charli xcx',
    href: '/collections/audio',
    image: productImageUrls.headphone1,
    background: 'https://cdn.sanity.io/images/gtd4w1cq/production/6e7ce8b020e81a6e157c8c0d7ccacc16961f7896-4096x2305.jpg?auto=format',
    objectPosition: '50% 50%',
  },
  {
    title: 'ear ( 3 )',
    headline: 'Cut out background noise with Super Mic',
    subline: 'w/ Global Brand Ambassador + Shareholder Charli xcx',
    href: '/products/ear-3',
    image: productImageUrls.ear3,
    background: 'https://cdn.sanity.io/images/gtd4w1cq/production/697fde89d6c4734f07e67628875f81d148c0b17c-4096x2305.jpg?auto=format',
    objectPosition: '50% 50%',
  },
  {
    title: 'phone ( 4a )',
    headline: 'Get live delivery updates with the new Glyph Bar',
    subline: '',
    href: '/products/phone-4a',
    image: productImageUrls.phone4a,
    background: 'https://cdn.sanity.io/images/gtd4w1cq/production/d2a928661850d77fa8db5489eb53af14990639e8-4096x2305.jpg?auto=format',
    objectPosition: '50% 50%',
  },
  {
    title: 'phone ( 3 )',
    headline: 'Take your best photos with four 50 MP cameras',
    subline: '',
    href: '/products/phone-3',
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
    'Nothing Official Store Pakistan accessories',
    'Nothing Official Store Pakistan chargers',
    'Nothing Official Store Pakistan phones',
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
        href="/collections/audio"
        image={productImageUrls.headphoneA}
      />
    </section>
  )
}

function CampaignStorySection() {
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#0d0d0d] px-5 py-24 text-center text-white">
      <div className="relative z-10 mx-auto max-w-[700px]">
        <h1 className="dot-heading text-[0.82rem] leading-none tracking-[0.14em] text-white/84">
          Nothing (Charli xcx)
        </h1>
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

export default async function Home() {
  const homeStructuredData: Record<string, unknown>[] = [buildOrganizationStructuredData(), buildWebsiteStructuredData()]

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
      </main>

      <NothingFooter />
    </div>
  )
}
