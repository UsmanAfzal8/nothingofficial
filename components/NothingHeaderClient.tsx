'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCart } from '@/components/CartProvider'
import type { NavigationItem } from '@/lib/models/catalog'
import cartIcon from '@/assets/icons/cart.svg'
import menuIcon from '@/assets/icons/menu.svg'

type NothingHeaderClientProps = {
  menuItems: NavigationItem[]
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  )
}

export function NothingHeaderClient({ menuItems }: NothingHeaderClientProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const pathname = usePathname()
  const { itemCount } = useCart()
  const cartCountLabel = itemCount > 9 ? '9+' : String(itemCount)
  const visibleMenuItems = menuItems.filter((item) => item.slug !== 'trending-picks')

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
          className="fixed inset-0 z-40 bg-white/64 backdrop-blur-[10px]"
        />
      )}

      <header className="pointer-events-none fixed left-1/2 top-0 z-50 w-full max-w-lg -translate-x-1/2 px-4 pt-4">
        <div className="relative">
          <div className={`pointer-events-auto frost-panel overflow-hidden rounded-lg transition-opacity duration-200 ${isDrawerOpen ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
            <nav className="grid h-12 grid-cols-[80px,1fr,80px] items-center">
              <button
                type="button"
                onClick={() => setIsDrawerOpen((open) => !open)}
                className="flex h-12 items-center justify-center text-[#111] transition-opacity hover:opacity-70"
                aria-label="Open menu"
              >
                <Image src={menuIcon} alt="" aria-hidden="true" className="h-[18px] w-[18px]" />
              </button>

              <Link href="/" className="flex h-12 items-center justify-center">
                <span className="dot-logo">Nothing (R)</span>
              </Link>

              <Link
                href="/cart"
                className="relative flex h-12 items-center justify-center text-[#111] transition-opacity hover:opacity-70"
                aria-label={itemCount > 0 ? `Open cart with ${itemCount} items` : 'Open cart'}
              >
                <Image src={cartIcon} alt="" aria-hidden="true" className="h-[20px] w-[20px]" />
                {itemCount > 0 ? (
                  <span className="absolute right-5 top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-black px-1.5 py-0.5 text-[9px] tracking-[0.18em] text-white">
                    {cartCountLabel}
                  </span>
                ) : null}
              </Link>
            </nav>
          </div>

          {isDrawerOpen ? (
            <div
              aria-modal="true"
              role="dialog"
              className="pointer-events-auto fixed inset-y-3 left-1/2 z-50 flex w-[min(calc(100vw-1rem),412px)] -translate-x-1/2 flex-col rounded-[12px] border border-white/80 bg-[#fbf7ef] px-3 py-3 text-[#111] shadow-[0_32px_110px_rgba(17,17,17,0.22)]"
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  aria-label="Close menu"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-black/62 transition-opacity hover:opacity-65"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <CloseIcon className="h-[14px] w-[14px]" />
                </button>

                <Link href="/" className="truncate px-3 text-center dot-logo text-black/72" onClick={() => setIsDrawerOpen(false)}>
                  Nothing (R)
                </Link>

                <Link
                  href="/cart"
                  className="relative inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-black/62 transition-opacity hover:opacity-65"
                  aria-label={itemCount > 0 ? `Open cart with ${itemCount} items` : 'Open cart'}
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <Image src={cartIcon} alt="" aria-hidden="true" className="h-[14px] w-[14px] object-contain opacity-70" />
                  {itemCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] text-white">
                      {cartCountLabel}
                    </span>
                  ) : null}
                </Link>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center px-4 pb-8 pt-4">
                <nav className="flex w-full max-w-[300px] flex-col items-center border-t border-black/10 text-center">
                  {visibleMenuItems.map((item) => (
                    <Link
                      key={item.slug}
                      href={item.href}
                      className="w-full border-b border-black/10 py-4 dot-heading text-[clamp(1.8rem,5vw,2.45rem)] leading-[0.92] tracking-[0.04em] text-black/82 transition-opacity hover:opacity-58"
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          ) : null}
        </div>
      </header>
    </>
  )
}
