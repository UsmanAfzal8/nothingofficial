'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCart } from '@/components/CartProvider'
import type { NavigationItem } from '@/lib/models/catalog'

type NothingHeaderClientProps = {
  menuItems: NavigationItem[]
}

function DotMenuIcon() {
  const xPositions = [3, 5, 7, 9, 11, 13]

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {xPositions.map((x) => (
        <circle key={`top-${x}`} cx={x} cy={3} r={1} fill="currentColor" />
      ))}
      {xPositions.map((x) => (
        <circle key={`bottom-${x}`} cx={x} cy={13} r={1} fill="currentColor" />
      ))}
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M5 5.25H13.1L12.45 12.75H5.55L5 5.25Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6.75 6.25V4.9C6.75 3.66 7.76 2.65 9 2.65C10.24 2.65 11.25 3.66 11.25 4.9V6.25" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

export function NothingHeaderClient({ menuItems }: NothingHeaderClientProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const pathname = usePathname()
  const { itemCount } = useCart()
  const cartCountLabel = itemCount > 9 ? '9+' : String(itemCount)

  useEffect(() => {
    setIsDrawerOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen])

  return (
    <>
      {isDrawerOpen && (
        <button
          type="button"
          aria-label="Close drawer"
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-black/45"
        />
      )}

      <header className="fixed left-1/2 top-0 z-50 w-full max-w-lg -translate-x-1/2 px-4 pt-4">
        <div className="frost-panel overflow-hidden rounded-lg">
          <nav className="grid h-12 grid-cols-[80px,1fr,80px] items-center">
            <button
              type="button"
              onClick={() => setIsDrawerOpen((open) => !open)}
              className="flex h-12 items-center justify-center text-[#111] transition-opacity hover:opacity-70"
              aria-label="Open menu"
            >
              <DotMenuIcon />
            </button>

            <Link href="/" className="flex h-12 items-center justify-center">
              <span className="dot-logo">Nothing (R)</span>
            </Link>

            <Link
              href="/cart"
              className="relative flex h-12 items-center justify-center text-[#111] transition-opacity hover:opacity-70"
              aria-label={itemCount > 0 ? `Open cart with ${itemCount} items` : 'Open cart'}
            >
              <CartIcon />
              {itemCount > 0 ? (
                <span className="absolute right-5 top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-black px-1.5 py-0.5 text-[9px] tracking-[0.18em] text-white">
                  {cartCountLabel}
                </span>
              ) : (
                <span className="absolute bottom-3 h-1.5 w-1.5 rounded-full bg-[#111]" />
              )}
            </Link>
          </nav>
        </div>

        <div
          className={`frost-panel mt-2 overflow-hidden rounded-lg transition duration-300 ${
            isDrawerOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0'
          }`}
        >
          <ul className="divide-y divide-zinc-200/90 px-3 py-2">
            {menuItems.map((item) => (
              <li key={item.slug}>
                <div className="py-3">
                  <Link
                    href={item.href}
                    className="block text-sm uppercase tracking-[0.2em] transition-opacity hover:opacity-60"
                  >
                    {item.label}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </header>
    </>
  )
}
