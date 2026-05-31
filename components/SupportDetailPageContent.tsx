'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useMemo, useState } from 'react'
import type { SupportPageData, SupportRow } from '@/lib/data/support-pages'
import { siteContactWhatsappUrl } from '@/lib/data/site-content'

type SupportDetailPageContentProps = {
  page: SupportPageData
}

function buildWhatsappUrl(message: string) {
  return `${siteContactWhatsappUrl}?text=${encodeURIComponent(message)}`
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href)
}

function SupportAction({ row }: { row: SupportRow }) {
  const label = row.actionLabel ?? (row.href ? 'Read More' : null)
  if (!label) return null

  if (row.whatsappMessage) {
    return (
      <a className="support-detail-action" href={buildWhatsappUrl(row.whatsappMessage)} target="_blank" rel="noopener noreferrer">
        ( {label} )
      </a>
    )
  }

  if (!row.href) return null

  if (isExternalHref(row.href)) {
    return (
      <a className="support-detail-action" href={row.href} target="_blank" rel="noopener noreferrer">
        ( {label} )
      </a>
    )
  }

  return (
    <Link className="support-detail-action" href={row.href}>
      ( {label} )
    </Link>
  )
}

function ProductStatusForm() {
  const [value, setValue] = useState('')
  const trimmedValue = value.trim()
  const whatsappUrl = useMemo(() => {
    const baseMessage = trimmedValue
      ? `Hi Nothing Pakistan, please check product status for this IMEI/SN: ${trimmedValue}`
      : 'Hi Nothing Pakistan, I want to check my Nothing product status.'
    return buildWhatsappUrl(baseMessage)
  }, [trimmedValue])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <form className="support-status-form" onSubmit={handleSubmit}>
      <label htmlFor="support-imei-sn">Input your IMEI/SN number</label>
      <div className="support-status-input-row">
        <input
          id="support-imei-sn"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="IMEI/SN number"
          autoComplete="off"
        />
        <button type="submit">Submit</button>
      </div>
      <a href="#find-imei-sn">How to find your IMEI/SN Number?</a>
    </form>
  )
}

export function SupportDetailPageContent({ page }: SupportDetailPageContentProps) {
  return (
    <main className="support-detail-page">
      <section className="support-detail-title-section">
        <div className="support-detail-container">
          <p>{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <span>{page.description}</span>
        </div>
      </section>

      <div className="support-detail-container support-detail-body">
        {page.kind === 'cards'
          ? page.sections?.map((section) => (
              <section key={section.title} className="support-detail-section">
                <div className="support-detail-section-heading">
                  <h2>{section.title}</h2>
                  {section.description ? <p>{section.description}</p> : null}
                </div>
                <div className="support-guide-grid">
                  {section.cards?.map((card) => (
                    <Link key={card.title} href={card.href} className="support-guide-card">
                      <div className="support-guide-card-media">
                        {card.imageUrl ? (
                          <Image
                            src={card.imageUrl}
                            alt={card.imageAlt ?? card.title}
                            width={420}
                            height={300}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 300px"
                          />
                        ) : (
                          <span>{card.category}</span>
                        )}
                      </div>
                      <div className="support-guide-card-copy">
                        <p>{card.category}</p>
                        <h3>{card.title}</h3>
                        <span>{card.description}</span>
                        <strong>( Read More )</strong>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))
          : null}

        {page.kind === 'rows'
          ? page.sections?.map((section) => (
              <section key={section.title} className="support-detail-section">
                <div className="support-detail-section-heading">
                  <h2>{section.title}</h2>
                  {section.description ? <p>{section.description}</p> : null}
                </div>
                <div className="support-detail-row-list">
                  {section.rows?.map((row) => (
                    <article key={row.title} className="support-detail-row">
                      <div>
                        <h3>{row.title}</h3>
                        <p>{row.description}</p>
                      </div>
                      <SupportAction row={row} />
                    </article>
                  ))}
                </div>
              </section>
            ))
          : null}

        {page.kind === 'faqs' ? (
          <section className="support-detail-section">
            <div className="support-detail-row-list support-detail-faq-list">
              {page.faqs?.map((faq) => (
                <details key={faq.question} className="support-detail-faq">
                  <summary>
                    <span>{faq.question}</span>
                    <span className="support-detail-action support-read-more">( Read More )</span>
                    <span className="support-detail-action support-read-less">( Read Less )</span>
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {page.kind === 'downloads'
          ? page.downloads?.map((download) => (
              <section key={download.title} className="support-detail-section support-download-section">
                <div>
                  <h2>{download.title}</h2>
                  <p>{download.description}</p>
                </div>
                <div className="support-download-buttons">
                  {download.buttons.map((button) => (
                    <a key={button.href} href={button.href} target="_blank" rel="noopener noreferrer">
                      {button.label}
                    </a>
                  ))}
                </div>
              </section>
            ))
          : null}

        {page.kind === 'status' ? (
          <section className="support-detail-section">
            <ProductStatusForm />
          </section>
        ) : null}

        {page.kind === 'downloads' || page.kind === 'status'
          ? page.sections?.map((section) => (
              <section key={section.title} id={page.kind === 'status' ? 'find-imei-sn' : undefined} className="support-detail-section">
                <div className="support-detail-section-heading">
                  <h2>{section.title}</h2>
                  {section.description ? <p>{section.description}</p> : null}
                </div>
                <div className="support-detail-row-list">
                  {section.rows?.map((row) => (
                    <article key={row.title} className="support-detail-row">
                      <div>
                        <h3>{row.title}</h3>
                        <p>{row.description}</p>
                      </div>
                      <SupportAction row={row} />
                    </article>
                  ))}
                </div>
              </section>
            ))
          : null}

        <section className="support-detail-section support-detail-contact">
          <h2>Contact Us</h2>
          <div className="support-contact-row">
            <p>Need more help? Message Nothing Pakistan on WhatsApp and our team will guide you with the next step.</p>
            <a href={buildWhatsappUrl(`Hi Nothing Pakistan, I need help with ${page.title}.`)} target="_blank" rel="noopener noreferrer">
              Send Us A Message
            </a>
          </div>
        </section>
      </div>
    </main>
  )
}
