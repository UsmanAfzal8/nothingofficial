import { NextRequest, NextResponse } from 'next/server'
import { ORDER_STATUS_ENUM, PAYMENT_STATUS_ENUM, type OrderStatus, type PaymentStatus } from '@/lib/models/supabase-enums'
import { getShippingFee } from '@/lib/data/checkout-pricing'
import { getProductDetailByHandle } from '@/lib/data/catalog-repository'
import { getProductPriceRule } from '@/lib/data/product-pricing'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'

const NO_INDEX_HEADERS = {
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
}

function jsonNoIndex(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...NO_INDEX_HEADERS,
      ...(init?.headers ?? {}),
    },
  })
}

export async function GET() {
  return jsonNoIndex({ error: 'Method not allowed.' }, { status: 405 })
}

type CreateOrderPayload = {
  name?: unknown
  address?: unknown
  city?: unknown
  district?: unknown
  postalCode?: unknown
  phone?: unknown
  notes?: unknown
  items?: unknown
  productHandle?: unknown
  productName?: unknown
  imageUrl?: unknown
  colorName?: unknown
  quantity?: unknown
  unitPrice?: unknown
  currency?: unknown
  paymentMethod?: unknown
  shippingFee?: unknown
  govtTaxAmount?: unknown
  totalPrice?: unknown
  deliveryType?: unknown
}

type NormalizedOrderItem = {
  product_handle: string | null
  product_name: string
  image_url: string | null
  color_name: string | null
  quantity: number
  unit_price: number
  currency: string
  notes: string | null
  include_warranty: boolean
}

type NormalizedOrderUser = {
  name: string
  phone: string
  address: string
  city: string
  district: string
  postalCode: string | null
}

type PaymentMethod = 'cod' | 'bank_transfer'
type DeliveryType = 'ship' | 'pickup'

const GOVT_TAX_RATE = 0.04
const MAX_ORDER_ITEMS = 25
const MAX_QUANTITY_PER_ITEM = 10
const MAX_ORDER_PAYLOAD_BYTES = 64 * 1024

type RequestedOrderItem = {
  productHandle: string
  colorName: string | null
  quantity: number
  notes: string | null
  includeWarranty: boolean
}

function toTrimmedString(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function toOptionalString(value: unknown): string | null {
  const normalized = toTrimmedString(value)
  return normalized ? normalized : null
}

function normalizePaymentMethod(value: unknown): PaymentMethod {
  return value === 'bank_transfer' ? 'bank_transfer' : 'cod'
}

function normalizeDeliveryType(value: unknown): DeliveryType {
  return value === 'pickup' ? 'pickup' : 'ship'
}

function parseRequestedOrderItems(body: CreateOrderPayload): RequestedOrderItem[] | null {
  const entries = Array.isArray(body.items) ? body.items : [body]

  if (entries.length === 0 || entries.length > MAX_ORDER_ITEMS) {
    return null
  }

  const seenItems = new Set<string>()
  const items: RequestedOrderItem[] = []

  for (const entry of entries) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      return null
    }

    const item = entry as Record<string, unknown>
    const productHandle = toTrimmedString(item.productHandle)
    const colorName = toOptionalString(item.colorName)
    const quantity = Number(item.quantity)
    const notes = toOptionalString(item.notes)
    const includeWarranty = item.includeWarranty === true
    const uniqueKey = `${productHandle}:${colorName ?? ''}`

    if (
      !productHandle ||
      productHandle.length > 160 ||
      (colorName?.length ?? 0) > 100 ||
      (notes?.length ?? 0) > 500 ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY_PER_ITEM ||
      seenItems.has(uniqueKey)
    ) {
      return null
    }

    seenItems.add(uniqueKey)
    items.push({ productHandle, colorName, quantity, notes, includeWarranty })
  }

  return items
}

async function resolveAuthoritativeOrderItems(
  requestedItems: RequestedOrderItem[],
): Promise<{ items: NormalizedOrderItem[] } | { error: string }> {
  const products = await Promise.all(
    requestedItems.map((item) => getProductDetailByHandle(item.productHandle)),
  )
  const items: NormalizedOrderItem[] = []

  for (const [index, requestItem] of requestedItems.entries()) {
    const product = products[index]

    if (!product || typeof product.price !== 'number' || product.price <= 0) {
      return { error: 'One or more products are unavailable or need a current price. Refresh the cart and try again.' }
    }

    if (
      product.availability === 'https://schema.org/OutOfStock' ||
      (typeof product.stockQuantity === 'number' && requestItem.quantity > product.stockQuantity)
    ) {
      return { error: `${product.name} does not have enough stock for the requested quantity.` }
    }

    const priceRule = getProductPriceRule(product.handle)
    const includeWarranty = requestItem.includeWarranty && Boolean(priceRule?.warrantyMonths && priceRule.warrantyPrice)

    items.push({
      product_handle: product.handle,
      product_name: product.name,
      image_url: product.primaryImage,
      color_name: requestItem.colorName,
      quantity: requestItem.quantity,
      unit_price: includeWarranty ? priceRule!.warrantyPrice! : product.price,
      currency: 'PKR',
      notes: includeWarranty
        ? `${priceRule!.warrantyMonths}-month warranty selected at ${priceRule!.warrantyPrice} PKR.`
        : requestItem.notes,
      include_warranty: includeWarranty,
    })
  }

  return { items }
}

async function saveOrderUser(
  supabaseAdmin: any,
  user: NormalizedOrderUser,
): Promise<{ userId: number | null; error: string | null }> {
  const userAddress = [user.address, user.district].filter(Boolean).join(', ')
  const userPayload = {
    name: user.name,
    phone: user.phone,
    Address: userAddress,
    'Postal Code': user.postalCode,
    City: user.city,
  }

  const { data: existingUser, error: existingUserError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('phone', user.phone)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (existingUserError) {
    return { userId: null, error: existingUserError.message }
  }

  if (existingUser?.id) {
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(userPayload)
      .eq('id', existingUser.id)
      .select('id')
      .single()

    if (updateError || !updatedUser) {
      return { userId: null, error: updateError?.message ?? 'Failed to update user.' }
    }

    return { userId: updatedUser.id, error: null }
  }

  const { data: insertedUser, error: insertError } = await supabaseAdmin
    .from('users')
    .insert(userPayload)
    .select('id')
    .single()

  if (insertError || !insertedUser) {
    return { userId: null, error: insertError?.message ?? 'Failed to create user.' }
  }

  return { userId: insertedUser.id, error: null }
}

export async function POST(request: NextRequest) {
  try {
    const contentLength = Number(request.headers.get('content-length') ?? 0)
    if (Number.isFinite(contentLength) && contentLength > MAX_ORDER_PAYLOAD_BYTES) {
      return jsonNoIndex({ error: 'Order payload is too large.' }, { status: 413 })
    }

    const supabase = getSupabaseAdminClient()
    if (!supabase) {
      return jsonNoIndex(
        { error: 'Supabase is not configured. Add URL and service role key.' },
        { status: 500 }
      )
    }

    const body = (await request.json()) as CreateOrderPayload

    const name = toTrimmedString(body.name)
    const address = toTrimmedString(body.address)
    const city = toTrimmedString(body.city)
    const district = toTrimmedString(body.district)
    const phone = toTrimmedString(body.phone)
    const postalCode = toOptionalString(body.postalCode)
    const requestedItems = parseRequestedOrderItems(body)
    const paymentMethod = normalizePaymentMethod(body.paymentMethod)
    const deliveryType = normalizeDeliveryType(body.deliveryType)

    if (!requestedItems) {
      return jsonNoIndex({ error: 'The cart is empty or contains an invalid product quantity.' }, { status: 400 })
    }

    const resolvedOrder = await resolveAuthoritativeOrderItems(requestedItems)
    if ('error' in resolvedOrder) {
      return jsonNoIndex({ error: resolvedOrder.error }, { status: 400 })
    }

    const orderItems = resolvedOrder.items
    const lineTotal = Number(orderItems.reduce((total, item) => total + item.quantity * item.unit_price, 0).toFixed(2))
    const shippingFee = getShippingFee({ subtotal: lineTotal, paymentMethod, deliveryType })
    const govtTaxAmount = paymentMethod === 'cod' ? Number((lineTotal * GOVT_TAX_RATE).toFixed(2)) : 0
    const finalTotal = Number((lineTotal + govtTaxAmount + shippingFee).toFixed(2))
    const paymentNotes =
      deliveryType === 'pickup'
        ? 'Store pickup order: no shipping fee. 4% govt tax applied.'
        : paymentMethod === 'bank_transfer'
        ? shippingFee === 0
          ? 'Bank transfer: free shipping on orders of Rs 5,000 or more and 0% government tax.'
          : 'Bank transfer order below Rs 5,000: Rs 400 shipping fee and 0% government tax.'
        : 'COD order: Rs 600 shipping fee and 4% govt tax applied.'
    const orderItemsWithNotes = orderItems.map((item) => ({
      ...item,
      notes: [item.notes, paymentNotes, `Delivery: ${deliveryType === 'pickup' ? 'Store pickup' : 'Ship to customer'}`]
        .filter(Boolean)
        .join(' | '),
    }))

    if (!name || !address || !city || !district || !phone) {
      return jsonNoIndex(
        { error: 'Name, address, city, district and phone are required.' },
        { status: 400 }
      )
    }

    const shippingAddress = [name, address, city, district, postalCode, phone].filter(Boolean).join(', ')
    const paymentStatus: PaymentStatus = PAYMENT_STATUS_ENUM[0]
    const orderStatus: OrderStatus = ORDER_STATUS_ENUM[0]

    const supabaseAdmin = supabase as any
    const { userId, error: userError } = await saveOrderUser(supabaseAdmin, {
      name,
      phone,
      address,
      city,
      district,
      postalCode,
    })

    if (userError || !userId) {
      return jsonNoIndex({ error: userError ?? 'Failed to save user.' }, { status: 400 })
    }

    const { data: orderRow, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        items: orderItemsWithNotes,
        total_price: finalTotal,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        payment_status: paymentStatus,
        order_status: orderStatus,
      })
      .select('id, user_id, payment_status, order_status, created_at')
      .single()

    if (orderError || !orderRow) {
      return jsonNoIndex({ error: orderError?.message ?? 'Failed to create order.' }, { status: 400 })
    }

    return jsonNoIndex(
      {
        order: {
          id: orderRow.id,
          orderNumber: String(orderRow.id),
          userId: orderRow.user_id,
          status: orderRow.order_status,
          createdAt: orderRow.created_at,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error'
    return jsonNoIndex({ error: message }, { status: 500 })
  }
}
