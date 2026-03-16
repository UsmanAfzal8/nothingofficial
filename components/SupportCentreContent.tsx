'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { supportFaqs, supportHero, supportQuickLinks } from '@/lib/data/support-centre'

type SupportCentreContentProps = {
  heroImageUrl: string | null
  heroImageAlt: string
}

export function SupportCentreContent({ heroImageUrl, heroImageAlt }: SupportCentreContentProps) {
  const [search, setSearch] = useState('')

  const normalizedSearch = search.trim().toLowerCase()

  const filteredQuickLinks = useMemo(() => {
    if (!normalizedSearch) {
      return supportQuickLinks
    }

    return supportQuickLinks.filter((item) => item.label.toLowerCase().includes(normalizedSearch))
  }, [normalizedSearch])

  const filteredFaqs = useMemo(() => {
    if (!normalizedSearch) {
      return supportFaqs
    }

    return supportFaqs.filter((item) => {
      return item.question.toLowerCase().includes(normalizedSearch) || item.answer.toLowerCase().includes(normalizedSearch)
    })
  }, [normalizedSearch])

  return (
    <div className="space-y-14">
      <section className="grid gap-10 border-b border-black/8 pb-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-end">
        <div className="max-w-3xl">
          <p className="dot-heading text-[10px] tracking-[0.34em] text-black/42">Support</p>
          <h1 className="mt-4 text-[2.8rem] leading-[0.9] tracking-[-0.06em] text-black sm:text-[4rem] lg:text-[5.1rem]">
            {supportHero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-black/62 md:text-base">{supportHero.description}</p>

          <form className="mt-8 max-w-xl" onSubmit={(event) => event.preventDefault()} role="search">
            <label className="grid gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-black/46">Search support</span>
              <div className="flex h-12 items-center rounded-full border border-black/12 bg-white px-4">
                <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-black/45" aria-hidden="true">
                  <path
                    d="M10.3333 10.3333L15 15M11.889 6.44514C11.889 3.43821 9.45143 1.00062 6.44451 1.00062C3.43759 1.00062 1 3.43822 1 6.44514C1 9.45206 3.43759 11.8896 6.44451 11.8896C9.45143 11.8896 11.889 9.45206 11.889 6.44514Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                </svg>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  type="text"
                  placeholder="Search product help, FAQ, support"
                  className="h-full w-full bg-transparent px-3 text-sm text-black outline-none"
                />
              </div>
            </label>
          </form>
        </div>

        <div className="rounded-[30px] border border-black/10 bg-white p-5 shadow-[0_20px_55px_rgba(17,17,17,0.04)]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-[#f5f5f1]">
            {heroImageUrl ? (
              <Image src={heroImageUrl} alt={heroImageAlt} fill sizes="(max-width: 1024px) 80vw, 28vw" className="object-contain p-8" />
            ) : (
              <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.22em] text-black/28">Support image</div>
            )}
          </div>
          <div className="mt-5 border-t border-black/8 pt-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">Fast routes</p>
            <p className="mt-3 text-sm leading-6 text-black/62">Use support, contact, policy, and newsletter pages from one connected system.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="dot-heading text-[10px] tracking-[0.3em] text-black/42">Support Links</p>
            <h2 className="mt-3 text-[2rem] leading-[0.94] tracking-[-0.05em] text-black md:text-[2.6rem]">Start with the right route.</h2>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {filteredQuickLinks.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[22px] border border-black/10 bg-white px-4 py-5 text-sm text-black/74 transition-colors hover:bg-black hover:text-white"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-[22px] border border-black/10 bg-white px-4 py-5 text-sm text-black/74 transition-colors hover:bg-black hover:text-white"
              >
                {item.label}
              </Link>
            ),
          )}
        </div>
      </section>

      <section>
        <p className="dot-heading text-[10px] tracking-[0.3em] text-black/42">Popular Questions</p>
        <h2 className="mt-3 text-[2rem] leading-[0.94] tracking-[-0.05em] text-black md:text-[2.6rem]">Answers that people look for most.</h2>

        <div className="mt-8 border-t border-black/12">
          {filteredFaqs.map((item) => (
            <details key={item.id} className="group border-b border-black/12 py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-5 text-sm leading-6 text-black/82 md:text-base">
                <span className="max-w-3xl">{item.question}</span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-black/40">Open</span>
              </summary>
              <div className="max-w-3xl pt-4 text-sm leading-7 text-black/62">{item.answer}</div>
            </details>
          ))}

          {filteredFaqs.length === 0 ? (
            <div className="py-8 text-sm leading-6 text-black/58">
              No support result found for &quot;<span className="text-black">{search}</span>&quot;.
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 pb-4 lg:grid-cols-3">
        <div className="rounded-[28px] border border-black/10 bg-white p-6">
          <p className="dot-heading text-[10px] tracking-[0.24em] text-black/42">Support</p>
          <h3 className="mt-4 text-[1.7rem] leading-[0.96] tracking-[-0.04em] text-black">Need direct help?</h3>
          <p className="mt-4 text-sm leading-7 text-black/62">Use the contact page if you need store information, after-sales help, or buying guidance.</p>
          <Link
            href="/pages/contact-us"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-[10px] uppercase tracking-[0.24em] text-white transition-opacity hover:opacity-85"
          >
            Contact Support
          </Link>
        </div>

        <div className="rounded-[28px] border border-black/10 bg-white p-6" id="product-status">
          <p className="dot-heading text-[10px] tracking-[0.24em] text-black/42">Store</p>
          <h3 className="mt-4 text-[1.7rem] leading-[0.96] tracking-[-0.04em] text-black">Lahore store routes.</h3>
          <p className="mt-4 text-sm leading-7 text-black/62">Use the Lahore store entry from the footer to jump into contact and location information.</p>
          <Link
            href="/pages/contact-us#lahore-store"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-black/12 px-5 text-[10px] uppercase tracking-[0.24em] text-black transition-colors hover:bg-black hover:text-white"
          >
            Open Lahore
          </Link>
        </div>

        <div className="rounded-[28px] border border-black/10 bg-white p-6" id="software-download">
          <p className="dot-heading text-[10px] tracking-[0.24em] text-black/42">Newsletter</p>
          <h3 className="mt-4 text-[1.7rem] leading-[0.96] tracking-[-0.04em] text-black">Stay updated with launches.</h3>
          <p className="mt-4 text-sm leading-7 text-black/62">Use the newsletter screen for product launches, restocks, support updates, and CMF releases.</p>
          <Link
            href="/pages/newsletter"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-black/12 px-5 text-[10px] uppercase tracking-[0.24em] text-black transition-colors hover:bg-black hover:text-white"
          >
            Open Newsletter
          </Link>
        </div>
      </section>
    </div>
  )
}
