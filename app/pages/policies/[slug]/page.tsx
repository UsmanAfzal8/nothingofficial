import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { allPolicies, getPolicyBySlug, getPolicyCanonical, policySlugs } from '@/lib/data/policies'
import { siteBrandName, siteKeywords } from '@/lib/data/site-content'
import { buildSeoKeywords } from '@/lib/utils/seo'

type PolicyPageProps = {
  params: {
    slug: string
  }
}

export function generateStaticParams() {
  return policySlugs.map((slug) => ({ slug }))
}

export function generateMetadata({ params }: PolicyPageProps): Metadata {
  const policy = getPolicyBySlug(params.slug)

  if (!policy) {
    return {
      title: `Policy Not Found | ${siteBrandName}`,
      description: `The requested policy is not available on ${siteBrandName}.`,
    }
  }

  const title = `${policy.title} | ${siteBrandName}`
  const description = policy.summary
  const canonical = getPolicyCanonical(policy.slug)

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: buildSeoKeywords(siteKeywords, [policy.title, `${policy.title} ${siteBrandName}`]),
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default function PolicyPage({ params }: PolicyPageProps) {
  const policy = getPolicyBySlug(params.slug)

  if (!policy) {
    notFound()
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#ececea] text-[#111]">
      <NothingHeader />

      <main className="px-4 pb-16 pt-24 md:pb-24">
        <section className="mx-auto grid w-full max-w-screen-2xl gap-6 lg:grid-cols-[300px,1fr]">
          <aside className="frost-panel h-fit rounded-2xl p-5">
            <p className="dot-heading text-xs tracking-[0.28em] text-black/55">{siteBrandName}</p>
            <h1 className="collection-product-name mt-3 text-3xl leading-tight">{policy.title}</h1>
            <p className="mt-4 text-sm text-black/70">{policy.summary}</p>

            <div className="mt-5 grid gap-2 text-xs text-black/65">
              <p>
                <span className="font-medium text-black/80">Effective:</span> {policy.effectiveDate}
              </p>
              <p>
                <span className="font-medium text-black/80">Updated:</span> {policy.lastUpdated}
              </p>
            </div>

            <nav className="mt-6 border-t border-black/15 pt-4">
              <p className="dot-heading text-[11px] tracking-[0.25em] text-black/55">All Policies</p>
              <ul className="mt-3 space-y-2 text-sm">
                {allPolicies.map((item) => {
                  const isActive = item.slug === policy.slug

                  return (
                    <li key={item.slug}>
                      <Link
                        href={`/pages/policies/${item.slug}`}
                        className={`block rounded-lg px-3 py-2 transition ${
                          isActive ? 'bg-black text-white' : 'bg-white/70 hover:bg-white'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {item.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </aside>

          <article className="frost-panel rounded-2xl p-5 md:p-8">
            <div className="mb-7 border-b border-black/15 pb-5">
              <p className="dot-heading text-xs tracking-[0.28em] text-black/55">{siteBrandName}</p>
              <h2 className="collection-product-name mt-3 text-3xl md:text-4xl">{policy.title}</h2>
            </div>

            <div className="space-y-7">
              {policy.sections.map((section) => (
                <section key={section.title} className="space-y-3">
                  <h3 className="dot-heading text-sm tracking-[0.16em]">{section.title}</h3>
                  <div className="space-y-3 text-sm leading-relaxed text-black/80 md:text-[15px]">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-10 rounded-xl border border-black/15 bg-white/80 p-4 text-sm text-black/75">
              This policy is published by {siteBrandName}. For legal or account-specific help, please contact our support
              centre.
            </div>
          </article>
        </section>
      </main>

      <NothingFooter />
    </div>
  )
}
