'use client'

import { useState } from 'react'
import type { HomeFaqCategory } from '@/lib/data/site-content'

type HomeFaqTabsProps = {
  categories: HomeFaqCategory[]
}

function TabIcon({ id }: { id: HomeFaqCategory['id'] }) {
  const commonProps = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  if (id === 'products') {
    return (
      <svg {...commonProps}>
        <path d="M5 7h14l-1 13H6z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
    )
  }

  if (id === 'orders') {
    return (
      <svg {...commonProps}>
        <path d="M7 3h10v18l-2-1-2 1-2-1-2 1-2-1z" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
      </svg>
    )
  }

  if (id === 'support') {
    return (
      <svg {...commonProps}>
        <path d="M4 12a8 8 0 0 1 16 0" />
        <path d="M4 12v4a2 2 0 0 0 2 2h1v-7H6a2 2 0 0 0-2 2Z" />
        <path d="M20 12v4a2 2 0 0 1-2 2h-1v-7h1a2 2 0 0 1 2 2Z" />
      </svg>
    )
  }

  return (
    <svg {...commonProps}>
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      <path d="M12 17v-5" />
      <path d="M12 8h.01" />
    </svg>
  )
}

export function HomeFaqTabs({ categories }: HomeFaqTabsProps) {
  const [activeTab, setActiveTab] = useState<HomeFaqCategory['id']>(categories[0]?.id ?? 'general')
  const activeCategory = categories.find((category) => category.id === activeTab) ?? categories[0] ?? null

  if (!activeCategory) {
    return null
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Nothing Pakistan FAQ categories">
        {categories.map((category) => {
          const isActive = category.id === activeCategory.id

          return (
            <button
              key={category.id}
              id={`home-faq-tab-${category.id}`}
              type="button"
              role="tab"
              onClick={() => setActiveTab(category.id)}
              aria-selected={isActive}
              aria-controls={`home-faq-panel-${category.id}`}
              className={`inline-flex items-center gap-2 rounded-full border border-black px-4 py-2 [font-family:var(--font-lettera-regular)] text-[12px] uppercase tracking-[0.12em] transition-colors ${
                isActive ? 'bg-black text-white' : 'bg-transparent text-black/68 hover:bg-black hover:text-white'
              }`}
            >
              <TabIcon id={category.id} />
              {category.label}
            </button>
          )
        })}
      </div>

      <div className="mt-8 border-y border-dotted border-black/55 py-7 [font-family:var(--font-ntype82)]">
        <div id={`home-faq-panel-${activeCategory.id}`} role="tabpanel" aria-labelledby={`home-faq-tab-${activeCategory.id}`}>
          <p className="[font-family:var(--font-lettera-regular)] text-[12px] uppercase leading-none tracking-[0.18em] text-black/46">{activeCategory.label}</p>
          <p className="mt-5 max-w-3xl text-[15px] leading-[1.55] text-black/70">{activeCategory.description}</p>

          <div className="mt-7 border-t border-dotted border-black/35">
            {activeCategory.items.map((item, index) => (
              <details key={item.question} className="group border-b border-dotted border-black/35 py-5" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[16px] font-normal leading-[1.45] text-black/84">
                  <span>{item.question}</span>
                  <span className="mt-1 [font-family:var(--font-lettera-regular)] text-[13px] text-black/50 group-open:hidden">
                    ( Read More )
                  </span>
                  <span className="mt-1 hidden [font-family:var(--font-lettera-regular)] text-[13px] text-black/50 group-open:inline">
                    ( Read Less )
                  </span>
                </summary>
                <p className="mt-4 max-w-4xl text-[15px] leading-[1.55] text-black/68">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
