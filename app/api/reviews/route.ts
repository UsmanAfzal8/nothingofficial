import { createHash } from 'node:crypto'
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'

const NO_INDEX_HEADERS = {
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
}

type ReviewPayload = {
  name?: unknown
  orderNumber?: unknown
  productHandle?: unknown
  rating?: unknown
  reviewNote?: unknown
  whatsappNumber?: unknown
}

type OrderItem = {
  product_handle?: unknown
  product_name?: unknown
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

function toTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 10 ? digits.slice(-10) : digits
}

function normalizeProductValue(value: unknown): string {
  return toTrimmedString(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function buildVerifiedReviewMarker(orderId: number, relatedType: 'product' | 'mobile', relatedId: number): string {
  return createHash('sha256').update(`${orderId}:${relatedType}:${relatedId}`).digest('hex')
}

export async function GET() {
  return jsonNoIndex({ error: 'Method not allowed.' }, { status: 405 })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient()

    if (!supabase) {
      return jsonNoIndex({ error: 'Review submission is not configured.' }, { status: 500 })
    }

    const body = (await request.json()) as ReviewPayload
    const name = toTrimmedString(body.name)
    const orderNumber = toTrimmedString(body.orderNumber).replace(/^#/, '')
    const productHandle = normalizeProductValue(body.productHandle)
    const reviewNote = toTrimmedString(body.reviewNote)
    const whatsappNumber = toTrimmedString(body.whatsappNumber)
    const normalizedWhatsapp = normalizePhone(whatsappNumber)
    const rating = Number(body.rating)
    const orderId = Number(orderNumber)

    if (!name || name.length > 100) {
      return jsonNoIndex({ error: 'Enter your name using 100 characters or fewer.' }, { status: 400 })
    }

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return jsonNoIndex({ error: 'Enter a valid order number.' }, { status: 400 })
    }

    if (!productHandle) {
      return jsonNoIndex({ error: 'Product information is missing.' }, { status: 400 })
    }

    if (normalizedWhatsapp.length !== 10) {
      return jsonNoIndex({ error: 'Enter a valid Pakistani WhatsApp number.' }, { status: 400 })
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return jsonNoIndex({ error: 'Choose a rating from 1 to 5 stars.' }, { status: 400 })
    }

    if (reviewNote.length < 10 || reviewNote.length > 1200) {
      return jsonNoIndex({ error: 'Review note must be between 10 and 1,200 characters.' }, { status: 400 })
    }

    const supabaseAdmin = supabase as any
    const [{ data: product }, { data: mobile }, { data: order, error: orderError }] = await Promise.all([
      supabaseAdmin.from('products').select('id,name,slug').eq('slug', productHandle).maybeSingle(),
      supabaseAdmin.from('mobiles').select('id,name,slug').eq('slug', productHandle).maybeSingle(),
      supabaseAdmin.from('orders').select('id,user_id,items,order_status').eq('id', orderId).maybeSingle(),
    ])

    const catalogEntry = product
      ? { id: product.id as number, name: product.name as string, slug: product.slug as string, relatedType: 'product' as const }
      : mobile
        ? { id: mobile.id as number, name: mobile.name as string, slug: mobile.slug as string, relatedType: 'mobile' as const }
        : null

    if (!catalogEntry) {
      return jsonNoIndex({ error: 'This product could not be found.' }, { status: 404 })
    }

    if (orderError || !order?.user_id) {
      return jsonNoIndex({ error: 'Order number and WhatsApp number could not be verified.' }, { status: 400 })
    }

    if (order.order_status === 'cancelled') {
      return jsonNoIndex({ error: 'Cancelled orders cannot be reviewed.' }, { status: 400 })
    }

    const { data: orderUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('phone')
      .eq('id', order.user_id)
      .maybeSingle()

    if (userError || !orderUser?.phone || normalizePhone(String(orderUser.phone)) !== normalizedWhatsapp) {
      return jsonNoIndex({ error: 'Order number and WhatsApp number could not be verified.' }, { status: 400 })
    }

    const orderItems = Array.isArray(order.items) ? (order.items as OrderItem[]) : []
    const catalogName = normalizeProductValue(catalogEntry.name)
    const orderContainsProduct = orderItems.some((item) => {
      const itemHandle = normalizeProductValue(item.product_handle)
      const itemName = normalizeProductValue(item.product_name)
      return itemHandle === catalogEntry.slug || itemName === catalogName
    })

    if (!orderContainsProduct) {
      return jsonNoIndex({ error: 'This product was not found in the supplied order.' }, { status: 400 })
    }

    const verifiedReviewMarker = buildVerifiedReviewMarker(orderId, catalogEntry.relatedType, catalogEntry.id)
    const hiddenMarker = `<!-- verified-order-review:${verifiedReviewMarker} -->`
    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('related_type', catalogEntry.relatedType)
      .eq('related_id', catalogEntry.id)
      .like('comment', `%${hiddenMarker}%`)
      .maybeSingle()

    if (existingReview) {
      return jsonNoIndex({ error: 'This product has already been reviewed for this order.' }, { status: 409 })
    }

    const { error: insertError } = await supabaseAdmin.from('reviews').insert({
      related_type: catalogEntry.relatedType,
      related_id: catalogEntry.id,
      user_name: name,
      rating,
      comment: `${reviewNote}\n${hiddenMarker}`,
    })

    if (insertError) {
      return jsonNoIndex({ error: 'Your review could not be saved. Please try again.' }, { status: 400 })
    }

    revalidateTag('catalog-snapshot')
    revalidatePath(`/products/${catalogEntry.slug}`)

    return jsonNoIndex({ message: 'Thank you. Your review has been added.' }, { status: 201 })
  } catch {
    return jsonNoIndex({ error: 'Your review could not be saved. Please try again.' }, { status: 500 })
  }
}
