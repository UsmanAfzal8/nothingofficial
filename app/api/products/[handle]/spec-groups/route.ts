import { NextResponse } from 'next/server'
import type { ProductDetailSpecGroup } from '@/lib/models/product-detail'
import type { SupabaseMobileRow, SupabaseProductRow, SupabaseSpecGroupItemRow, SupabaseSpecGroupRow } from '@/lib/models/supabase-store'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import { toSeoHandle } from '@/lib/utils/seo'

const NO_INDEX_HEADERS = {
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
}

type RouteContext = {
  params: {
    handle: string
  }
}

type ProductLookup =
  | {
      relatedType: 'product'
      relatedId: number
    }
  | {
      relatedType: 'mobile'
      relatedId: number
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

async function resolveProductLookup(handle: string): Promise<ProductLookup | null> {
  const supabase = getSupabaseAdminClient()

  if (!supabase) return null

  const [{ data: product, error: productError }, { data: mobile, error: mobileError }] = await Promise.all([
    supabase.from('products').select('id, slug').eq('slug', handle).maybeSingle(),
    supabase.from('mobiles').select('id, slug').eq('slug', handle).maybeSingle(),
  ])

  if (productError || mobileError) {
    return null
  }

  if (product) {
    return {
      relatedType: 'product',
      relatedId: (product as Pick<SupabaseProductRow, 'id'>).id,
    }
  }

  if (mobile) {
    return {
      relatedType: 'mobile',
      relatedId: (mobile as Pick<SupabaseMobileRow, 'id'>).id,
    }
  }

  return null
}

function mapSpecGroups(groups: SupabaseSpecGroupRow[], items: SupabaseSpecGroupItemRow[]): ProductDetailSpecGroup[] {
  const itemsByGroupId = new Map<number, SupabaseSpecGroupItemRow[]>()

  for (const item of items) {
    const groupItems = itemsByGroupId.get(item.spec_group_id) ?? []
    groupItems.push(item)
    itemsByGroupId.set(item.spec_group_id, groupItems)
  }

  return groups.map((group) => ({
    id: `spec-group-${group.id}`,
    title: group.title,
    subtitle: group.subtitle,
    iconKey: group.icon_key,
    mediaUrl: group.media_url,
    mediaAlt: group.media_alt,
    mediaType: group.media_type || 'image',
    mediaPosition: group.media_position || 'top',
    defaultOpen: group.default_open,
    sortOrder: group.sort_order,
    specs: (itemsByGroupId.get(group.id) ?? []).map((item) => ({
      id: `spec-group-item-${item.id}`,
      section: item.section,
      label: item.label,
      value: item.value,
    })),
  }))
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(_request: Request, { params }: RouteContext) {
  const supabase = getSupabaseAdminClient()

  if (!supabase) {
    return jsonNoIndex({ error: 'Supabase is not configured.', specGroups: [] }, { status: 500 })
  }

  const lookup = await resolveProductLookup(toSeoHandle(params.handle))

  if (!lookup) {
    return jsonNoIndex({ error: 'Product not found.', specGroups: [] }, { status: 404 })
  }

  const { data: groups, error: groupsError } = await supabase
    .from('spec_groups')
    .select('id, related_type, related_id, title, subtitle, icon_key, media_url, media_alt, media_type, media_position, default_open, sort_order, created_at, updated_at')
    .eq('related_type', lookup.relatedType)
    .eq('related_id', lookup.relatedId)
    .order('sort_order', { ascending: true })

  if (groupsError) {
    return jsonNoIndex({ error: groupsError.message, specGroups: [] }, { status: 500 })
  }

  const specGroups = (groups ?? []) as SupabaseSpecGroupRow[]
  const groupIds = specGroups.map((group) => group.id)

  if (groupIds.length === 0) {
    return jsonNoIndex({ specGroups: [] })
  }

  const { data: items, error: itemsError } = await supabase
    .from('spec_group_items')
    .select('id, spec_group_id, section, label, value, sort_order, created_at, updated_at')
    .in('spec_group_id', groupIds)
    .order('spec_group_id', { ascending: true })
    .order('sort_order', { ascending: true })

  if (itemsError) {
    return jsonNoIndex({ error: itemsError.message, specGroups: [] }, { status: 500 })
  }

  return jsonNoIndex({ specGroups: mapSpecGroups(specGroups, (items ?? []) as SupabaseSpecGroupItemRow[]) })
}
