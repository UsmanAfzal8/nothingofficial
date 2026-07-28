import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { buildCloudinaryImageUrl } from '@/lib/cloudinary-image-loader'
import type {
  ComparisonCandidate,
  ComparisonFamily,
  ComparisonProduct,
  ProductComparisonData,
} from '@/lib/models/comparison'
import type { ProductDetailSpecGroup } from '@/lib/models/product-detail'
import type { SupabaseSpecGroupItemRow, SupabaseSpecGroupRow } from '@/lib/models/supabase-store'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'

type ComparisonItemRow = {
  item_key: string
  entity_type: 'product' | 'mobile'
  entity_id: number
  comparison_family: ComparisonFamily
  name: string
  handle: string
  summary: string | null
  price: number | string | null
  original_price: number | string | null
  warranty_years: number | null
  sort_priority: number | null
  image_url: string | null
  image_alt: string | null
}

type ComparisonSpecGroupRow = SupabaseSpecGroupRow & {
  spec_group_items: SupabaseSpecGroupItemRow[] | null
}

type ComparisonCoverageRow = {
  related_type: 'product' | 'mobile'
  related_id: number
  spec_group_items: Array<{ id: number }> | null
}

const FAMILY_ORDER: Record<ComparisonFamily, number> = {
  mobile: 0,
  earbuds: 1,
  headphones: 2,
  watch: 3,
  charger: 4,
}

function buildFallbackSpecGroup(
  handle: string,
  title: string,
  sortOrder: number,
  specs: Array<readonly [label: string, value: string]>,
): ProductDetailSpecGroup {
  return {
    id: `comparison-fallback-${handle}-${sortOrder}`,
    title,
    subtitle: null,
    iconKey: null,
    mediaUrl: null,
    mediaAlt: null,
    mediaType: 'image',
    mediaPosition: 'top',
    defaultOpen: false,
    sortOrder,
    specs: specs.map(([label, value], index) => ({
      id: `comparison-fallback-${handle}-${sortOrder}-${index}`,
      section: null,
      label,
      value,
    })),
  }
}

// These two archived watches predate the current spec import. The compact
// fallback uses official Nothing/CMF product and support facts checked on
// 2026-07-28, so watch comparison remains useful without showing warranty
// badges as product photography.
const COMPARISON_FALLBACKS: Record<
  string,
  {
    image: string
    imageAlt: string
    specGroups: ProductDetailSpecGroup[]
  }
> = {
  'nothing-pakistan-cmf-watch-pro': {
    image:
      'https://cdn.shopify.com/s/files/1/0579/8091/1768/files/61WRc9fXhtL._AC_SL1500__1.jpg?v=1714116241',
    imageAlt: 'CMF Watch Pro in Dark Grey',
    specGroups: [
      buildFallbackSpecGroup('cmf-watch-pro', 'Display', 0, [
        ['Type', 'AMOLED'],
        ['Size', '1.96 inches'],
        ['Resolution', '410 × 502'],
        ['Pixel density', '332 PPI'],
        ['Typical brightness', '600 nits'],
      ]),
      buildFallbackSpecGroup('cmf-watch-pro', 'Battery', 1, [
        ['Capacity', '340 mAh'],
        ['Typical battery life', 'Up to 13 days'],
      ]),
      buildFallbackSpecGroup('cmf-watch-pro', 'Sensors & GPS', 2, [
        ['Sensors', 'Accelerometer, heart rate and SpO₂'],
      ]),
      buildFallbackSpecGroup('cmf-watch-pro', 'Connectivity', 3, [
        ['Bluetooth', 'Bluetooth 5.3'],
        ['Calls', 'Bluetooth calling supported'],
        ['Compatibility', 'Android 8.0 or later; iOS 13 or later'],
      ]),
      buildFallbackSpecGroup('cmf-watch-pro', 'Resistance', 4, [
        ['Rating', 'IP68'],
      ]),
    ],
  },
  'nothing-pakistan-cmf-watch-pro-2': {
    image:
      'https://cdn.shopify.com/s/files/1/0579/8091/1768/files/CMF-Watch-Pro-2_Orange_1.png?v=1720092965',
    imageAlt: 'CMF Watch Pro 2 in Orange',
    specGroups: [
      buildFallbackSpecGroup('cmf-watch-pro-2', 'Design', 0, [
        ['Watch body', 'Aluminium alloy with interchangeable bezels'],
        ['Controls', 'Functional crown and gesture controls'],
      ]),
      buildFallbackSpecGroup('cmf-watch-pro-2', 'Display', 1, [
        ['Type', 'AMOLED with auto-brightness'],
        ['Size', '1.32 inches'],
        ['Resolution', '466 × 466'],
        ['Pixel density', '353 PPI'],
        ['Typical brightness', '620 nits'],
      ]),
      buildFallbackSpecGroup('cmf-watch-pro-2', 'Battery', 2, [
        ['Capacity', '305 mAh'],
        ['Typical battery life', 'Up to 11 days'],
      ]),
      buildFallbackSpecGroup('cmf-watch-pro-2', 'Sensors & GPS', 3, [
        ['Sensors', 'Accelerometer, heart rate, SpO₂, optical tracking and ambient light'],
        ['Location', 'Built-in multi-system GPS'],
      ]),
      buildFallbackSpecGroup('cmf-watch-pro-2', 'Connectivity', 4, [
        ['Calls', 'Bluetooth calling with AI noise reduction'],
        ['Compatibility', 'Android 8.0 or later; iOS 12 or later'],
      ]),
      buildFallbackSpecGroup('cmf-watch-pro-2', 'Resistance', 5, [
        ['Rating', 'IP68'],
      ]),
    ],
  },
}

function isBadgeImageUrl(url: string | null | undefined): boolean {
  return /(?:warranty|badge)/i.test(url ?? '')
}

function toNumber(value: number | string | null): number | null {
  if (value == null) return null

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function formatPrice(value: number | null): string | null {
  if (value == null) return null
  return `Rs. ${Math.round(value).toLocaleString('en-PK')}`
}

function buildCandidate(row: ComparisonItemRow): ComparisonCandidate {
  const price = toNumber(row.price)
  const originalPrice = toNumber(row.original_price)
  const fallback = COMPARISON_FALLBACKS[row.handle]
  const image = row.image_url && !isBadgeImageUrl(row.image_url)
    ? buildCloudinaryImageUrl(row.image_url)
    : fallback?.image ?? null

  return {
    key: row.item_key,
    entityType: row.entity_type,
    entityId: row.entity_id,
    family: row.comparison_family,
    handle: row.handle,
    name: row.name,
    summary: row.summary,
    image,
    imageAlt: fallback?.imageAlt || row.image_alt || `${row.name} in Pakistan`,
    price,
    priceLabel: formatPrice(price),
    originalPrice,
    originalPriceLabel: formatPrice(originalPrice),
    warrantyYears: row.warranty_years,
    sortPriority: row.sort_priority,
  }
}

async function readComparisonCandidatesUncached(): Promise<ComparisonCandidate[]> {
  const supabase = getSupabaseAdminClient()
  if (!supabase) return []

  const [
    { data, error },
    { data: coverageData, error: coverageError },
  ] = await Promise.all([
    supabase
      .from('comparison_items')
      .select(
        'item_key, entity_type, entity_id, comparison_family, name, handle, summary, price, original_price, warranty_years, sort_priority, image_url, image_alt',
      )
      .order('comparison_family', { ascending: true })
      .order('sort_priority', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true }),
    supabase
      .from('spec_groups')
      .select('related_type, related_id, spec_group_items(id)')
      .in('related_type', ['product', 'mobile']),
  ])

  if (error) {
    throw error
  }
  if (coverageError) {
    throw coverageError
  }

  const coveredItems = new Set(
    ((coverageData ?? []) as ComparisonCoverageRow[])
      .filter((row) => (row.spec_group_items?.length ?? 0) > 0)
      .map((row) => `${row.related_type}:${row.related_id}`),
  )

  return ((data ?? []) as ComparisonItemRow[])
    .map(buildCandidate)
    .filter(
      (item) =>
        item.image !== null &&
        (coveredItems.has(`${item.entityType}:${item.entityId}`) || Boolean(COMPARISON_FALLBACKS[item.handle])),
    )
    .sort(
      (left, right) =>
        FAMILY_ORDER[left.family] - FAMILY_ORDER[right.family] ||
        (left.sortPriority ?? Number.MAX_SAFE_INTEGER) - (right.sortPriority ?? Number.MAX_SAFE_INTEGER) ||
        left.name.localeCompare(right.name),
    )
}

const readCachedComparisonCandidates = unstable_cache(
  readComparisonCandidatesUncached,
  ['catalog-comparison-items-v1'],
  {
    revalidate: 300,
    tags: ['catalog-comparison'],
  },
)

export const getComparisonCandidates = cache(readCachedComparisonCandidates)

function buildSpecGroups(rows: ComparisonSpecGroupRow[]): Map<string, ProductDetailSpecGroup[]> {
  const groupsByItem = new Map<string, ProductDetailSpecGroup[]>()

  for (const row of rows) {
    const itemKey = `${row.related_type}:${row.related_id}`
    const groups = groupsByItem.get(itemKey) ?? []
    const specs = (row.spec_group_items ?? [])
      .sort((left, right) => left.sort_order - right.sort_order || left.id - right.id)
      .map((item) => ({
        id: `spec-${item.id}`,
        section: item.section,
        label: item.label,
        value: item.value,
      }))

    groups.push({
      id: `spec-group-${row.id}`,
      title: row.title,
      subtitle: row.subtitle,
      iconKey: row.icon_key,
      mediaUrl: row.media_url ? buildCloudinaryImageUrl(row.media_url) : null,
      mediaAlt: row.media_alt,
      mediaType: row.media_type,
      mediaPosition: row.media_position,
      defaultOpen: row.default_open,
      sortOrder: row.sort_order,
      specs,
    })
    groupsByItem.set(itemKey, groups)
  }

  for (const groups of groupsByItem.values()) {
    groups.sort((left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title))
  }

  return groupsByItem
}

async function readComparisonSpecs(
  selected: readonly [ComparisonCandidate, ComparisonCandidate],
): Promise<Map<string, ProductDetailSpecGroup[]>> {
  const supabase = getSupabaseAdminClient()
  if (!supabase) return new Map()

  const filters = selected.map(
    (item) => `and(related_type.eq.${item.entityType},related_id.eq.${item.entityId})`,
  )
  const { data, error } = await supabase
    .from('spec_groups')
    .select(
      'id, related_type, related_id, title, subtitle, icon_key, media_url, media_alt, media_type, media_position, default_open, sort_order, created_at, updated_at, spec_group_items(id, spec_group_id, section, label, value, sort_order, created_at, updated_at)',
    )
    .or(filters.join(','))
    .order('sort_order', { ascending: true })

  if (error) {
    throw error
  }

  return buildSpecGroups((data ?? []) as ComparisonSpecGroupRow[])
}

function selectPair(
  candidates: ComparisonCandidate[],
  requestedFamily?: string,
  requestedLeft?: string,
  requestedRight?: string,
): readonly [ComparisonCandidate, ComparisonCandidate] | null {
  const requestedLeftItem = candidates.find((item) => item.handle === requestedLeft)
  const family =
    requestedLeftItem?.family ??
    (requestedFamily === 'mobile' ||
    requestedFamily === 'earbuds' ||
    requestedFamily === 'headphones' ||
    requestedFamily === 'watch' ||
    requestedFamily === 'charger'
      ? requestedFamily
      : 'mobile')
  const familyItems = candidates.filter((item) => item.family === family)

  if (familyItems.length < 2) return null

  const left = requestedLeftItem?.family === family ? requestedLeftItem : familyItems[0]
  const requestedRightItem = familyItems.find(
    (item) => item.handle === requestedRight && item.key !== left.key,
  )
  const right = requestedRightItem ?? familyItems.find((item) => item.key !== left.key)

  return right ? [left, right] : null
}

export async function getProductComparisonData(
  requestedFamily?: string,
  requestedLeft?: string,
  requestedRight?: string,
): Promise<ProductComparisonData | null> {
  const candidates = await getComparisonCandidates()
  const selected = selectPair(candidates, requestedFamily, requestedLeft, requestedRight)
  if (!selected) return null

  const specsByItem = await readComparisonSpecs(selected)
  const toComparisonProduct = (item: ComparisonCandidate): ComparisonProduct => ({
    ...item,
    specGroups:
      specsByItem.get(`${item.entityType}:${item.entityId}`) ??
      COMPARISON_FALLBACKS[item.handle]?.specGroups ??
      [],
  })

  return {
    candidates,
    left: toComparisonProduct(selected[0]),
    right: toComparisonProduct(selected[1]),
  }
}
