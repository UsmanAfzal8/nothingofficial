import { NextRequest, NextResponse } from 'next/server'
import { ORDER_STATUS_ENUM, PAYMENT_STATUS_ENUM, type OrderStatus, type PaymentStatus } from '@/lib/models/supabase-enums'
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
  quantity?: unknown
  unitPrice?: unknown
  currency?: unknown
  paymentMethod?: unknown
  shippingFee?: unknown
  govtTaxAmount?: unknown
  totalPrice?: unknown
}

type NormalizedOrderItem = {
  product_handle: string | null
  product_name: string
  image_url: string | null
  quantity: number
  unit_price: number
  currency: string
  notes: string | null
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

const SHIPPING_FEE = 450
const GOVT_TAX_RATE = 0.04

function toTrimmedString(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function toOptionalString(value: unknown): string | null {
  const normalized = toTrimmedString(value)
  return normalized ? normalized : null
}

function toPositiveInteger(value: unknown, fallback: number): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  const rounded = Math.floor(parsed)
  return rounded > 0 ? rounded : fallback
}

function toNonNegativeNumber(value: unknown, fallback: number): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return parsed >= 0 ? parsed : fallback
}

function normalizePaymentMethod(value: unknown): PaymentMethod {
  return value === 'bank_transfer' ? 'bank_transfer' : 'cod'
}

function normalizeOrderItems(body: CreateOrderPayload): NormalizedOrderItem[] {
  if (Array.isArray(body.items)) {
    const parsedItems = body.items
      .flatMap((entry) => {
        if (!entry || typeof entry !== 'object') {
          return []
        }

        const item = entry as Record<string, unknown>
        const productName = toTrimmedString(item.productName) || 'Catalog Item'

        return [
          {
            product_handle: toOptionalString(item.productHandle),
            product_name: productName,
            image_url: toOptionalString(item.imageUrl),
            quantity: toPositiveInteger(item.quantity, 1),
            unit_price: toNonNegativeNumber(item.unitPrice, 0),
            currency: toTrimmedString(item.currency) || 'PKR',
            notes: toOptionalString(item.notes),
          },
        ]
      })
      .filter((item) => item.product_name)

    if (parsedItems.length > 0) {
      return parsedItems
    }
  }

  return [
    {
      product_handle: toOptionalString(body.productHandle),
      product_name: toTrimmedString(body.productName) || 'General Product Order',
      image_url: toOptionalString(body.imageUrl),
      quantity: toPositiveInteger(body.quantity, 1),
      unit_price: toNonNegativeNumber(body.unitPrice, 0),
      currency: toTrimmedString(body.currency) || 'PKR',
      notes: toOptionalString(body.notes),
    },
  ]
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
    const orderItems = normalizeOrderItems(body)
    const paymentMethod = normalizePaymentMethod(body.paymentMethod)
    const lineTotal = Number(orderItems.reduce((total, item) => total + item.quantity * item.unit_price, 0).toFixed(2))
    const shippingFee = paymentMethod === 'bank_transfer' ? 0 : SHIPPING_FEE
    const govtTaxAmount = paymentMethod === 'cod' ? Number((lineTotal * GOVT_TAX_RATE).toFixed(2)) : 0
    const finalTotal = Number((lineTotal + govtTaxAmount + shippingFee).toFixed(2))
    const paymentNotes =
      paymentMethod === 'bank_transfer'
        ? 'Non COD: Bank transfer customer gets free shipping and 0% tax. We pay the 4% govt tax. Express next-day delivery. User will send online payment screenshot to 03361070111.'
        : 'COD order: Rs 450 shipping fee and 4% govt tax applied.'
    const orderItemsWithNotes = orderItems.map((item) => ({
      ...item,
      notes: item.notes ? `${item.notes} | ${paymentNotes}` : paymentNotes,
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
