'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCart } from '@/components/CartProvider'
import type { NavigationItem } from '@/lib/models/catalog'
import cancelIcon from '@/assets/icons/cancel_icon.svg'
import cartIcon from '@/assets/icons/cart.svg'
import menuIcon from '@/assets/icons/menu.svg'
import nothingLogo from '@/assets/logo/nothing_logo.webp'

type NothingHeaderClientProps = {
  menuItems: NavigationItem[]
}

export function NothingHeaderClient({ menuItems }: NothingHeaderClientProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const pathname = usePathname()
  const { itemCount } = useCart()
  const cartCountLabel = itemCount > 9 ? '9+' : String(itemCount)
  const visibleMenuItems = menuItems.filter((item) => !item.slug.endsWith('trending-picks'))

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
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-4 md:px-6 md:pt-5">
        <div className="w-full max-w-[500px] lg:max-w-[480px]">
          <div
            className={`grid h-12 grid-cols-[44px_minmax(0,1fr)_44px] items-center rounded-[10px] border border-black/8 bg-white/[0.97] px-2 text-[#111] shadow-[0_16px_40px_rgba(17,17,17,0.12)] transition-opacity duration-200 md:grid-cols-[44px_minmax(0,1fr)_44px] md:px-3 ${
              isDrawerOpen ? 'pointer-events-none opacity-0' : 'opacity-100'
            }`}
          >
            <button
              type="button"
              aria-expanded={isDrawerOpen}
              aria-label={isDrawerOpen ? 'Close menu' : 'Open menu'}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] transition-opacity hover:opacity-65"
              onClick={() => setIsDrawerOpen((current) => !current)}
            >
              {isDrawerOpen ? (
                <Image
                  src={cancelIcon}
                  alt="Close menu icon"
                  aria-hidden="true"
                  className="h-[18px] w-[18px] object-contain opacity-70"
                />
              ) : (
                <Image
                  src={menuIcon}
                  alt="Open menu icon"
                  aria-hidden="true"
                  className="h-[18px] w-[18px] object-contain opacity-70"
                />
              )}
            </button>

            <Link href="/" className="header-brand-logo inline-flex h-full items-center justify-center px-1">
              <Image
                src={nothingLogo}
                alt="Nothing"
                priority
                className="h-auto w-[100px] max-w-none object-contain opacity-90"
              />
            </Link>

            <Link
              href="/cart"
              className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center justify-self-end rounded-[8px] transition-opacity hover:opacity-65"
              aria-label={itemCount > 0 ? `Open cart with ${itemCount} items` : 'Open cart'}
            >
              <Image
                src={cartIcon}
                alt="Cart icon"
                aria-hidden="true"
                className="h-[19px] w-[19px] object-contain opacity-70"
              />
              {itemCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] text-white">
                  {cartCountLabel}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </header>

      {isDrawerOpen ? (
        <>
          <button
            type="button"
            aria-label="Close menu backdrop"
            className="fixed inset-0 z-40 bg-[#f4f4f1]/44 backdrop-blur-[22px]"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div
            aria-modal="true"
            role="dialog"
            className="fixed inset-y-3 left-1/2 z-50 flex w-[min(calc(100vw-1rem),412px)] -translate-x-1/2 flex-col rounded-[12px] border border-black/8 bg-white/[0.97] px-3 py-3 text-[#111] shadow-[0_30px_90px_rgba(17,17,17,0.18)]"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                aria-label="Close menu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-black/62 transition-opacity hover:opacity-65"
                onClick={() => setIsDrawerOpen(false)}
              >
                <Image
                  src={cancelIcon}
                  alt="Close menu icon"
                  aria-hidden="true"
                  className="h-[18px] w-[18px] object-contain opacity-70"
                />
              </button>

              <Link
                href="/"
                className="header-brand-logo inline-flex h-10 items-center justify-center px-2"
                onClick={() => setIsDrawerOpen(false)}
              >
                <Image
                  src={nothingLogo}
                  alt="Nothing"
                  className="h-auto w-[144px] max-w-none object-contain opacity-90"
                />
              </Link>

              <Link
                href="/cart"
                className="relative inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-black/62 transition-opacity hover:opacity-65"
                aria-label={itemCount > 0 ? `Open cart with ${itemCount} items` : 'Open cart'}
                onClick={() => setIsDrawerOpen(false)}
              >
                <Image
                  src={cartIcon}
                  alt="Cart icon"
                  aria-hidden="true"
                  className="h-[19px] w-[19px] object-contain opacity-70"
                />
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
                    className="site-drawer-menu-link dot-heading w-full border-b border-black/10 py-4 text-[clamp(1.8rem,5vw,2.45rem)] uppercase leading-[0.92] tracking-[0.04em] text-black/82 transition-opacity hover:opacity-58"
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </>
      ) : null}
    </>
  )
}
