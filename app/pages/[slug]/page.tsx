import type { Metadata } from 'next'
import localFont from 'next/font/local'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { allPolicies, getPolicyBySlug, getPolicyCanonical, policySlugs } from '@/lib/data/policies'
import { companyIdentifier, companyLegalName, companySupportEmail } from '@/lib/data/company'
import { siteBrandName, siteContactDisplayPhone, siteKeywords } from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildRobotsMetadata, buildSeoKeywords } from '@/lib/utils/seo'

const ntype82Regular = localFont({
  src: '../../../fonts/NType82-Regular.otf',
  display: 'swap',
})

const ntype82Headline = localFont({
  src: '../../../fonts/NType82-Headline.otf',
  display: 'swap',
})

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
      images: [buildAbsoluteUrl('/social/nothing-pakistan-og.jpg')],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [buildAbsoluteUrl('/social/nothing-pakistan-og.jpg')],
    },
    robots: buildRobotsMetadata(),
  }
}

export default function PolicyPage({ params }: PolicyPageProps) {
  const policy = getPolicyBySlug(params.slug)

  if (!policy) {
    notFound()
  }

  return (
    <div className={`${ntype82Regular.className} min-h-screen overflow-x-hidden bg-[#f4f5f8] text-[#111]`}>
      <NothingHeader />

      <main className="px-4 pb-16 pt-24 md:pb-24">
        <section className="mx-auto grid w-full max-w-screen-2xl gap-6 lg:grid-cols-[300px,1fr]">
          <aside className="h-fit rounded-2xl border border-black/10 bg-transparent p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-black/55">{siteBrandName}</p>
            <h1 className={`${ntype82Headline.className} mt-3 text-3xl leading-tight`}>{policy.title}</h1>
            <p className="mt-4 text-sm leading-7 text-black/70">{policy.summary}</p>

            <div className="mt-5 grid gap-2 text-xs leading-6 text-black/65">
              <p>
                <span className="text-black/80">Legal:</span> {companyLegalName}
              </p>
              <p>
                <span className="text-black/80">SECP:</span> {companyIdentifier}
              </p>
              <p>
                <span className="text-black/80">Effective:</span> {policy.effectiveDate}
              </p>
              <p>
                <span className="text-black/80">Updated:</span> {policy.lastUpdated}
              </p>
            </div>

            <nav className="mt-6 border-t border-black/15 pt-4">
              <p className="text-[11px] uppercase tracking-[0.25em] text-black/55">All Policies</p>
              <ul className="mt-3 space-y-2 text-sm">
                {allPolicies.map((item) => {
                  const isActive = item.slug === policy.slug

                  return (
                    <li key={item.slug}>
                      <Link
                        href={`/pages/${item.slug}`}
                        className={`block rounded-lg border px-3 py-2 transition ${
                          isActive ? 'border-black bg-black text-white' : 'border-black/10 bg-transparent hover:border-black/25'
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

          <article className="rounded-2xl border border-black/10 bg-transparent p-5 md:p-8">
            <div className="mb-7 border-b border-black/15 pb-5">
              <p className="text-xs uppercase tracking-[0.28em] text-black/55">{siteBrandName}</p>
              <h2 className={`${ntype82Headline.className} mt-3 text-3xl md:text-4xl`}>
                {policy.title} - NOTHING TECHNOLOGY
              </h2>
            </div>

            <div className="space-y-7">
              {policy.sections.map((section) => (
                <section key={section.title} className="space-y-3">
                  <h3 className={`${ntype82Headline.className} text-xl leading-tight text-black`}>{section.title}</h3>
                  <div className="space-y-3 text-sm leading-7 text-black/80 md:text-[15px]">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-10 rounded-xl border border-black/15 bg-transparent p-4 text-sm leading-7 text-black/75">
              This policy is published by {siteBrandName}, operated by {companyLegalName} ({companyIdentifier}). For legal,
              order, return, warranty, or account-specific help, contact {companySupportEmail}, call {siteContactDisplayPhone},
              or open the support centre.
            </div>
          </article>
        </section>
      </main>

      <NothingFooter />
    </div>
  )
}
