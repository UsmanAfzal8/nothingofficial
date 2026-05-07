'use client'

import { startTransition, useState } from 'react'
import { CatalogProductTile } from '@/components/CatalogProductTile'
import type { Product } from '@/lib/models/catalog'

type TrendingPicksSectionProps = {
  products: Product[]
}

function ArrowButton({
  direction,
  onClick,
  disabled,
}: {
  direction: 'previous' | 'next'
  onClick: () => void
  disabled: boolean
}) {
  return (
    <button
      type="button"
      aria-label={direction === 'previous' ? 'Show previous selected gems' : 'Show next selected gems'}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-11 w-11 items-center justify-center border border-black/10 bg-white text-black shadow-[0_14px_30px_rgba(17,17,17,0.08)] transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
    >
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {direction === 'previous' ? (
          <path d="m14 6-6 6 6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="m10 6 6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  )
}

export function TrendingPicksSection({ products }: TrendingPicksSectionProps) {
  const [startIndex, setStartIndex] = useState(0)
  const visibleDesktopProducts = products.slice(startIndex, startIndex + 5)
  const maxStartIndex = Math.max(0, products.length - 5)

  if (products.length === 0) {
    return null
  }

  return (
    <section className="border-b border-black/10 px-4 py-12 md:px-8 md:py-16">
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-black/42">Best Product Sale</p>
            <h2 className="collection-product-name mt-3 text-4xl leading-none text-black sm:text-5xl">Selected Gems</h2>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <ArrowButton
              direction="previous"
              disabled={startIndex === 0}
              onClick={() =>
                startTransition(() => {
                  setStartIndex((currentIndex) => Math.max(0, currentIndex - 1))
                })
              }
            />
            <ArrowButton
              direction="next"
              disabled={startIndex >= maxStartIndex}
              onClick={() =>
                startTransition(() => {
                  setStartIndex((currentIndex) => Math.min(maxStartIndex, currentIndex + 1))
                })
              }
            />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 lg:hidden">
          {products.map((product) => (
            <CatalogProductTile key={product.id} product={product} tone="shop-all" />
          ))}
        </div>

        <div className="mt-8 hidden grid-cols-5 gap-x-7 gap-y-14 lg:grid">
          {visibleDesktopProducts.map((product) => (
            <CatalogProductTile key={product.id} product={product} tone="shop-all" />
          ))}
        </div>
      </div>
    </section>
  )
}
