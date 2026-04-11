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

const fieldClassName =
  'w-full rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200'

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

function OrderSuccessScreen({
  message,
  orderNumber,
}: {
  message: string
  orderNumber: string | null
}) {
  return (
    <section className="mx-auto max-w-2xl rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center font-sans shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:px-10">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 12.5L9.5 17L19 7.5"
            stroke="#059669"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <p className="mt-6 text-sm font-medium text-emerald-700">Order Confirmed</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900 sm:text-4xl">Order is done</h1>
      <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">{message}</p>
      {orderNumber ? <p className="mt-4 text-sm font-medium text-slate-900">Order #{orderNumber}</p> : null}

      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-[16px] bg-slate-900 px-6 text-sm font-medium text-white transition-colors hover:bg-slate-800"
      >
        Continue Shopping
      </Link>
    </section>
  )
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

  const canSubmit = useMemo(
    () => Boolean(name.trim() && address.trim() && city.trim() && district.trim() && phone.trim()),
    [name, address, city, district, phone],
  )

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
  const previewImage = product?.image ?? checkoutItems[0]?.image ?? null
  const pageTitle = product ? 'Complete your order' : isCartCheckout ? 'Checkout' : 'Place your order'
  const pageDescription = product
    ? 'Fill in your delivery details and we will confirm your order by phone.'
    : isCartCheckout
      ? 'Review your cart order and enter the delivery details below.'
      : 'Enter your details and we will contact you to confirm the order.'
  const secondaryLink: OrderFormLink =
    cartItems.length > 0
      ? { href: '/cart', label: isCartCheckout ? 'Back to Cart' : `View Cart (${cartItems.length})` }
    : { href: '/collections/shop-all', label: 'Shop Products' }

  if (!product && !isCartCheckout) {
    return (
      <section className="mx-auto max-w-2xl rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:px-10">
        <p className="text-sm font-medium text-slate-500">Order request</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900 sm:text-4xl">Choose a product first</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
          The standalone order page is only shown when a product is selected. Browse the catalog, open a product page, and then continue to order.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/collections/shop-all"
            className="inline-flex h-12 items-center justify-center rounded-[16px] bg-slate-900 px-6 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Browse Products
          </Link>
          {backLink ? (
            <Link
              href={backLink.href}
              className="inline-flex h-12 items-center justify-center rounded-[16px] border border-slate-200 bg-white px-6 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              {backLink.label}
            </Link>
          ) : null}
        </div>
      </section>
    )
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
          : []

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
        message: isCartCheckout ? 'Your cart order has been placed. We will contact you soon.' : 'Your order has been placed. We will contact you soon.',
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

  if (submitState.status === 'success') {
    return <OrderSuccessScreen message={submitState.message} orderNumber={submitState.orderNumber} />
  }

  return (
    <div className="grid gap-6 font-sans">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-slate-500">{product ? 'Product Order' : isCartCheckout ? 'Cart Checkout' : 'Order Request'}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-900 sm:text-4xl">{pageTitle}</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{pageDescription}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {backLink ? (
              <Link
                href={backLink.href}
                className="inline-flex h-11 items-center justify-center rounded-[14px] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                {backLink.label}
              </Link>
            ) : null}

            <Link
              href={secondaryLink.href}
              className="inline-flex h-11 items-center justify-center rounded-[14px] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              {secondaryLink.label}
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:p-8">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-900">Delivery details</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">Please enter your name, address, and phone number to place the order.</p>

          <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Full name</span>
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  className={fieldClassName}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Address</span>
                <textarea
                  required
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="House / street / area"
                  rows={4}
                  className={`${fieldClassName} min-h-[110px] resize-y`}
                />
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">City</span>
                  <input
                    required
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="City"
                    className={fieldClassName}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">District</span>
                  <input
                    required
                    value={district}
                    onChange={(event) => setDistrict(event.target.value)}
                    placeholder="District"
                    className={fieldClassName}
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">Postal code</span>
                  <input
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
                    placeholder="Postal code"
                    className={fieldClassName}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">Phone number</span>
                  <input
                    required
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+92 300 0000000"
                    className={fieldClassName}
                  />
                </label>
              </div>
            </div>

            {submitState.status === 'error' ? (
              <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitState.message}</div>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                {itemCount > 0 ? `${itemCount} item${itemCount === 1 ? '' : 's'} in this order` : 'General request'}
              </p>

              <button
                type="submit"
                disabled={!canSubmit || submitState.status === 'submitting'}
                className="inline-flex h-12 items-center justify-center rounded-[16px] bg-slate-900 px-6 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitState.status === 'submitting' ? 'Placing order...' : 'Place Order'}
              </button>
            </div>
          </form>
        </section>

        <aside className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:p-8">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-900">Order summary</h2>

          {previewImage ? (
            <div className="mt-6 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <div className="relative h-48 w-full">
                <Image
                  src={previewImage}
                  alt={product?.name ?? checkoutItems[0]?.name ?? 'Order preview'}
                  fill
                  sizes="(max-width: 1024px) 100vw, 360px"
                  className="object-contain"
                />
              </div>
            </div>
          ) : null}

          <div className="mt-6 space-y-3">
          {checkoutItems.length > 0 ? (
              checkoutItems.map((item) => {
                const itemTotal = typeof item.price === 'number' ? item.price * item.quantity : null

                return (
                  <div
                    key={`${item.handle || 'general'}-${item.name}`}
                    className="rounded-[18px] border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-medium text-slate-900">{item.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-slate-900">{itemTotal !== null ? formatPrice(itemTotal) : 'Pending'}</p>
                    </div>
                    {typeof item.price === 'number' ? <p className="mt-2 text-sm text-slate-500">{formatPrice(item.price)} each</p> : null}
                  </div>
                )
              })
            ) : null}
          </div>

          <div className="mt-6 rounded-[18px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Subtotal</span>
              <span className="text-lg font-semibold tracking-[-0.02em] text-slate-900">
                {checkoutSubtotal > 0 ? formatPrice(checkoutSubtotal) : 'Confirm on call'}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">After you place the order, the team will contact you to confirm stock, delivery details, and final processing.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
