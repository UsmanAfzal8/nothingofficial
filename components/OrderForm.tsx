'use client'

import Image from 'next/image'
import Link from 'next/link'
import { type FormEvent, useMemo, useState } from 'react'
import { CompanyTrustBadge } from '@/components/CompanyTrustBadge'
import { useCart } from '@/components/CartProvider'
import { siteContactAddress } from '@/lib/data/site-content'
import type { CartItem } from '@/lib/models/cart'

type SelectedProduct = {
  handle: string
  name: string
  image: string | null
  colorName: string | null
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
  colorName: string | null
  price: number | null
  quantity: number
}

type PaymentMethod = 'cod' | 'bank_transfer'
type DeliveryType = 'ship' | 'pickup'

const initialSubmitState: SubmitState = {
  status: 'idle',
  message: '',
  orderNumber: null,
}

const fieldClassName =
  'w-full rounded-[5px] border border-black/18 bg-white px-4 py-3 [font-family:var(--font-ntype82)] text-sm text-black outline-none transition placeholder:text-black/32 focus:border-black focus:ring-2 focus:ring-black/10'

const SHIPPING_FEE = 450
const GOVT_TAX_RATE = 0.04
const BANK_ACCOUNT = {
  bank: 'BANK ALFALAH',
  accountName: 'NOTHING PAKISTAN',
  accountNumber: '57065002935977',
  iban: 'PK35ALFH5706005002935977',
  whatsapp: '03361070111',
  whatsappUrl: 'https://wa.me/923361070111',
} as const
const STORE_MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteContactAddress)}`

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
    colorName: product.colorName,
    price: product.price,
    quantity: 1,
  }
}

function mapCartItemToCheckoutItem(item: CartItem): CheckoutItem {
  return {
    handle: item.handle,
    name: item.name,
    image: item.image,
    colorName: item.colorName ?? null,
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
    <section className="mx-auto max-w-2xl rounded-[8px] border border-black bg-white px-6 py-12 text-center sm:px-10">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[5px] bg-black">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 12.5L9.5 17L19 7.5"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <p className="dot-heading mt-6 text-[0.68rem] uppercase tracking-[0.18em] text-black/48">Order confirmed</p>
      <h1 className="collection-product-name mt-3 text-4xl leading-none text-black sm:text-5xl">Order is done</h1>
      <p className="mx-auto mt-4 max-w-lg [font-family:var(--font-ntype82)] text-sm leading-7 text-black/62 sm:text-base">{message}</p>
      {orderNumber ? <p className="mt-4 [font-family:var(--font-lettera-regular)] text-[0.72rem] uppercase tracking-[0.15em] text-black">Order #{orderNumber}</p> : null}

      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-[5px] bg-black px-6 [font-family:var(--font-lettera-regular)] text-[0.68rem] uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-82"
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
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('ship')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false)
  const [submitState, setSubmitState] = useState<SubmitState>(initialSubmitState)

  const canSubmit = useMemo(
    () => {
      if (!name.trim() || !phone.trim()) {
        return false
      }

      if (deliveryType === 'pickup') {
        return true
      }

      return Boolean(address.trim() && city.trim() && district.trim())
    },
    [address, city, deliveryType, district, name, phone],
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
  const pickupWhatsappUrl = useMemo(() => {
    const productNames = checkoutItems.length > 0
      ? checkoutItems
          .map((item) => `${item.name}${item.colorName ? ` (${item.colorName})` : ''}`)
          .join(', ')
      : 'the selected product'
    const message = `Sir, I need to pick up ${productNames} from your location. When can I come?`

    return `${BANK_ACCOUNT.whatsappUrl}?text=${encodeURIComponent(message)}`
  }, [checkoutItems])
  const govtTaxAmount = useMemo(
    () => Number((paymentMethod === 'cod' ? checkoutSubtotal * GOVT_TAX_RATE : 0).toFixed(2)),
    [checkoutSubtotal, paymentMethod],
  )
  const shippingFee = deliveryType === 'pickup' || paymentMethod === 'bank_transfer' ? 0 : SHIPPING_FEE
  const totalPrice = useMemo(
    () => Math.max(0, Number((checkoutSubtotal + govtTaxAmount + shippingFee).toFixed(2))),
    [checkoutSubtotal, govtTaxAmount, shippingFee],
  )
  const paymentNotes =
    deliveryType === 'pickup'
      ? 'Store pickup order: no shipping fee. 4% govt tax applied.'
      : paymentMethod === 'bank_transfer'
      ? `Non COD: Bank transfer customer gets free shipping and 0% tax. We pay the 4% govt tax. Express next-day delivery. After payment send screenshot to ${BANK_ACCOUNT.whatsapp}.`
      : 'COD order: Rs 450 shipping fee and 4% govt tax applied.'

  if (!product && !isCartCheckout) {
    return (
      <section className="mx-auto max-w-2xl rounded-[8px] border border-black bg-white px-6 py-12 text-center sm:px-10">
        <p className="dot-heading text-[0.68rem] uppercase tracking-[0.18em] text-black/48">Order request</p>
        <h1 className="collection-product-name mt-3 text-4xl leading-none text-black sm:text-5xl">Choose a product first</h1>
        <p className="mx-auto mt-4 max-w-lg [font-family:var(--font-ntype82)] text-sm leading-7 text-black/62 sm:text-base">
          The standalone order page is only shown when a product is selected. Browse the catalog, open a product page, and then continue to order.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/collections/nothing-pakistan-shop-all"
            className="inline-flex h-12 items-center justify-center rounded-[5px] bg-black px-6 [font-family:var(--font-lettera-regular)] text-[0.68rem] uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-82"
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
        message: deliveryType === 'pickup' ? 'Please fill in name and phone for pickup.' : 'Please fill in name, address, city, district, and phone. Postal code is optional.',
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
              colorName: item.colorName,
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
          address: deliveryType === 'pickup' ? siteContactAddress : address,
          city: deliveryType === 'pickup' ? 'Lahore' : city,
          district: deliveryType === 'pickup' ? 'Garden Town' : district,
          postalCode,
          phone,
          items: requestItems,
          deliveryType,
          paymentMethod,
          shippingFee,
          govtTaxAmount,
          totalPrice,
          notes: `${paymentNotes} Delivery type: ${deliveryType === 'pickup' ? 'Pickup from Garden Town Lahore' : 'Ship to customer address'}.`,
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

  function handlePickupWhatsApp() {
    if (!canSubmit) {
      setSubmitState({
        status: 'error',
        message: 'Please fill in name and phone for pickup.',
        orderNumber: null,
      })
      return
    }

    setSubmitState(initialSubmitState)
    window.open(pickupWhatsappUrl, '_blank', 'noopener,noreferrer')
  }

  if (submitState.status === 'success') {
    return <OrderSuccessScreen message={submitState.message} orderNumber={submitState.orderNumber} />
  }

  return (
    <div className="relative grid gap-6 [font-family:var(--font-ntype82)]">
      <div className="dot-mesh-background pointer-events-none absolute inset-0 -z-10 opacity-20" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <aside className="order-1 rounded-[8px] border border-black/16 bg-white p-5 sm:p-7 lg:order-2">
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setMobileSummaryOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-4"
              aria-expanded={mobileSummaryOpen}
              aria-controls="order-summary-panel"
            >
              <div>
                <h2 className="collection-product-name text-left text-2xl text-black">Order summary</h2>
                <p className="mt-1 text-left text-sm text-black/48">{itemCount} item{itemCount === 1 ? '' : 's'} in this order</p>
              </div>
              <PlusMinusIcon open={mobileSummaryOpen} />
            </button>
          </div>

          <div id="order-summary-panel" className={`${mobileSummaryOpen ? 'mt-6 block' : 'hidden'} lg:mt-0 lg:block`}>
            <div className="hidden lg:block">
              <p className="dot-heading text-[0.62rem] uppercase tracking-[0.18em] text-black/42">Checkout</p>
              <h2 className="collection-product-name mt-2 text-3xl text-black">Order summary</h2>
            </div>

            {previewImage ? (
              <div className="relative mt-6 overflow-hidden rounded-[5px] border border-black/12 bg-[#efefec] p-4">
                <div className="dot-mesh-background pointer-events-none absolute inset-0 opacity-20" />
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
                        className="rounded-[5px] border border-black/12 bg-[#f5f5f2] p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="product-card-name text-base text-black">{item.name}</h3>
                            {item.colorName ? <p className="mt-2 text-[0.64rem] uppercase tracking-[0.14em] text-black/52">Colour: {item.colorName}</p> : null}
                            <p className="mt-1 text-[0.64rem] uppercase tracking-[0.14em] text-black/52">Qty {item.quantity}</p>
                          </div>
                          <p className="text-sm text-black">{itemTotal !== null ? formatPrice(itemTotal) : 'Pending'}</p>
                        </div>
                        {typeof item.price === 'number' ? <p className="mt-2 text-sm text-black/48">{formatPrice(item.price)} each</p> : null}
                      </div>
                    )
                  })
                : null}
            </div>

            <div className="mt-6 rounded-[5px] border border-black bg-black p-5 text-white">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-white/62">
                  <span>Subtotal</span>
                  <span className="text-white">{checkoutSubtotal > 0 ? formatPrice(checkoutSubtotal) : 'Confirm on call'}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-white/62">
                  <span>Shipping fee</span>
                  <span className="text-white">{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-white/62">
                  <span>Govt Tax</span>
                  <span className="text-white">{formatPrice(govtTaxAmount)}</span>
                </div>
                <div className="border-t border-white/18 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/62">Total</span>
                    <span className="collection-product-name text-2xl text-white">
                      {totalPrice > 0 ? formatPrice(totalPrice) : 'Confirm on call'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <CompanyTrustBadge compact className="mt-5" />
          </div>
        </aside>

        <section className="order-2 rounded-[8px] border border-black/16 bg-white p-6 sm:p-8 lg:order-1">
          <h2 className="dot-heading text-3xl uppercase leading-none tracking-[0.04em] text-black">Order details</h2>
          <p className="mt-3 text-sm leading-7 text-black/62">Choose shipping or pickup, then enter the details needed to confirm your order.</p>

          <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-5">
              <div className="rounded-[8px] border border-slate-200 bg-[#f4f4f2] p-2">
                <div className="grid grid-cols-2 gap-2">
                  {(['ship', 'pickup'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDeliveryType(type)}
                      className={`h-12 rounded-[4px] text-[0.72rem] uppercase tracking-[0.18em] transition ${
                        deliveryType === type ? 'bg-black text-white' : 'bg-white text-black hover:bg-slate-100'
                      }`}
                      aria-pressed={deliveryType === type}
                    >
                      {type === 'ship' ? 'Ship' : 'Pickup'}
                    </button>
                  ))}
                </div>
              </div>

              {deliveryType === 'ship' ? (
                <>
                  <label className="grid gap-2">
                    <span className="text-sm text-black/68">Full name</span>
                    <input
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Your full name"
                      className={fieldClassName}
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm text-black/68">Address</span>
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
                      <span className="text-sm text-black/68">City</span>
                      <input
                        required
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        placeholder="City"
                        className={fieldClassName}
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm text-black/68">District</span>
                      <input
                        required
                        value={district}
                        onChange={(event) => setDistrict(event.target.value)}
                        placeholder="District"
                        className={fieldClassName}
                      />
                    </label>
                  </div>

                  <label className="grid gap-2">
                    <span className="text-sm text-black/68">Postal code <span className="font-normal text-black/38">(optional)</span></span>
                    <input
                      value={postalCode}
                      onChange={(event) => setPostalCode(event.target.value)}
                      placeholder="Postal code"
                      className={fieldClassName}
                    />
                  </label>

                  <div className="grid gap-5">
                    <label className="grid gap-2">
                      <span className="text-sm text-black/68">Phone number</span>
                      <input
                        required
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="+92 300 0000000"
                        className={fieldClassName}
                      />
                    </label>
                  </div>

                  <div className="rounded-[8px] border border-black/14 bg-[#f3f3f0] p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="collection-product-name text-xl text-black">Payment method</h3>
                        <p className="mt-1 text-sm leading-6 text-black/62">COD orders = Rs 450 Shipping fee + 4% Govt Tax. Non COD bank transfer gets free shipping and 0% tax.</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-[5px] border border-black/14 bg-white px-4 py-3 text-sm leading-6 text-black/68">
                      For the safety and accountability of high-value shipments, we operate exclusively on a pre-payment basis. We do not offer a COD option for these high value items, ensuring every delivery is fully documented and secure.
                    </div>

                    <div className="mt-5 grid gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={`rounded-[5px] border p-0 text-left transition ${
                          paymentMethod === 'cod'
                            ? 'border-slate-900 bg-slate-900 text-white shadow-[0_18px_32px_rgba(15,23,42,0.18)]'
                            : 'border-black/14 bg-white text-black hover:border-black/42'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 p-3 sm:p-4">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.16em]">Cash on delivery</p>
                            <p className={`mt-2 text-sm leading-6 ${paymentMethod === 'cod' ? 'text-white/80' : 'text-black/62'}`}>
                              COD orders = Rs 450 Shipping fee + 4% Govt Tax.
                            </p>
                          </div>
                          <span className={`inline-flex h-5 w-5 rounded-full border ${paymentMethod === 'cod' ? 'border-white bg-white' : 'border-slate-300'}`}>
                            {paymentMethod === 'cod' ? <span className="m-auto h-2.5 w-2.5 rounded-full bg-slate-900" /> : null}
                          </span>
                        </div>
                      </button>

                      <div
                        className={`rounded-[5px] border transition ${
                          paymentMethod === 'bank_transfer'
                            ? 'border-black bg-white text-black shadow-[inset_0_0_0_2px_#000]'
                            : 'border-black/14 bg-white text-black'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('bank_transfer')}
                          className="w-full text-left"
                        >
                        <div className="flex items-start justify-between gap-4 p-3 sm:p-4">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.16em]">Bank transfer</p>
                            <p className="mt-2 text-sm leading-6 text-black/62">Non COD: Bank Transfer customers get Free Shipping, 0% Tax. We pay your 4% govt tax. Plus, get Express Next-Day Delivery.</p>
                          </div>
                          <span className={`inline-flex h-5 w-5 rounded-full border ${paymentMethod === 'bank_transfer' ? 'border-black bg-black' : 'border-black/24'}`}>
                            {paymentMethod === 'bank_transfer' ? <span className="m-auto h-2.5 w-2.5 rounded-full bg-white" /> : null}
                          </span>
                        </div>
                        </button>

                        {paymentMethod === 'bank_transfer' ? (
                        <div className="mx-3 mb-3 mt-1 rounded-[5px] border border-black/12 bg-[#f3f3f0] p-3 text-sm leading-6 text-black/68 sm:mx-4 sm:mb-4 sm:p-4">
                          <p className="dot-heading text-[0.68rem] uppercase tracking-[0.14em] text-black">{BANK_ACCOUNT.bank}</p>
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
                        ) : null}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid gap-5">
                  <div className="rounded-[8px] border border-black/12 bg-[#f4f4f2] p-5 sm:p-6">
                  <p className="text-[0.72rem] uppercase tracking-[0.18em] text-black/52">Pickup location</p>
                  <h3 className="mt-3 [font-family:var(--font-georgia)] text-3xl leading-none text-black sm:text-4xl">Garden Town, Lahore</h3>
                  <p className="mt-4 text-sm leading-7 text-black/68">{siteContactAddress}</p>
                  <Link
                    href={STORE_MAP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex h-11 items-center justify-center rounded-[8px] bg-black px-5 text-[10px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85"
                  >
                    Open Map
                  </Link>
                  </div>

                  <label className="grid gap-2">
                    <span className="text-sm text-black/68">Full name</span>
                    <input
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Your full name"
                      className={fieldClassName}
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm text-black/68">Phone number</span>
                    <input
                      required
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+92 300 0000000"
                      className={fieldClassName}
                    />
                  </label>

                  {submitState.status === 'error' ? (
                    <div className="rounded-[5px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{submitState.message}</div>
                  ) : null}

                  <button
                    type="button"
                    onClick={handlePickupWhatsApp}
                    className="inline-flex h-12 w-full items-center justify-center rounded-[5px] bg-black px-6 [font-family:var(--font-lettera-regular)] text-[0.68rem] uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-82 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Confirm store pickup
                  </button>
                </div>
              )}
            </div>

            {deliveryType === 'ship' ? (
              <>
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
                    className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-[5px] bg-black px-6 [font-family:var(--font-lettera-regular)] text-[0.68rem] uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-82 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitState.status === 'submitting' ? 'Placing order...' : 'Place Order'}
                  </button>

                </div>
              </>
            ) : null}
          </form>
        </section>
      </div>
    </div>
  )
}
