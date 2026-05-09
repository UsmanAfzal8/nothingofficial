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

type OrderFormProps = {
  product: SelectedProduct | null
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

type PaymentMethod = 'cod' | 'bank_transfer'

const initialSubmitState: SubmitState = {
  status: 'idle',
  message: '',
  orderNumber: null,
}

const fieldClassName =
  'w-full rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200'

const SHIPPING_FEE = 450
const GOVT_TAX_RATE = 0.04
const BANK_ACCOUNT = {
  bank: 'BANK ALFALAH',
  accountName: 'SOFTWARE SUITE',
  accountNumber: '57065002899706',
  iban: 'PK40ALFH5706005002899706',
  whatsapp: '03361070111',
  whatsappUrl: 'https://wa.me/923361070111',
} as const

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

function getPakistanCalendarDate(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  return {
    year: Number(parts.find((part) => part.type === 'year')?.value ?? date.getUTCFullYear()),
    month: Number(parts.find((part) => part.type === 'month')?.value ?? date.getUTCMonth() + 1),
    day: Number(parts.find((part) => part.type === 'day')?.value ?? date.getUTCDate()),
  }
}

function createUtcDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day))
}

function addUtcDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setUTCDate(nextDate.getUTCDate() + days)
  return nextDate
}

function formatShortMonthDay(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function formatDeliveryRangeLabel(startDate: Date, endDate: Date) {
  const startLabel = formatShortMonthDay(startDate)
  const endLabel = formatShortMonthDay(endDate)

  return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`
}

function getDeliveryTimeline(paymentMethod: PaymentMethod) {
  const pakistanToday = getPakistanCalendarDate(new Date())
  const orderDate = createUtcDate(pakistanToday.year, pakistanToday.month, pakistanToday.day)
  const processDate = addUtcDays(orderDate, 1)
  const deliveryStartDate = paymentMethod === 'bank_transfer' ? addUtcDays(processDate, 1) : addUtcDays(processDate, 2)
  const deliveryEndDate = paymentMethod === 'bank_transfer' ? deliveryStartDate : addUtcDays(processDate, 3)

  return {
    processDateLabel: formatShortMonthDay(processDate),
    deliveryRangeLabel: formatDeliveryRangeLabel(deliveryStartDate, deliveryEndDate),
  }
}

function PlusMinusIcon({ open }: { open: boolean }) {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-base text-slate-500">
      {open ? '-' : '+'}
    </span>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.8c5.08 0 9.2 4.12 9.2 9.2S17.08 21.2 12 21.2c-1.54 0-3-.38-4.29-1.06L3.4 21.4l1.3-4.18A9.15 9.15 0 0 1 2.8 12c0-5.08 4.12-9.2 9.2-9.2Z"
        fill="#25D366"
      />
      <path
        d="M8.95 7.9c-.24 0-.47.11-.62.34-.35.5-.46 1.15-.3 1.73.3 1.12 1.06 2.22 2.14 3.29 1.08 1.08 2.18 1.84 3.3 2.15.58.16 1.23.05 1.73-.3.22-.15.34-.38.34-.62v-.86c0-.23-.15-.43-.37-.5l-1.72-.57a.62.62 0 0 0-.63.16l-.57.58a.47.47 0 0 1-.49.13c-.67-.22-1.78-1.09-2.16-1.8a.45.45 0 0 1 .08-.52l.57-.58a.63.63 0 0 0 .16-.63l-.57-1.73a.53.53 0 0 0-.5-.37h-.39Z"
        fill="white"
      />
    </svg>
  )
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

export function OrderForm({ product }: OrderFormProps) {
  const { items: cartItems, subtotal: cartSubtotal, clearCart } = useCart()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [phone, setPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false)
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
  const deliveryTimeline = useMemo(() => getDeliveryTimeline(paymentMethod), [paymentMethod])
  const govtTaxAmount = useMemo(
    () => Number((paymentMethod === 'cod' ? checkoutSubtotal * GOVT_TAX_RATE : 0).toFixed(2)),
    [checkoutSubtotal, paymentMethod],
  )
  const shippingFee = paymentMethod === 'bank_transfer' ? 0 : SHIPPING_FEE
  const totalPrice = useMemo(
    () => Math.max(0, Number((checkoutSubtotal + govtTaxAmount + shippingFee).toFixed(2))),
    [checkoutSubtotal, govtTaxAmount, shippingFee],
  )
  const paymentNotes =
    paymentMethod === 'bank_transfer'
      ? `Non COD: Bank transfer customer gets free shipping and 0% tax. We pay the 4% govt tax. Express next-day delivery. After payment send screenshot to ${BANK_ACCOUNT.whatsapp}.`
      : 'COD order: Rs 450 shipping fee and 4% govt tax applied.'

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
        </div>
      </section>
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) {
      setSubmitState({
        status: 'error',
        message: 'Please fill in name, address, city, district, and phone. Postal code is optional.',
        orderNumber: null,
      })
      return
    }

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
          paymentMethod,
          shippingFee,
          govtTaxAmount,
          totalPrice,
          notes: paymentNotes,
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
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <aside className="order-1 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:p-8 lg:order-2">
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setMobileSummaryOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-4"
              aria-expanded={mobileSummaryOpen}
              aria-controls="order-summary-panel"
            >
              <div>
                <h2 className="text-left text-2xl font-semibold tracking-[-0.02em] text-slate-900">Order summary</h2>
                <p className="mt-1 text-left text-sm text-slate-500">{itemCount} item{itemCount === 1 ? '' : 's'} in this order</p>
              </div>
              <PlusMinusIcon open={mobileSummaryOpen} />
            </button>
          </div>

          <div id="order-summary-panel" className={`${mobileSummaryOpen ? 'mt-6 block' : 'hidden'} lg:mt-0 lg:block`}>
            <div className="hidden lg:block">
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-900">Order summary</h2>
            </div>

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
              {checkoutItems.length > 0
                ? checkoutItems.map((item) => {
                    const itemTotal = typeof item.price === 'number' ? item.price * item.quantity : null

                    return (
                      <div
                        key={`${item.handle || 'general'}-${item.name}`}
                        className="rounded-[18px] border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="product-card-name text-base text-slate-900">{item.name}</h3>
                            <p className="mt-1 text-sm text-slate-500">Qty {item.quantity}</p>
                          </div>
                          <p className="text-sm font-medium text-slate-900">{itemTotal !== null ? formatPrice(itemTotal) : 'Pending'}</p>
                        </div>
                        {typeof item.price === 'number' ? <p className="mt-2 text-sm text-slate-500">{formatPrice(item.price)} each</p> : null}
                      </div>
                    )
                  })
                : null}
            </div>

            <div className="mt-6 rounded-[22px] border border-slate-200 bg-[linear-gradient(180deg,#fbfcff_0%,#f4f7fb_100%)] p-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">{checkoutSubtotal > 0 ? formatPrice(checkoutSubtotal) : 'Confirm on call'}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Shipping fee</span>
                  <span className="font-medium text-slate-900">{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Govt Tax</span>
                  <span className="font-medium text-slate-900">{formatPrice(govtTaxAmount)}</span>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Total</span>
                    <span className="text-xl font-semibold tracking-[-0.03em] text-slate-900">
                      {totalPrice > 0 ? formatPrice(totalPrice) : 'Confirm on call'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="order-2 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:p-8 lg:order-1">
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
                  <span className="text-sm font-medium text-slate-700">Postal code <span className="font-normal text-slate-400">(optional)</span></span>
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

              <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold tracking-[-0.02em] text-slate-900">Payment method</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">COD orders = Rs 450 Shipping fee + 4% Govt Tax. Non COD bank transfer gets free shipping and 0% tax.</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`rounded-[20px] border p-0 text-left transition ${
                      paymentMethod === 'cod'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-[0_18px_32px_rgba(15,23,42,0.18)]'
                        : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 p-3 sm:p-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em]">Cash on delivery</p>
                        <p className={`mt-2 text-sm leading-6 ${paymentMethod === 'cod' ? 'text-white/80' : 'text-slate-600'}`}>
                          COD orders = Rs 450 Shipping fee + 4% Govt Tax.
                        </p>
                      </div>
                      <span className={`inline-flex h-5 w-5 rounded-full border ${paymentMethod === 'cod' ? 'border-white bg-white' : 'border-slate-300'}`}>
                        {paymentMethod === 'cod' ? <span className="m-auto h-2.5 w-2.5 rounded-full bg-slate-900" /> : null}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`rounded-[22px] border p-0 text-left transition ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-emerald-500 bg-[linear-gradient(180deg,#f0fdf4_0%,#ecfdf5_100%)] text-slate-900 shadow-[0_18px_32px_rgba(16,185,129,0.12)]'
                        : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 p-3 sm:p-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em]">Bank transfer</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">Non COD: Bank Transfer customers get Free Shipping, 0% Tax. We pay your 4% govt tax. Plus, get Express Next-Day Delivery.</p>
                      </div>
                      <span className={`inline-flex h-5 w-5 rounded-full border ${paymentMethod === 'bank_transfer' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'}`}>
                        {paymentMethod === 'bank_transfer' ? <span className="m-auto h-2.5 w-2.5 rounded-full bg-white" /> : null}
                      </span>
                    </div>

                    <div className="mx-3 mb-3 mt-1 rounded-[18px] border border-emerald-100 bg-white/90 p-3 text-sm leading-6 text-slate-700 sm:mx-4 sm:mb-4 sm:p-4">
                      <p className="font-semibold text-slate-900">{BANK_ACCOUNT.bank}</p>
                      <p className="mt-2"><span className="font-medium">Name:</span> {BANK_ACCOUNT.accountName}</p>
                      <p><span className="font-medium">ACC#</span> {BANK_ACCOUNT.accountNumber}</p>
                      <p><span className="font-medium">IBAN:</span> {BANK_ACCOUNT.iban}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] leading-5 text-slate-600">
                        <span>After payment send screenshot to</span>
                        <Link
                          href={BANK_ACCOUNT.whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366]/12 px-2 py-1 text-[11px] font-medium text-[#128C7E] transition hover:bg-[#25D366]/20"
                          aria-label="Open WhatsApp"
                        >
                          <WhatsAppIcon />
                        </Link>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {submitState.status === 'error' ? (
              <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitState.message}</div>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                {itemCount > 0 ? `${itemCount} item${itemCount === 1 ? '' : 's'} in this order` : 'General request'}
              </p>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#fffdfa_0%,#ffffff_100%)] p-5 shadow-[0_14px_32px_rgba(244,110,30,0.08)]">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">{formatPrice(checkoutSubtotal) ?? 'Confirm on call'}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Shipping fee</span>
                  <span className="font-medium text-slate-900">{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Govt Tax</span>
                  <span className="font-medium text-slate-900">{formatPrice(govtTaxAmount)}</span>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Total</span>
                    <span className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">{formatPrice(totalPrice) ?? 'Confirm on call'}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitState.status === 'submitting'}
                className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-[16px] bg-slate-900 px-6 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitState.status === 'submitting' ? 'Placing order...' : 'Place Order'}
              </button>

              <div className="mt-5 rounded-[18px] border border-[#f7d9b7] bg-[linear-gradient(180deg,#fffdfa_0%,#ffffff_100%)] px-4 py-4">
                <p className="text-[0.82rem] font-black uppercase tracking-normal text-[#8d8d8d]">Estimated delivery</p>
                <p className="mt-1 text-[1.55rem] font-bold leading-none text-[#ff6f00]">{deliveryTimeline.deliveryRangeLabel}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Processing starts by {deliveryTimeline.processDateLabel}. {paymentMethod === 'bank_transfer' ? 'Online payment orders are expected the next day after processing.' : 'Final timing may vary slightly by city and confirmation time.'}
                </p>
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
