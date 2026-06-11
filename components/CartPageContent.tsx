'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/components/CartProvider'

function formatPrice(value: number | null | undefined): string | null {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null
  }

  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function CartPageContent() {
  const { isHydrated, items, itemCount, subtotal, removeItem, updateQuantity } = useCart()

  if (!isHydrated) {
    return (
      <div className="rounded-[34px] border border-black/10 bg-white/72 p-8 shadow-[0_24px_60px_rgba(17,17,17,0.06)] backdrop-blur-xl">
        <p className="dot-logo text-[0.58rem] uppercase tracking-[0.26em]">Cart</p>
        <h1 className="collection-product-name mt-4 text-4xl md:text-5xl">Loading your cart</h1>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <section className="rounded-[34px] border border-black/10 bg-white/72 p-8 shadow-[0_24px_60px_rgba(17,17,17,0.06)] backdrop-blur-xl md:p-10">
        <p className="dot-logo text-[0.58rem] uppercase tracking-[0.26em]">Cart</p>
        <h1 className="collection-product-name mt-4 text-4xl leading-tight md:text-5xl">Your bag is empty</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-black/68 md:text-base">
          Add products from the live Supabase catalog and they will appear here with the same visual language as the rest of the store.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/collections/shop-all"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-5 text-[10px] uppercase tracking-[0.24em] text-white transition-opacity hover:opacity-85"
          >
            Browse catalog
          </Link>
          <Link
            href="/collections/phones"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-5 text-[10px] uppercase tracking-[0.24em] text-black/65 transition-colors hover:bg-black hover:text-white"
          >
            View phones
          </Link>
        </div>
      </section>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_380px]">
      <section className="rounded-[34px] border border-black/10 bg-white/72 p-6 shadow-[0_24px_60px_rgba(17,17,17,0.06)] backdrop-blur-xl md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="dot-logo text-[0.58rem] uppercase tracking-[0.26em]">Cart</p>
            <h1 className="collection-product-name mt-3 text-4xl leading-tight md:text-5xl">Your selected products</h1>
          </div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-black/45">
            {itemCount} item{itemCount === 1 ? '' : 's'}
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          {items.map((item) => {
            const itemTotal = typeof item.price === 'number' ? item.price * item.quantity : null

            return (
              <article
                key={item.handle}
                className="grid gap-4 rounded-[28px] border border-black/10 bg-[#f8f8f6] p-4 shadow-[0_14px_28px_rgba(17,17,17,0.04)] md:grid-cols-[148px_minmax(0,1fr)] md:p-5"
              >
                <div className="relative overflow-hidden rounded-[22px] border border-black/8 bg-[#f1f1ef] p-4">
                  <div className="dot-mesh-background absolute inset-0 opacity-25" />
                  {item.image ? (
                    <div className="relative h-36 w-full">
                      <Image src={item.image} alt={item.name} fill sizes="148px" className="object-contain" />
                    </div>
                  ) : (
                    <div className="relative flex h-36 items-center justify-center text-[10px] uppercase tracking-[0.24em] text-black/28">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="max-w-xl">
                      <p className="text-[9px] uppercase tracking-[0.22em] text-black/34">
                        {item.subtitle || (item.entityType === 'mobile' ? 'Phone' : 'Catalog product')}
                      </p>
                      <h2 className="collection-product-name mt-2 text-[1.7rem] leading-tight text-black/92 md:text-[2rem]">
                        {item.name}
                      </h2>
                      {item.colorName ? (
                        <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-black/48">Colour: {item.colorName}</p>
                      ) : null}
                      <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-black/48">
                        {item.priceLabel || formatPrice(item.price) || 'Price on request'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.handle)}
                      className="rounded-full border border-black/10 bg-white px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-black/55 transition-colors hover:bg-black hover:text-white"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center rounded-full border border-black/10 bg-white p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.handle, item.quantity - 1)}
                        className="h-9 w-9 rounded-full text-lg text-black/65 transition-colors hover:bg-black hover:text-white"
                        aria-label={`Decrease quantity for ${item.name}`}
                      >
                        -
                      </button>
                      <span className="min-w-10 text-center text-[11px] uppercase tracking-[0.18em] text-black/65">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.handle, item.quantity + 1)}
                        className="h-9 w-9 rounded-full text-lg text-black/65 transition-colors hover:bg-black hover:text-white"
                        aria-label={`Increase quantity for ${item.name}`}
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-[0.22em] text-black/34">Line total</p>
                      <p className="mt-2 text-sm text-black/72">{formatPrice(itemTotal) || 'Calculated at checkout'}</p>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[30px] border border-white/70 bg-[rgba(255,255,255,0.92)] p-5 shadow-[0_28px_80px_rgba(17,17,17,0.12)] backdrop-blur-xl md:p-6">
          <p className="dot-logo text-[0.58rem] uppercase tracking-[0.26em]">Summary</p>
          <h2 className="collection-product-name mt-4 text-3xl leading-tight">Ready for checkout</h2>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-[18px] border border-black/10 bg-[#f8f8f6] px-4 py-3 text-sm text-black/72">
              <span>Items</span>
              <span>{itemCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-[18px] border border-black/10 bg-[#f8f8f6] px-4 py-3 text-sm text-black/72">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal) || 'PKR 0'}</span>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-black/62">
            Checkout stays inside the same Nothing Pakistan flow. We’ll use the items from this cart automatically on the order screen.
          </p>

          <div className="mt-6 grid gap-3">
            <Link
              href="/order"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-5 text-[10px] uppercase tracking-[0.24em] text-white transition-opacity hover:opacity-85"
            >
              Continue to checkout
            </Link>
            <Link
              href="/collections/shop-all"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-5 text-[10px] uppercase tracking-[0.24em] text-black/65 transition-colors hover:bg-black hover:text-white"
            >
              Keep shopping
            </Link>
          </div>
        </div>
      </aside>
    </div>
  )
}
