import type { Metadata } from 'next'
import Link from 'next/link'
import { InterTypographyScope } from '@/components/InterTypographyScope'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import {
  buildContactPageStructuredData,
  siteContactAddress,
  siteContactDisplayPhone,
  socialLinks,
  siteBrandName,
  siteKeywords,
} from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildSeoKeywords } from '@/lib/utils/seo'

const lahoreStoreName = 'Nothing Pakistan'
const lahoreStoreMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteContactAddress)}`
const lahoreStoreEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(siteContactAddress)}&z=16&output=embed`

export const metadata: Metadata = {
  title: {
    absolute: `Contact ${siteBrandName} | Support, Orders and Policy Help`,
  },
  description:
    'Find the main support, order, and policy routes for Nothing Pakistan so customers and search engines can clearly discover help and business information.',
  keywords: buildSeoKeywords(siteKeywords, ['Contact Nothing Pakistan', 'Nothing Pakistan support', 'Nothing Pakistan order help']),
  alternates: {
    canonical: buildAbsoluteUrl('/pages/contact-us'),
  },
  openGraph: {
    title: `Contact ${siteBrandName} | Support, Orders and Policy Help`,
    description:
      'Find the main support, order, and policy routes for Nothing Pakistan so customers and search engines can clearly discover help and business information.',
    url: buildAbsoluteUrl('/pages/contact-us'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: `Contact ${siteBrandName} | Support, Orders and Policy Help`,
    description:
      'Find the main support, order, and policy routes for Nothing Pakistan so customers and search engines can clearly discover help and business information.',
  },
}

const contactOptions = [
  {
    title: 'Product and support help',
    description: 'Use the support centre for help articles, troubleshooting, FAQs, and general after-sales guidance.',
    href: '/pages/support-centre',
    label: 'Open Support Centre',
  },
  {
    title: 'Order and delivery questions',
    description: 'Use the order flow to submit your details so our team can confirm stock, address, and delivery information.',
    href: '/order',
    label: 'Open Order Page',
  },
  {
    title: 'Policy and store information',
    description: 'Use the policy pages for privacy, shipping, returns, and sale terms when you need store-level rules and expectations.',
    href: '/pages/policies/privacy-policy',
    label: 'Open Policy Pages',
  },
]

export default function ContactUsPage() {
  const contactStructuredData = [
    buildContactPageStructuredData(),
    buildBreadcrumbStructuredData([
      { label: 'Home', href: '/' },
      { label: 'Contact Us', href: '/pages/contact-us' },
    ]),
  ]

  return (
    <InterTypographyScope>
      <div className="min-h-screen overflow-x-hidden bg-[#f4f4f0] text-[#111]">
        <SeoStructuredData data={contactStructuredData} />
        <NothingHeader />

        <main className="pt-20">
          <section className="relative overflow-hidden border-b border-black/5 px-4 pb-10 pt-6 md:px-8 md:pb-14 md:pt-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(225,226,222,0.82)_45%,rgba(208,210,204,0.78))]" />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.2),transparent_30%,rgba(17,17,17,0.08)_120%)]" />

            <div className="relative mx-auto grid max-w-screen-2xl gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
              <div className="max-w-3xl pt-6">
                <p className="text-[11px] uppercase tracking-[0.34em] text-black/45">Contact {siteBrandName}</p>
                <h1 className="collection-product-name mt-5 text-5xl leading-[0.92] sm:text-6xl lg:text-7xl">Clear routes for support and store trust</h1>
                <p className="mt-5 max-w-2xl text-sm leading-6 text-black/65 sm:text-base">
                  This page brings together the main ways to reach store information. It makes support, ordering, and policy information easy for customers and search systems to find from one clear entry point.
                </p>
              </div>

              <div className="rounded-[36px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(236,237,233,0.92))] p-6 shadow-[0_30px_90px_rgba(17,17,17,0.08)]">
                <div className="dot-mesh-background rounded-[28px] border border-black/6 bg-[#f7f7f4] p-5">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">Support routes</p>
                  <div className="mt-5 grid gap-3">
                    {contactOptions.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="rounded-[20px] border border-black/8 bg-white/80 px-4 py-4 transition-colors hover:bg-black hover:text-white"
                      >
                        <p className="text-[10px] uppercase tracking-[0.2em] text-black/46 transition-colors hover:text-white">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-black/68 transition-colors hover:text-white">{item.label}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 py-12 md:px-8 md:py-16">
            <div className="mx-auto grid max-w-screen-2xl gap-4 lg:grid-cols-3">
              {contactOptions.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[30px] border border-black/10 bg-white/78 p-6 shadow-[0_18px_50px_rgba(17,17,17,0.05)] backdrop-blur-xl"
                >
                  <p className="text-[10px] uppercase tracking-[0.22em] text-black/42">{item.title}</p>
                  <p className="mt-4 text-sm leading-7 text-black/68">{item.description}</p>
                  <Link
                    href={item.href}
                    className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-[10px] uppercase tracking-[0.24em] text-white transition-opacity hover:opacity-85"
                  >
                    {item.label}
                  </Link>
                </article>
              ))}
            </div>

            <div className="mx-auto mt-10 grid max-w-screen-2xl gap-4 lg:grid-cols-2">
              <article id="lahore-store" className="rounded-[30px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(17,17,17,0.04)]">
                <p className="dot-heading text-[10px] tracking-[0.24em] text-black/42">Store</p>
                <h2 className="mt-4 text-[2rem] leading-[0.94] tracking-[-0.05em] text-black md:text-[2.5rem]">{lahoreStoreName}</h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-black/64">
                  Lahore store location for contact, ordering, and support guidance.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="rounded-[22px] border border-black/10 bg-[#f7f7f3] p-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">Address</p>
                    <p className="mt-2 text-sm leading-7 text-black/74">{siteContactAddress}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[22px] border border-black/10 bg-[#f7f7f3] p-4">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">Phone</p>
                      <a href={`tel:${siteContactDisplayPhone}`} className="mt-2 block text-sm leading-7 text-black/74 transition-opacity hover:opacity-70">
                        {siteContactDisplayPhone}
                      </a>
                    </div>
                    <div className="overflow-hidden rounded-[22px] border border-black/10 bg-[#f7f7f3]">
                      <div className="border-b border-black/8 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">Location on map</p>
                      </div>
                      <iframe
                        title="Nothing Pakistan Lahore store map"
                        src={lahoreStoreEmbedUrl}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="h-[260px] w-full"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={lahoreStoreMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-[10px] uppercase tracking-[0.24em] text-white transition-opacity hover:opacity-85"
                    >
                      Open Map
                    </Link>
                    <Link
                      href="/pages/support-centre"
                      className="inline-flex h-11 items-center justify-center rounded-full border border-black/12 px-5 text-[10px] uppercase tracking-[0.24em] text-black transition-colors hover:bg-black hover:text-white"
                    >
                      Open Support
                    </Link>
                    <Link
                      href="/order"
                      className="inline-flex h-11 items-center justify-center rounded-full border border-black/12 px-5 text-[10px] uppercase tracking-[0.24em] text-black transition-colors hover:bg-black hover:text-white"
                    >
                      Start Order
                    </Link>
                  </div>
                </div>
              </article>

              <article className="rounded-[30px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(17,17,17,0.04)]">
                <p className="dot-heading text-[10px] tracking-[0.24em] text-black/42">Newsletter</p>
                <h2 className="mt-4 text-[2rem] leading-[0.94] tracking-[-0.05em] text-black md:text-[2.5rem]">Join product updates</h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-black/64">
                  Use the newsletter screen for launches, restocks, CMF releases, and support updates from the same visual system.
                </p>
                <Link
                  href="/pages/newsletter"
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-black/12 px-5 text-[10px] uppercase tracking-[0.24em] text-black transition-colors hover:bg-black hover:text-white"
                >
                  Open Newsletter
                </Link>
              </article>
            </div>

            <div className="mx-auto mt-10 max-w-screen-2xl rounded-[34px] border border-black/10 bg-white/72 p-6 shadow-[0_24px_60px_rgba(17,17,17,0.06)] backdrop-blur-xl md:p-8">
              <p className="text-[10px] uppercase tracking-[0.28em] text-black/42">Brand Social Channels</p>
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
          </section>
        </main>

        <NothingFooter />
      </div>
    </InterTypographyScope>
  )
}
