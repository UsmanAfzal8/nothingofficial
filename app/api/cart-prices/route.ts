import { NextRequest, NextResponse } from 'next/server'
import { getProductDetailByHandle } from '@/lib/data/catalog-repository'
import { toSeoHandle } from '@/lib/utils/seo'

const NO_INDEX_HEADERS = {
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
}

type CartPriceRequest = {
  handles?: unknown
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

function jsonNoIndex(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...NO_INDEX_HEADERS,
      ...(init?.headers ?? {}),
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CartPriceRequest
    const handles = Array.isArray(payload.handles)
      ? [...new Set(payload.handles.filter((handle): handle is string => typeof handle === 'string').map(toSeoHandle))]
      : []

    if (handles.length === 0) {
      return jsonNoIndex({ items: [] })
    }

    const items = await Promise.all(
      handles.slice(0, 50).map(async (handle) => {
        const detail = await getProductDetailByHandle(handle)

        if (!detail) {
          return null
        }

        return {
          handle: detail.handle,
          name: detail.name,
          image: detail.primaryImage ?? detail.ogImage ?? null,
          price: detail.price ?? null,
          priceLabel: detail.priceLabel ?? null,
          entityType: detail.entityType,
        }
      }),
    )

    return jsonNoIndex({ items: items.filter(Boolean) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error'
    return jsonNoIndex({ error: message, items: [] }, { status: 500 })
  }
}
