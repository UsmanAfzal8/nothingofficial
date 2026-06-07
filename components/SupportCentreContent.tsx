'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { supportFaqs, supportHero, supportQuickLinks } from '@/lib/data/support-centre'
import { siteContactWhatsappUrl } from '@/lib/data/site-content'

type SupportCentreContentProps = {
  heroImageUrl: string | null
  heroImageAlt: string
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10.3333 10.3333L15 15" stroke="currentColor" strokeMiterlimit="10" />
      <path
        d="M11.889 6.44514C11.889 3.43821 9.45143 1.00062 6.44451 1.00062C3.43759 1.00062 1 3.43822 1 6.44514C1 9.45206 3.43759 11.8896 6.44451 11.8896C9.45143 11.8896 11.889 9.45206 11.889 6.44514Z"
        stroke="currentColor"
        strokeMiterlimit="10"
      />
    </svg>
  )
}

export function SupportCentreContent({ heroImageUrl, heroImageAlt }: SupportCentreContentProps) {
  const [search, setSearch] = useState('')
  const normalizedSearch = search.trim().toLowerCase()

  const filteredFaqs = useMemo(() => {
    if (!normalizedSearch) return supportFaqs

    return supportFaqs.filter((item) => {
      return item.question.toLowerCase().includes(normalizedSearch) || item.answer.toLowerCase().includes(normalizedSearch)
    })
  }, [normalizedSearch])

  return (
    <div className="support-centre-official">
      <main>
        <section className="support-hero">
          {heroImageUrl ? (
            <Image
              src={heroImageUrl}
              alt={heroImageAlt}
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="support-hero-image"
            />
          ) : null}
          <div className="support-hero-copy">
            <h1>{supportHero.title}</h1>
            <p>{supportHero.description}</p>
            <form onSubmit={(event) => event.preventDefault()} role="search" className="support-search">
              <button type="submit" aria-label="Search support">
                <SearchIcon />
              </button>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                type="search"
                placeholder="Search"
                aria-label="Search Nothing Pakistan support"
              />
            </form>
          </div>
        </section>

        <div className="support-content">
          <section className="support-help-section" aria-labelledby="support-help-title">
            <h2 id="support-help-title">How Can We Help You?</h2>
            <div className="support-quick-links">
              {supportQuickLinks.map((item) =>
                item.external ? (
                  <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
                    {item.label}
                  </a>
                ) : (
                  <Link key={item.label} href={item.href}>
                    {item.label}
                  </Link>
                ),
              )}
            </div>
          </section>

          <section className="support-faq-section" id="popular-questions" aria-labelledby="support-faq-title">
            <h2 id="support-faq-title">Popular Questions</h2>
            <div className="support-faq-list">
              {filteredFaqs.map((item) => (
                <details key={item.id} className="support-faq-item">
                  <summary>
                    <span>{item.question}</span>
                    <span className="support-read-more">( Read More )</span>
                    <span className="support-read-less">( Read Less )</span>
                  </summary>
                  <div className="support-faq-answer">{item.answer}</div>
                </details>
              ))}
              {filteredFaqs.length === 0 ? <p className="support-empty">No support result found for &quot;{search}&quot;.</p> : null}
            </div>
          </section>

          <section className="support-contact-section" id="contact-us" aria-labelledby="support-contact-title">
            <h2 id="support-contact-title">Contact Us</h2>
            <div className="support-contact-row">
              <p>Feel free to send us a message for further support. Our Nothing Pakistan team is on-hand to help.</p>
              <a href={siteContactWhatsappUrl} target="_blank" rel="noopener noreferrer">
                Send Us A Message
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
