import Link from 'next/link'
import { CompanyTrustBadge } from '@/components/CompanyTrustBadge'
import { InterTypographyScope } from '@/components/InterTypographyScope'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import {
  type PillarPageConfig,
  buildPillarPageStructuredData,
  pillarSupportCta,
} from '@/lib/data/pillar-pages'

type PillarPageLayoutProps = {
  config: PillarPageConfig
}

export async function PillarPageLayout({ config }: PillarPageLayoutProps) {
  const structuredData = buildPillarPageStructuredData(config)

  return (
    <InterTypographyScope>
      <div className="min-h-screen overflow-x-hidden bg-[#f4f4f0] text-[#111]">
        <SeoStructuredData data={structuredData} />
        <NothingHeader />

        <main className="pt-20">
          <section className="border-b border-black/10 px-4 py-12 md:px-8 md:py-16">
            <div className="mx-auto grid max-w-screen-2xl gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end">
              <div className="max-w-4xl">
                <p className="text-[10px] uppercase tracking-[0.34em] text-black/45">{config.eyebrow}</p>
                <h1 className="mt-4 text-5xl font-semibold leading-[0.94] tracking-[-0.04em] text-black sm:text-6xl">
                  {config.heroTitle}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-black/68">{config.heroDescription}</p>
              </div>
              <CompanyTrustBadge />
            </div>
          </section>

          <section className="px-4 py-12 md:px-8 md:py-16">
            <div className="mx-auto grid max-w-screen-2xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <article className="space-y-8">
                <section className="rounded-[8px] border border-black/10 bg-white p-5">
                  <p className="text-[10px] uppercase tracking-[0.26em] text-black/42">Direct Answer</p>
                  <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-black">{config.directAnswer.question}</h2>
                  <p className="mt-3 text-sm leading-7 text-black/68">{config.directAnswer.answer}</p>
                </section>

                <section className="border-t border-black/10 pt-8">
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">What this page helps with</h2>
                  <ul className="mt-6 grid gap-3">
                    {config.introPoints.map((item) => (
                      <li key={item} className="rounded-[8px] border border-black/10 bg-white p-4 text-sm leading-7 text-black/68">
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                {config.sections.map((section) => (
                  <section key={section.title} className="border-t border-black/10 pt-8">
                    <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">{section.title}</h2>
                    <div className="mt-5 space-y-5 text-sm leading-8 text-black/70">
                      {section.body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                ))}

                <section className="border-t border-black/10 pt-8">
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">FAQs</h2>
                  <div className="mt-6 divide-y divide-black/10 rounded-[8px] border border-black/10 bg-white">
                    {config.faqs.map((faq) => (
                      <details key={faq.question} className="px-5 py-5">
                        <summary className="cursor-pointer list-none text-base font-medium text-black">{faq.question}</summary>
                        <p className="mt-3 text-sm leading-7 text-black/68">{faq.answer}</p>
                      </details>
                    ))}
                  </div>
                </section>
              </article>

              <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                <section className="rounded-[8px] border border-black/10 bg-white p-5">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">Browse Next</p>
                  <div className="mt-4 grid gap-2">
                    {config.browseLinks.map((item) => (
                      <Link key={item.href} href={item.href} className="rounded-[8px] border border-black/10 px-4 py-3 transition-colors hover:bg-black hover:text-white">
                        <span className="block text-sm text-black/85 transition-colors hover:text-inherit">{item.label}</span>
                        <span className="mt-1 block text-xs leading-5 text-black/55 transition-colors hover:text-inherit">{item.description}</span>
                      </Link>
                    ))}
                  </div>
                </section>

                <section className="rounded-[8px] border border-black/10 bg-white p-5">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">Trust and Support</p>
                  <div className="mt-4 grid gap-2">
                    {config.relatedLinks.map((item) => (
                      <Link key={item.href} href={item.href} className="rounded-[8px] border border-black/10 px-4 py-3 transition-colors hover:bg-black hover:text-white">
                        <span className="block text-sm text-black/85 transition-colors hover:text-inherit">{item.label}</span>
                        <span className="mt-1 block text-xs leading-5 text-black/55 transition-colors hover:text-inherit">{item.description}</span>
                      </Link>
                    ))}
                  </div>
                </section>

                <section className="rounded-[8px] border border-black/10 bg-black p-5 text-white">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/58">Need help now?</p>
                  <p className="mt-3 text-sm leading-7 text-white/78">
                    Use WhatsApp before ordering if you want help with stock, compatibility, payment, delivery timing, or Lahore pickup.
                  </p>
                  <Link
                    href={pillarSupportCta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex h-11 items-center justify-center rounded-[8px] bg-white px-5 text-[10px] uppercase tracking-[0.2em] text-black transition-opacity hover:opacity-85"
                  >
                    {pillarSupportCta.label}
                  </Link>
                </section>
              </aside>
            </div>
          </section>
        </main>

        <NothingFooter />
      </div>
    </InterTypographyScope>
  )
}
