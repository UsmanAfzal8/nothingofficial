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

      <header className="pointer-events-none fixed left-1/2 top-0 z-50 w-full max-w-lg -translate-x-1/2 px-4 pt-4">
        <div className="relative">
          <div className="pointer-events-auto frost-panel overflow-hidden rounded-lg">
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
            <div className="pointer-events-auto frost-panel absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-lg">
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
          ) : null}
        </div>
      </header>
    </>
  )
}
