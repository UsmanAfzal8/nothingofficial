'use client'

import { useState } from 'react'
import type { ProductDetailFaq } from '@/lib/models/product-detail'

type ProductFaqAccordionSectionProps = {
  faqs: ProductDetailFaq[]
}

const dottedLineStyle = {
  backgroundImage: 'radial-gradient(circle, rgba(17,17,17,0.9) 1.15px, transparent 1.35px)',
  backgroundPosition: 'left center',
  backgroundRepeat: 'repeat-x',
  backgroundSize: '7px 4px',
}

export function ProductFaqAccordionSection({ faqs }: ProductFaqAccordionSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (faqs.length === 0) {
    return null
  }

  return (
    <section className="mx-auto w-full max-w-[1180px]">
      <h2 className="text-[clamp(1.35rem,2vw,1.85rem)] font-medium leading-none tracking-normal text-black">
        Popular Questions
      </h2>

      <div className="mt-6">
        <div className="h-3 w-full" style={dottedLineStyle} />
        {faqs.map((faq) => {
          const isExpanded = expandedId === faq.id

          return (
            <article key={faq.id} className="py-4 md:py-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-6">
                <h3 className="max-w-[900px] text-[clamp(0.82rem,1.05vw,1rem)] font-normal leading-[1.35] text-black">
                  {faq.question}
                </h3>

                <button
                  type="button"
                  className="shrink-0 text-left text-[clamp(0.78rem,1vw,0.95rem)] font-normal leading-none text-[#35548b] transition-opacity hover:opacity-70"
                  onClick={() => setExpandedId((currentId) => (currentId === faq.id ? null : faq.id))}
                >
                  ({isExpanded ? ' Read Less ' : ' Read More '})
                </button>
              </div>

              {isExpanded ? (
                <div className="max-w-[900px] pt-3 md:pt-4">
                  <p className="whitespace-pre-line text-[clamp(0.78rem,0.95vw,0.92rem)] leading-[1.75] text-black/72">
                    {faq.answer}
                  </p>
                </div>
              ) : null}

              <div className="mt-4 h-3 w-full md:mt-5" style={dottedLineStyle} />
            </article>
          )
        })}
      </div>
    </section>
  )
}
