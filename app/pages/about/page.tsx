import type { Metadata } from 'next'
import Link from 'next/link'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import { buildOrganizationStructuredData, siteBrandName, siteDescription, siteKeywords, socialLinks, siteTagline } from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildSeoKeywords } from '@/lib/utils/seo'

export const metadata: Metadata = {
  title: {
    absolute: `About ${siteBrandName} | Store, Support and Policy Information`,
  },
  description:
    'Learn what Nothing Pakistan is, how the storefront is organized, and where to find policy, support, delivery, and return information.',
  keywords: buildSeoKeywords(siteKeywords, ['About Nothing Pakistan', 'Nothing Pakistan support', 'Nothing Pakistan policies']),
  alternates: {
    canonical: buildAbsoluteUrl('/pages/about'),
  },
  openGraph: {
    title: `About ${siteBrandName} | Store, Support and Policy Information`,
    description:
      'Learn what Nothing Pakistan is, how the storefront is organized, and where to find policy, support, delivery, and return information.',
    url: buildAbsoluteUrl('/pages/about'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: `About ${siteBrandName} | Store, Support and Policy Information`,
    description:
      'Learn what Nothing Pakistan is, how the storefront is organized, and where to find policy, support, delivery, and return information.',
  },
}

const aboutHighlights = [
  'Live product, mobile, category, image, FAQ, and review content is loaded from Supabase.',
  'The storefront is structured around categories so users can discover phones, audio, accessories, and brand collections clearly.',
  'Support, legal, shipping, and return information is published as dedicated pages for user trust and search clarity.',
]

const aboutSections = [
  {
    title: 'What this store is',
    body:
      'Nothing Pakistan is a catalog-led storefront for original Nothing and CMF devices in Pakistan. The site is designed so users can move from discovery to detail, support, and ordering while staying inside one consistent visual system.',
  },
  {
    title: 'How the site is organized',
    body:
      'Products are grouped into live categories and subcategories, with product images, policy pages, support information, and checkout flows connected to the same storefront structure. This makes the site easier to crawl, understand, and navigate for both customers and search engines.',
  },
  {
    title: 'How to reach the right information',
    body:
      'If you need support, visit the Support Centre. If you need business context, use this page. If you need legal or shopping information, use the Privacy, Terms of Sale, Shipping, and Return pages linked in the footer.',
  },
]

export default function AboutPage() {
  const hasSocialLinks = socialLinks.length > 0

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#ececea] text-[#111]">
      <SeoStructuredData data={buildOrganizationStructuredData()} />
      <NothingHeader />

      <main className="pt-20">
        <section className="relative overflow-hidden border-b border-black/5 px-4 pb-10 pt-6 md:px-8 md:pb-14 md:pt-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(225,226,222,0.82)_45%,rgba(208,210,204,0.78))]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.2),transparent_30%,rgba(17,17,17,0.08)_120%)]" />

          <div className="relative mx-auto grid max-w-screen-2xl gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
            <div className="max-w-3xl pt-6">
              <p className="text-[11px] uppercase tracking-[0.34em] text-black/45">About {siteBrandName}</p>
              <h1 className="collection-product-name mt-5 text-5xl leading-[0.92] sm:text-6xl lg:text-7xl">{siteTagline}</h1>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-black/65 sm:text-base">{siteDescription}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/collections/shop-all"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-[11px] uppercase tracking-[0.24em] text-white transition-opacity hover:opacity-85"
                >
                  Browse Catalog
                </Link>
                <Link
                  href="/pages/contact-us"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-black/15 px-5 text-[11px] uppercase tracking-[0.24em] text-black transition-colors hover:bg-black hover:text-white"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            <div className="rounded-[36px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(236,237,233,0.92))] p-6 shadow-[0_30px_90px_rgba(17,17,17,0.08)]">
              <div className="dot-mesh-background rounded-[28px] border border-black/6 bg-[#f7f7f4] p-5">
                <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">Why this page matters</p>
                <div className="mt-5 grid gap-3">
                  {aboutHighlights.map((item) => (
                    <div key={item} className="rounded-[20px] border border-black/8 bg-white/78 px-4 py-4 text-sm leading-6 text-black/68">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 md:px-8 md:py-16">
          <div className="mx-auto grid max-w-screen-2xl gap-4 lg:grid-cols-3">
            {aboutSections.map((section) => (
              <article
                key={section.title}
                className="rounded-[30px] border border-black/10 bg-white/78 p-6 shadow-[0_18px_50px_rgba(17,17,17,0.05)] backdrop-blur-xl"
              >
                <p className="text-[10px] uppercase tracking-[0.22em] text-black/42">{section.title}</p>
                <p className="mt-4 text-sm leading-7 text-black/68">{section.body}</p>
              </article>
            ))}
          </div>

          {hasSocialLinks ? (
            <div className="mx-auto mt-10 max-w-screen-2xl rounded-[34px] border border-black/10 bg-white/72 p-6 shadow-[0_24px_60px_rgba(17,17,17,0.06)] backdrop-blur-xl md:p-8">
              <p className="text-[10px] uppercase tracking-[0.28em] text-black/42">Brand Channels</p>
              <p className="mt-4 max-w-4xl text-sm leading-7 text-black/68">
                This page helps search engines and customers understand that Nothing Pakistan is more than a single product landing page. It connects the storefront message with support routes, legal pages, and the broader catalog so branded searches can land on a stronger trust page when needed.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-black/58 transition-colors hover:bg-black hover:text-white"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </main>

      <NothingFooter />
    </div>
  )
}
