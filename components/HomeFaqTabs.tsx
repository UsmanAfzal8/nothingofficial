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
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Nothing Official Store Pakistan FAQ categories">
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
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.24em] transition-colors ${
                isActive ? 'bg-black text-white' : 'border border-black/12 bg-white text-black/58 hover:bg-black hover:text-white'
              }`}
            >
              <TabIcon id={category.id} />
              {category.label}
            </button>
          )
        })}
      </div>

      <div className="mt-5 rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_20px_55px_rgba(17,17,17,0.04)] md:p-7">
        <div id={`home-faq-panel-${activeCategory.id}`} role="tabpanel" aria-labelledby={`home-faq-tab-${activeCategory.id}`}>
          <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">{activeCategory.label}</p>
        <p className="mt-3 max-w-3xl font-sans text-sm leading-7 text-black/68">{activeCategory.description}</p>

        <div className="mt-6 border-t border-black/10">
          {activeCategory.items.map((item, index) => (
            <details key={item.question} className="group border-b border-black/10 py-5" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm leading-6 text-black/84 md:text-base">
                <span>{item.question}</span>
                <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center border border-black/14 text-black/50 group-open:hidden">
                  +
                </span>
                <span className="mt-1 hidden h-5 w-5 shrink-0 items-center justify-center border border-black/14 text-black/50 group-open:inline-flex">
                  -
                </span>
              </summary>
              <p className="mt-4 max-w-4xl font-sans text-sm leading-7 text-black/68">{item.answer}</p>
            </details>
          ))}
        </div>
        </div>
      </div>
    </div>
  )
}
