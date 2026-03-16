'use client'

import Image from 'next/image'
import Link from 'next/link'
import { type FormEvent, useMemo, useState } from 'react'
import { useCart } from '@/components/CartProvider'
import type { CartItem } from '@/lib/models/cart'

type SelectedProduct = {
  handle: string
  name: string
  image: string | null
  price: number | null
}

type OrderFormLink = {
  href: string
  label: string
}

type OrderFormProps = {
  product: SelectedProduct | null
  backLink?: OrderFormLink | null
}

type SubmitState = {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message: string
  orderNumber: string | null
}

type CheckoutItem = {
  handle: string | null
  name: string
  image: string | null
  price: number | null
  quantity: number
}

const initialSubmitState: SubmitState = {
  status: 'idle',
  message: '',
  orderNumber: null,
}

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

function mapProductToCheckoutItem(product: SelectedProduct): CheckoutItem {
  return {
    handle: product.handle,
    name: product.name,
    image: product.image,
    price: product.price,
    quantity: 1,
  }
}

function mapCartItemToCheckoutItem(item: CartItem): CheckoutItem {
  return {
    handle: item.handle,
    name: item.name,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
  }
}

function getCheckoutItemCount(items: CheckoutItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0)
}

export function OrderForm({ product, backLink }: OrderFormProps) {
  const { items: cartItems, subtotal: cartSubtotal, clearCart } = useCart()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [phone, setPhone] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>(initialSubmitState)

  const canSubmit = useMemo(() => {
    return name.trim() && address.trim() && city.trim() && district.trim() && phone.trim()
  }, [name, address, city, district, phone])

  const isCartCheckout = !product && cartItems.length > 0
  const checkoutItems = useMemo<CheckoutItem[]>(() => {
    if (product) {
      return [mapProductToCheckoutItem(product)]
    }

    if (cartItems.length > 0) {
      return cartItems.map((item) => mapCartItemToCheckoutItem(item))
    }

    return []
  }, [cartItems, product])

  const checkoutSubtotal = useMemo(() => {
    if (product) {
      return product.price ?? 0
    }

    if (cartItems.length > 0) {
      return cartSubtotal
    }

    return 0
  }, [cartItems.length, cartSubtotal, product])

  const itemCount = getCheckoutItemCount(checkoutItems)
  const heroImage = product?.image ?? checkoutItems[0]?.image ?? null
  const heroEyebrow = product ? 'Product Order' : isCartCheckout ? 'Cart Checkout' : 'Live Catalog Order'
  const heroTitle = product?.name ?? (isCartCheckout ? 'Finish your cart order' : 'Place your order')
  const heroDescription = product
    ? 'Continue in the same Nothing Pakistan flow from the homepage into checkout. We will confirm your order and delivery details by phone.'
    : isCartCheckout
      ? 'Your selected items are ready. Confirm the delivery details below and we will save the full cart into your live Supabase orders table.'
      : 'Use the same live catalog flow to place a direct order. You can order a selected product, a full cart, or a general request.'
  const secondaryLink: OrderFormLink =
    cartItems.length > 0
      ? { href: '/cart', label: isCartCheckout ? 'Review Cart' : `View Cart (${cartItems.length})` }
      : { href: '/collections/shop-all', label: 'Shop All' }

  function resetSubmitState() {
    setSubmitState(initialSubmitState)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) return

    setSubmitState({ status: 'submitting', message: '', orderNumber: null })

    try {
      const requestItems =
        checkoutItems.length > 0
          ? checkoutItems.map((item) => ({
              productHandle: item.handle,
              productName: item.name,
              imageUrl: item.image,
              quantity: item.quantity,
              unitPrice: item.price ?? 0,
              currency: 'PKR',
            }))
          : [
              {
                productHandle: null,
                productName: 'General Product Order',
                imageUrl: null,
                quantity: 1,
                unitPrice: 0,
                currency: 'PKR',
              },
            ]

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          address,
          city,
          district,
          postalCode,
          phone,
          items: requestItems,
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to place order.')
      }

      setSubmitState({
        status: 'success',
        message: isCartCheckout ? 'Cart order is done. We will contact you soon.' : 'Order is done. We will contact you soon.',
        orderNumber: payload.order?.orderNumber ?? null,
      })

      if (isCartCheckout) {
        clearCart()
      }

      setName('')
      setAddress('')
      setCity('')
      setDistrict('')
      setPostalCode('')
      setPhone('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to place order.'
      setSubmitState({ status: 'error', message, orderNumber: null })
    }
  }

  return (
    <div className="grid gap-6">
      <section className="relative overflow-hidden rounded-[38px] border border-black/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(225,226,222,0.82)_45%,rgba(208,210,204,0.78))]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.2),transparent_30%,rgba(17,17,17,0.08)_120%)]" />

        <div className="relative grid min-h-[540px] gap-10 px-4 pb-8 pt-10 md:grid-cols-[minmax(0,1fr)_minmax(320px,560px)] md:items-center md:px-8">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.34em] text-black/45">{heroEyebrow}</p>
            <h1 className="collection-product-name mt-5 text-5xl leading-[0.92] sm:text-6xl lg:text-7xl">{heroTitle}</h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-black/65 sm:text-base">{heroDescription}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {backLink ? (
                <Link
                  href={backLink.href}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-[11px] uppercase tracking-[0.24em] text-white transition-opacity hover:opacity-85"
                >
                  {backLink.label}
                </Link>
              ) : null}

              <Link
                href={secondaryLink.href}
                className="inline-flex h-11 items-center justify-center rounded-full border border-black/15 px-5 text-[11px] uppercase tracking-[0.24em] text-black transition-colors hover:bg-black hover:text-white"
              >
                {secondaryLink.label}
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {checkoutSubtotal > 0 ? (
                <span className="rounded-full border border-black/12 bg-white/80 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-black/70">
                  {formatPrice(checkoutSubtotal)}
                </span>
              ) : null}
              <span className="rounded-full border border-black/12 bg-white/70 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-black/58">
                {itemCount > 0 ? `${itemCount} item${itemCount === 1 ? '' : 's'}` : 'General request'}
              </span>
              <span className="rounded-full border border-black/12 bg-white/60 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-black/48">
                Live order flow
              </span>
            </div>
          </div>

          <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-[36px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(236,237,233,0.92))] p-8 shadow-[0_30px_90px_rgba(17,17,17,0.08)]">
            <div className="dot-mesh-background absolute inset-0 opacity-30" />

            <div className="absolute left-5 top-5 rounded-full border border-black/10 bg-white/75 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-black/58 backdrop-blur-xl">
              {itemCount > 0 ? `${itemCount} item${itemCount === 1 ? '' : 's'}` : 'General order'}
            </div>

            <div className="absolute bottom-5 left-5 max-w-[240px] rounded-[24px] border border-white/75 bg-[rgba(255,255,255,0.85)] px-4 py-4 shadow-[0_14px_30px_rgba(17,17,17,0.08)] backdrop-blur-xl">
              <p className="text-[9px] uppercase tracking-[0.22em] text-black/38">Subtotal</p>
              <p className="collection-product-name mt-2 text-[1.8rem] leading-none text-black/92">
                {checkoutSubtotal > 0 ? formatPrice(checkoutSubtotal) : 'Confirm on call'}
              </p>
              <p className="mt-2 text-xs leading-5 text-black/58">Saved in the same live Supabase checkout flow.</p>
            </div>

            {checkoutItems.length > 1 ? (
              <div className="absolute right-5 top-5 w-[220px] rounded-[24px] border border-white/75 bg-[rgba(255,255,255,0.82)] p-4 shadow-[0_14px_30px_rgba(17,17,17,0.08)] backdrop-blur-xl">
                <p className="text-[9px] uppercase tracking-[0.22em] text-black/38">In this order</p>
                <div className="mt-3 grid gap-2">
                  {checkoutItems.slice(0, 3).map((item) => (
                    <div key={`${item.handle || 'general'}-${item.name}`} className="rounded-[16px] border border-black/8 bg-white/70 px-3 py-2">
                      <p className="truncate text-[10px] uppercase tracking-[0.18em] text-black/58">{item.name}</p>
                      <p className="mt-1 text-[10px] text-black/46">Qty {item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {heroImage ? (
              <div className="relative h-[280px] w-full max-w-[520px] sm:h-[360px] lg:h-[430px]">
                <Image
                  src={heroImage}
                  alt={product?.name ?? checkoutItems[0]?.name ?? 'Order preview'}
                  fill
                  sizes="(max-width: 1024px) 80vw, 40vw"
                  className="object-contain drop-shadow-[0_30px_70px_rgba(0,0,0,0.18)]"
                />
              </div>
            ) : (
              <div className="relative flex h-full min-h-[320px] w-full items-center justify-center rounded-[28px] border border-dashed border-black/10 bg-white/40 px-6 text-center text-xs uppercase tracking-[0.28em] text-black/35">
                Nothing Pakistan checkout
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
        <section className="relative overflow-hidden rounded-[36px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(238,239,235,0.94))] p-6 shadow-[0_30px_90px_rgba(17,17,17,0.08)] md:p-8">
          <div className="dot-mesh-background absolute inset-0 opacity-20" />

          <div className="relative">
            <p className="text-[10px] uppercase tracking-[0.28em] text-black/42">Customer Details</p>
            <h2 className="collection-product-name mt-3 text-3xl leading-tight md:text-4xl">Where should we deliver?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/64 md:text-base">
              Fill in the delivery information below. We use the same visual system as the homepage here so the order flow stays connected from discovery to checkout.
            </p>

            {submitState.status === 'success' ? (
              <div className="relative mt-8 overflow-hidden rounded-[30px] border border-emerald-500/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(235,251,243,0.96))] px-6 py-10 text-center shadow-[0_20px_60px_rgba(17,17,17,0.05)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_55%)]" />
                <div className="order-success-icon relative mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
                  <svg viewBox="0 0 72 72" className="h-16 w-16" fill="none" aria-hidden="true">
                    <circle cx="36" cy="36" r="30" stroke="#10B981" strokeWidth="4" />
                    <path
                      d="M22 37.5L31.5 47L50 28.5"
                      className="order-success-check"
                      stroke="#111111"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <p className="text-[10px] uppercase tracking-[0.28em] text-black/42">Order Confirmed</p>
                <h3 className="collection-product-name mt-3 text-4xl leading-tight">Order is done</h3>
                <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/68">{submitState.message}</p>
                {submitState.orderNumber ? (
                  <p className="mt-3 text-xs uppercase tracking-[0.22em] text-black/54">Order #{submitState.orderNumber}</p>
                ) : null}

                <button
                  type="button"
                  onClick={resetSubmitState}
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-[11px] uppercase tracking-[0.24em] text-white transition-opacity hover:opacity-85"
                >
                  Place another order
                </button>
              </div>
            ) : (
              <form className="relative mt-8 grid gap-5" onSubmit={handleSubmit}>
                <div className="grid gap-5">
                  <label className="grid gap-2">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-black/52">Full name</span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Your full name"
                      className="h-12 rounded-[18px] border border-black/10 bg-white/86 px-4 text-sm text-black/82 outline-none transition focus:border-black/35"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-black/52">Address</span>
                    <input
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      placeholder="House / street / area"
                      className="h-12 rounded-[18px] border border-black/10 bg-white/86 px-4 text-sm text-black/82 outline-none transition focus:border-black/35"
                    />
                  </label>

                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-black/52">City</span>
                      <input
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        placeholder="City"
                        className="h-12 rounded-[18px] border border-black/10 bg-white/86 px-4 text-sm text-black/82 outline-none transition focus:border-black/35"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-black/52">District</span>
                      <input
                        value={district}
                        onChange={(event) => setDistrict(event.target.value)}
                        placeholder="District"
                        className="h-12 rounded-[18px] border border-black/10 bg-white/86 px-4 text-sm text-black/82 outline-none transition focus:border-black/35"
                      />
                    </label>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-black/52">Postal code</span>
                      <input
                        value={postalCode}
                        onChange={(event) => setPostalCode(event.target.value)}
                        placeholder="Postal code"
                        className="h-12 rounded-[18px] border border-black/10 bg-white/86 px-4 text-sm text-black/82 outline-none transition focus:border-black/35"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-black/52">Phone number</span>
                      <input
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="+92 300 0000000"
                        className="h-12 rounded-[18px] border border-black/10 bg-white/86 px-4 text-sm text-black/82 outline-none transition focus:border-black/35"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={!canSubmit || submitState.status === 'submitting'}
                    className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-[11px] uppercase tracking-[0.24em] text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitState.status === 'submitting' ? 'Placing order...' : 'Take Order'}
                  </button>

                  <p className="text-[11px] uppercase tracking-[0.22em] text-black/42">
                    {itemCount > 0 ? `${itemCount} item${itemCount === 1 ? '' : 's'} in this order` : 'General request'}
                  </p>
                </div>

                {submitState.status === 'error' ? (
                  <div className="rounded-[20px] border border-red-500/20 bg-red-50/90 px-4 py-3 text-sm text-red-700">
                    {submitState.message}
                  </div>
                ) : null}
              </form>
            )}
          </div>
        </section>

        <aside className="relative overflow-hidden rounded-[36px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(238,239,235,0.94))] p-6 shadow-[0_30px_90px_rgba(17,17,17,0.08)] md:p-8">
          <div className="dot-mesh-background absolute inset-0 opacity-20" />

          <div className="relative">
            <p className="text-[10px] uppercase tracking-[0.28em] text-black/42">Order Summary</p>
            <h2 className="collection-product-name mt-3 text-3xl leading-tight md:text-4xl">Everything linked together</h2>

            <div className="mt-7 rounded-[26px] border border-black/10 bg-white/78 p-4 shadow-[0_16px_40px_rgba(17,17,17,0.05)]">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-black/46">
                <span>{checkoutItems.length > 0 ? 'Items in this order' : 'General order'}</span>
                <span>{itemCount > 0 ? `${itemCount} total` : 'No item selected'}</span>
              </div>

              <div className="mt-4 space-y-3">
                {checkoutItems.length > 0 ? (
                  checkoutItems.map((item) => {
                    const itemTotal = typeof item.price === 'number' ? item.price * item.quantity : null

                    return (
                      <div
                        key={`${item.handle || 'general'}-${item.name}`}
                        className="rounded-[22px] border border-black/8 bg-[#f8f8f6] p-3"
                      >
                        <div className="grid gap-3 sm:grid-cols-[88px_minmax(0,1fr)] sm:items-center">
                          {item.image ? (
                            <div className="relative flex h-24 items-center justify-center rounded-[18px] bg-white/88 p-2">
                              <Image src={item.image} alt={item.name} fill sizes="88px" className="object-contain p-2" />
                            </div>
                          ) : null}

                          <div>
                            <h3 className="collection-product-name text-[1.6rem] leading-tight text-black/92">{item.name}</h3>
                            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-black/46">
                              Qty {item.quantity}
                              {formatPrice(item.price) ? ` • ${formatPrice(item.price)}` : ''}
                            </p>
                            {itemTotal !== null ? (
                              <p className="mt-2 text-sm text-black/68">{formatPrice(itemTotal)}</p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-[22px] border border-black/8 bg-[#f8f8f6] p-4">
                    <h3 className="collection-product-name text-[1.6rem] leading-tight text-black/92">General Order</h3>
                    <p className="mt-3 text-sm leading-6 text-black/66">
                      No product was selected. We will review your request and confirm the details by phone.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-[26px] border border-black/10 bg-black/[0.03] p-4">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-black/46">
                <span>Subtotal</span>
                <span>{checkoutSubtotal > 0 ? formatPrice(checkoutSubtotal) : 'Pending'}</span>
              </div>
              <div className="mt-4 grid gap-2 text-sm leading-6 text-black/66">
                <p>1. We save your order in Supabase.</p>
                <p>2. Our team calls to confirm stock and address.</p>
                <p>3. The order moves through processing and delivery.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
