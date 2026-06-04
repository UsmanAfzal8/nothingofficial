import type { Collection, HomePageData, NavigationItem, Product } from '@/lib/models/catalog'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import type {
  ProductDetail,
  ProductDetailAggregateRating,
  ProductDetailBreadcrumbItem,
  ProductDetailCollection,
  ProductDetailFaq,
  ProductFeatureSection,
  ProductDetailMedia,
  ProductDetailRelatedItem,
  ProductDetailReview,
  ProductDetailSpec,
  ProductDetailSpecGroup,
  ProductDetailVariant,
  ProductDetailWidget,
} from '@/lib/models/product-detail'
import type {
  StoreImageRelatedType,
  StoreRelatedType,
  SupabaseCategoryRelationRow,
  SupabaseCategoryRow,
  SupabaseColorRow,
  SupabaseFaqRow,
  SupabaseImageRow,
  SupabaseMobileRow,
  SupabaseProductFeatureSectionRow,
  SupabaseProductFeatureSlideRow,
  SupabaseProductMobileRow,
  SupabaseProductRow,
  SupabaseReviewRow,
  SupabaseSpecGroupItemRow,
  SupabaseSpecGroupRow,
} from '@/lib/models/supabase-store'
import { DETAIL_IMAGE_RELATED_TYPE_ENUM, STORE_RELATED_TYPE_ENUM } from '@/lib/models/supabase-enums'
import type { ProductType } from '@/lib/models/supabase-enums'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import { buildAbsoluteUrl, splitSeoKeywords, trimSeoDescription } from '@/lib/utils/seo'
import fallbackMobiles from '@/database/mobile.json'
import fallbackProducts from '@/database/prodcuts.json'

export type SupportHeroImage = {
  url: string | null
  alt: string
}

export type SitemapCollectionEntry = {
  slug: string
  title: string
  description: string | null
  image: string | null
  updatedAt: string | null
  itemCount: number
  depth: number
}

export type SitemapProductEntry = {
  handle: string
  title: string
  description: string | null
  image: string | null
  updatedAt: string | null
  entityType: 'product' | 'mobile'
  productType: ProductType | null
  stockQuantity: number | null
  linkedItemCount: number
  collectionSlugs: string[]
}

export type MobileAccessoryGroup = {
  id: 'covers' | 'protectors' | 'chargers' | 'earbuds' | 'accessories'
  title: string
  products: Product[]
}

type CatalogSnapshot = {
  products: SupabaseProductRow[]
  mobiles: SupabaseMobileRow[]
  categories: SupabaseCategoryRow[]
  categoryRelations: SupabaseCategoryRelationRow[]
  productMobiles: SupabaseProductMobileRow[]
  images: SupabaseImageRow[]
  faqs: SupabaseFaqRow[]
  specGroups: SupabaseSpecGroupRow[]
  specGroupItems: SupabaseSpecGroupItemRow[]
  productFeatureSections: SupabaseProductFeatureSectionRow[]
  productFeatureSlides: SupabaseProductFeatureSlideRow[]
  reviews: SupabaseReviewRow[]
  colorsById: Map<number, SupabaseColorRow>
  productsById: Map<number, SupabaseProductRow>
  productsBySlug: Map<string, SupabaseProductRow>
  categoriesById: Map<number, SupabaseCategoryRow>
  categoriesBySlug: Map<string, SupabaseCategoryRow>
  childCategoriesByParentId: Map<number | null, SupabaseCategoryRow[]>
  mobilesById: Map<number, SupabaseMobileRow>
  mobilesBySlug: Map<string, SupabaseMobileRow>
  productIdsByCategoryId: Map<number, number[]>
  categoryIdsByProductId: Map<number, number[]>
  mobileIdsByCategoryId: Map<number, number[]>
  categoryIdsByMobileId: Map<number, number[]>
  mobileIdsByProductId: Map<number, number[]>
  productIdsByMobileId: Map<number, number[]>
  imagesByEntryKey: Map<string, SupabaseImageRow[]>
  faqsByEntryKey: Map<string, SupabaseFaqRow[]>
  specGroupsByEntryKey: Map<string, SupabaseSpecGroupRow[]>
  specGroupItemsByGroupId: Map<number, SupabaseSpecGroupItemRow[]>
  productFeatureSectionsByEntryKey: Map<string, SupabaseProductFeatureSectionRow[]>
  productFeatureSlidesBySectionId: Map<number, SupabaseProductFeatureSlideRow[]>
  reviewsByEntryKey: Map<string, SupabaseReviewRow[]>
}

type CatalogSnapshotPayload = {
  products: SupabaseProductRow[]
  mobiles: SupabaseMobileRow[]
  categories: SupabaseCategoryRow[]
  categoryRelations: SupabaseCategoryRelationRow[]
  productMobiles: SupabaseProductMobileRow[]
  images: SupabaseImageRow[]
  faqs: SupabaseFaqRow[]
  specGroups: SupabaseSpecGroupRow[]
  specGroupItems: SupabaseSpecGroupItemRow[]
  productFeatureSections: SupabaseProductFeatureSectionRow[]
  productFeatureSlides: SupabaseProductFeatureSlideRow[]
  reviews: SupabaseReviewRow[]
  colors: SupabaseColorRow[]
}

type CatalogSnapshotReadOptions = {
  includeDetailRows?: boolean
}

type ProductDetailReadOptions = {
  includeDetailRows?: boolean
}

type FallbackProductRow = SupabaseProductRow & {
  piority?: number | null
}

type FallbackMobileRow = SupabaseMobileRow & {
  pta_tax?: number | null
  non_pta_price?: number | null
}

type VirtualCollectionConfig = {
  title: string
  metaTitle: string
  description: string
  productTypes?: readonly ProductType[]
}

const PRIMARY_VIRTUAL_COLLECTION_SLUGS = ['shop-all', 'phones'] as const
const ACCESSORY_VIRTUAL_COLLECTION_SLUGS = ['chargers', 'protectors', 'earbuds'] as const
const ALL_VIRTUAL_COLLECTION_SLUGS = [...PRIMARY_VIRTUAL_COLLECTION_SLUGS, ...ACCESSORY_VIRTUAL_COLLECTION_SLUGS] as const
const INDEXABLE_CONTENT_COLLECTION_SLUGS = new Set(['offers'])
const TRENDING_PICK_PRODUCT_SLUGS = [
  'cmf-buds-pro',
  'cmf-power-65w-gan',
  'nothing-usb-c-to-usb-c-cable',
  'cmf-buds-pro-2',
  'nothing-power-45w',
  'cmf-power-100w-gan',
] as const

const FEATURED_COVERS_CATEGORY_SLUG = 'featured-covers'
const FEATURED_COVER_PRODUCT_SLUGS = [
  'nothing-phone-1-black-polo-cover',
  'nothing-phone-2-blue-cover',
  'nothing-phone-1-polo-cover',
  'nothing-phone-1-gray-polo-cover',
  'nothing-phone-2a-green-cover',
  'nothing-phone-2a-black-polo-cover',
  'nothing-phone-3-brown-cover',
  'nothing-phone-3a-pro-transparent-cover',
  'nothing-phone-2-transparent-cover',
  'nothing-phone-2a-plus-transparent-cover',
] as const

type VirtualCollectionSlug = (typeof ALL_VIRTUAL_COLLECTION_SLUGS)[number]

const VIRTUAL_COLLECTIONS: Record<VirtualCollectionSlug, VirtualCollectionConfig> = {
  'shop-all': {
    title: 'Shop all',
    metaTitle: 'Nothing Official Store Pakistan Shop All | Chargers, Accessories and CMF',
    description: 'Browse the full Nothing Official Store Pakistan catalog for chargers, earbuds, protectors, CMF devices, and other compatible accessories.',
  },
  phones: {
    title: 'Phones',
    metaTitle: 'Nothing Phones in Pakistan | Compatible Accessories | Nothing Official Store Pakistan',
    description: 'Browse Nothing phones and jump into compatible chargers, protectors, earbuds, and support routes in Pakistan.',
  },
  chargers: {
    title: 'Chargers',
    metaTitle: 'Nothing Chargers in Pakistan | Nothing Official Store Pakistan',
    description: 'Shop Nothing chargers and charging cables in Pakistan with live product pages, pricing, and ordering support.',
    productTypes: ['charger', 'data_cable'],
  },
  protectors: {
    title: 'Protectors',
    metaTitle: 'Nothing Protectors in Pakistan | Nothing Official Store Pakistan',
    description: 'Browse screen protectors and protective accessories for Nothing devices in Pakistan.',
    productTypes: ['protector', 'screen_protector'],
  },
  earbuds: {
    title: 'Earbuds',
    metaTitle: 'Nothing Earbuds in Pakistan | Nothing Official Store Pakistan',
    description: 'Browse Nothing earbuds and audio accessories in Pakistan with live catalog pages and ordering support.',
    productTypes: ['earbuds'],
  },
} as const

const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  charger: 'Charger',
  data_cable: 'Cable',
  protector: 'Protector',
  earbuds: 'Audio',
  covers: 'Cover',
  screen_protector: 'Screen Protector',
}

const PRODUCT_TYPE_SEARCH_LABELS: Record<ProductType, string[]> = {
  charger: ['Nothing charger price in Pakistan', 'CMF charger Pakistan', 'GaN charger Pakistan'],
  data_cable: ['Nothing cable price in Pakistan', 'USB-C cable Pakistan', 'Nothing data cable Pakistan'],
  protector: ['Nothing screen protector Pakistan', 'Nothing phone protector price in Pakistan'],
  earbuds: ['Nothing earbuds price in Pakistan', 'CMF earbuds Pakistan', 'wireless earbuds Pakistan'],
  covers: ['Nothing phone cover price in Pakistan', 'Nothing phone case Pakistan', 'CMF phone cover Pakistan'],
  screen_protector: ['Nothing screen protector Pakistan', 'Nothing phone glass protector Pakistan'],
}

const ACCESSORY_COLLECTION_PRODUCT_TYPES = new Set<ProductType>(['charger', 'data_cable', 'protector', 'covers', 'screen_protector'])
const ACCESSORY_COLLECTION_CATEGORY_SLUGS = new Set(['chargers', 'cables', 'phone-cases', 'phone-protectors', 'protectors'])
const SUPABASE_PAGE_SIZE = 1000

async function fetchPagedSupabaseRows<T>(
  queryPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<{ data: T[]; error: { message: string } | null }> {
  const rows: T[] = []

  for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
    const to = from + SUPABASE_PAGE_SIZE - 1
    const response = await queryPage(from, to)

    if (response.error) {
      return { data: [], error: response.error }
    }

    const pageRows = response.data ?? []
    rows.push(...pageRows)

    if (pageRows.length < SUPABASE_PAGE_SIZE) {
      break
    }
  }

  return { data: rows, error: null }
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

function sanitizeCatalogCopy(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }

  const sanitized = value
    .replace(/\bPrice:\s*(?:Rs\.?|PKR)\s*[\d,]+(?:\s*\/-)?\.?/gi, '')
    .replace(/\b(?:currently\s+)?listed\s+at\s+(?:Rs\.?|PKR)\s*[\d,]+(?:\s*\/-)?/gi, '')
    .replace(/\bprice\s+in\s+Pakistan\s+is\s+(?:Rs\.?|PKR)\s*[\d,]+(?:\s*\/-)?/gi, 'price in Pakistan')
    .replace(/\bprice\s+is\s+(?:Rs\.?|PKR)\s*[\d,]+(?:\s*\/-)?/gi, 'price')
    .replace(/\b(?:Rs\.?|PKR)\s*[\d,]+(?:\s*\/-)?/gi, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,.;:!?]){2,}/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()

  return sanitized || null
}

function formatCatalogDate(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function getLatestTimestamp(values: Array<string | null | undefined>): string | null {
  let latestTimestamp: string | null = null
  let latestValue = Number.NEGATIVE_INFINITY

  for (const value of values) {
    if (!value) {
      continue
    }

    const parsedValue = new Date(value).getTime()

    if (Number.isNaN(parsedValue) || parsedValue <= latestValue) {
      continue
    }

    latestValue = parsedValue
    latestTimestamp = value
  }

  return latestTimestamp
}

function normalizeProductName(name: string): string {
  return name
    .replace(/\b9D\s+(Protector|Glass)\b/gi, 'Protector')
    .replace(/\b9D\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function resolveBrandName(name: string): string {
  return /^cmf\b/i.test(name.trim()) ? 'CMF by Nothing' : 'Nothing'
}

function buildProductSearchKeywords(name: string, productType: ProductType | null | undefined, extraKeywords: string | null | undefined): string[] {
  const baseKeywords = [
    name,
    `${name} price in Pakistan`,
    `${name} Pakistan`,
    `buy ${name} in Pakistan`,
    `${resolveBrandName(name)} ${name}`,
  ]

  return [
    ...baseKeywords,
    ...(productType ? PRODUCT_TYPE_SEARCH_LABELS[productType] ?? [] : []),
    ...splitSeoKeywords(extraKeywords),
  ]
}

function buildMobileSearchKeywords(name: string, extraKeywords: string | null | undefined): string[] {
  return [
    name,
    `${name} price in Pakistan`,
    `${name} accessories Pakistan`,
    `${name} protector Pakistan`,
    `${name} charger Pakistan`,
    `Nothing ${name} Pakistan`,
    ...splitSeoKeywords(extraKeywords),
  ]
}

function buildProductMetaDescription(product: SupabaseProductRow, name: string): string {
  const productTypeLabel = product.product_type ? PRODUCT_TYPE_LABELS[product.product_type] ?? product.product_type : 'Nothing accessory'
  const fallback = `Shop ${name} in Pakistan from Nothing Official Store Pakistan. Check ${productTypeLabel.toLowerCase()} details, compatibility, availability, delivery, and WhatsApp support.`
  const source = sanitizeCatalogCopy(product.meta_description || product.short_description || product.seo_description_long || product.description)

  return trimSeoDescription(source || fallback)
}

function buildMobileMetaDescription(mobile: SupabaseMobileRow): string {
  const fallback = `${mobile.name} page for Pakistan shoppers. Browse compatible Nothing accessories, chargers, protectors, earbuds, and support links.`
  const source = sanitizeCatalogCopy(mobile.meta_description || mobile.seo_description_long || mobile.description)

  return trimSeoDescription(source || fallback)
}

function resolveAvailability(stockQuantity?: number | null): ProductDetail['availability'] {
  if (typeof stockQuantity !== 'number') {
    return 'https://schema.org/InStock'
  }

  return stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
}

function parseCatalogNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, ''))
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function getSchemaImages(schemaJson: Record<string, unknown> | null | undefined): string[] {
  const image = schemaJson?.image

  if (typeof image === 'string') {
    return [image]
  }

  if (Array.isArray(image)) {
    return image.filter((item): item is string => typeof item === 'string' && item.startsWith('http'))
  }

  return []
}

function buildFallbackGallery(name: string, schemaJson: Record<string, unknown> | null | undefined, altText?: string | null): ProductDetailMedia[] {
  return getSchemaImages(schemaJson).map((url, index) => ({
    id: `fallback-media-${index + 1}`,
    url,
    alt: altText || `${name} original product in Pakistan from Nothing Official Store Pakistan`,
    title: name,
    caption: index === 0 ? 'Product image' : `Product image ${index + 1}`,
    colorName: null,
    colorHex: null,
    slug: null,
  }))
}

function buildFallbackCollections(itemType: 'product' | 'mobile', productType?: ProductType | null): ProductDetailCollection[] {
  if (itemType === 'mobile') {
    return [{ slug: 'phones', title: 'Phones' }]
  }

  if (productType === 'charger' || productType === 'data_cable') {
    return [{ slug: 'chargers', title: 'Chargers' }]
  }

  if (productType === 'earbuds') {
    return [{ slug: 'audio', title: 'Audio' }]
  }

  if (productType === 'covers' || productType === 'protector' || productType === 'screen_protector') {
    return [{ slug: 'accessories', title: 'Accessories' }]
  }

  return [{ slug: 'shop-all', title: 'Shop All' }]
}

function buildFallbackBreadcrumbs(collections: ProductDetailCollection[], itemType: 'product' | 'mobile'): ProductDetailBreadcrumbItem[] {
  const fallbackCollection = itemType === 'mobile'
    ? { slug: 'phones', title: 'Phones' }
    : { slug: 'shop-all', title: 'Shop All' }
  const primaryCollection = collections[0] ?? fallbackCollection

  return [
    { label: 'Home', href: '/' },
    { label: primaryCollection.title, href: `/collections/${primaryCollection.slug}` },
  ]
}

function buildFallbackSpecGroups(specs: ProductDetailSpec[]): ProductDetailSpecGroup[] {
  return specs.length > 0
    ? [
        {
          id: 'fallback-spec-group-overview',
          title: 'Specifications',
          subtitle: null,
          iconKey: null,
          mediaUrl: null,
          mediaAlt: null,
          mediaType: 'image',
          mediaPosition: 'top',
          defaultOpen: true,
          sortOrder: 0,
          specs,
        },
      ]
    : []
}

function buildFallbackProductDetail(product: FallbackProductRow): ProductDetail {
  const name = normalizeProductName(product.name)
  const price = parseCatalogNumber(product.price)
  const priceLabel = formatPrice(price)
  const schemaJson = product.schema_json ?? null
  const gallery = buildFallbackGallery(name, schemaJson, product.image_alt_text)
  const collections = buildFallbackCollections('product', product.product_type)
  const canonicalPath = `/products/${product.slug}`
  const summary = sanitizeCatalogCopy(product.short_description) || sanitizeCatalogCopy(product.description) || buildProductMetaDescription(product, name)
  const specs: ProductDetailSpec[] = [
    product.product_type
      ? {
          id: 'fallback-spec-product-type',
          label: 'Product type',
          value: PRODUCT_TYPE_LABELS[product.product_type] ?? product.product_type,
        }
      : null,
    priceLabel
      ? {
          id: 'fallback-spec-price',
          label: 'Price',
          value: priceLabel,
        }
      : null,
  ].filter((spec): spec is ProductDetailSpec => Boolean(spec))

  return {
    id: `product-${product.id}`,
    entityType: 'product',
    handle: product.slug,
    name,
    brandName: resolveBrandName(name),
    pageTitle: product.meta_title || name,
    summary,
    metaDescription: buildProductMetaDescription(product, name),
    seoKeywords: buildProductSearchKeywords(name, product.product_type, product.seo_keywords),
    schemaJson,
    description: sanitizeCatalogCopy(product.seo_description_long) || sanitizeCatalogCopy(product.description),
    sourceHref: canonicalPath,
    sourceUrl: buildAbsoluteUrl(canonicalPath),
    canonicalUrl: product.canonical_url || buildAbsoluteUrl(canonicalPath),
    ogImage: gallery[0]?.url ?? null,
    primaryImage: gallery[0]?.url ?? null,
    productBackgroundImage: gallery[0] ?? null,
    productBackgroundImages: gallery[0] ? [gallery[0]] : [],
    gallery,
    collectionSlugs: collections.map((collection) => collection.slug),
    collections,
    variantUrls: gallery.map((image) => image.url),
    variants: gallery.map((image, index) => ({
      id: `fallback-variant-${index + 1}`,
      label: image.caption || `Image ${index + 1}`,
      href: canonicalPath,
    })),
    heroImages: gallery.map((image) => image.url),
    widgets: [
      {
        id: 'fallback-widget-1',
        text: product.product_type ? PRODUCT_TYPE_LABELS[product.product_type] ?? product.product_type : 'Live catalog item',
      },
      {
        id: 'fallback-widget-2',
        text: typeof product.stock_quantity === 'number' && product.stock_quantity <= 0 ? 'Out of stock' : 'In stock',
      },
    ],
    price,
    priceLabel,
    stockQuantity: product.stock_quantity,
    availability: resolveAvailability(product.stock_quantity),
    createdAt: product.created_at,
    updatedAt: product.updated_at,
    specs,
    specGroups: buildFallbackSpecGroups(specs),
    productFeatureSections: [],
    faqs: buildFaqs([], name, priceLabel),
    reviews: [],
    relatedMobiles: [],
    breadcrumbItems: buildFallbackBreadcrumbs(collections, 'product'),
    aggregateRating: null,
  }
}

function buildFallbackMobileDetail(mobile: FallbackMobileRow): ProductDetail {
  const price = parseCatalogNumber(mobile.Price)
  const priceLabel = formatPrice(price)
  const schemaJson = mobile.schema_json ?? null
  const gallery = buildFallbackGallery(mobile.name, schemaJson, mobile.image_alt_text)
  const collections = buildFallbackCollections('mobile')
  const canonicalPath = `/products/${mobile.slug}`
  const specs: ProductDetailSpec[] = [
    mobile.release_date
      ? {
          id: 'fallback-spec-release-date',
          label: 'Release date',
          value: formatCatalogDate(mobile.release_date) ?? mobile.release_date,
        }
      : null,
    priceLabel
      ? {
          id: 'fallback-spec-price',
          label: 'Price',
          value: priceLabel,
        }
      : null,
  ].filter((spec): spec is ProductDetailSpec => Boolean(spec))

  return {
    id: `mobile-${mobile.id}`,
    entityType: 'mobile',
    handle: mobile.slug,
    name: mobile.name,
    brandName: resolveBrandName(mobile.name),
    pageTitle: mobile.meta_title || mobile.name,
    summary: sanitizeCatalogCopy(mobile.description) || buildMobileMetaDescription(mobile),
    metaDescription: buildMobileMetaDescription(mobile),
    seoKeywords: buildMobileSearchKeywords(mobile.name, mobile.seo_keywords),
    schemaJson,
    description: sanitizeCatalogCopy(mobile.seo_description_long) || sanitizeCatalogCopy(mobile.description),
    sourceHref: canonicalPath,
    sourceUrl: buildAbsoluteUrl(canonicalPath),
    canonicalUrl: mobile.canonical_url || buildAbsoluteUrl(canonicalPath),
    ogImage: gallery[0]?.url ?? null,
    primaryImage: gallery[0]?.url ?? null,
    productBackgroundImage: gallery[0] ?? null,
    productBackgroundImages: gallery[0] ? [gallery[0]] : [],
    gallery,
    collectionSlugs: collections.map((collection) => collection.slug),
    collections,
    variantUrls: gallery.map((image) => image.url),
    variants: gallery.map((image, index) => ({
      id: `fallback-variant-${index + 1}`,
      label: image.caption || `Image ${index + 1}`,
      href: canonicalPath,
    })),
    heroImages: gallery.map((image) => image.url),
    widgets: [
      {
        id: 'fallback-widget-1',
        text: 'Phone',
      },
      {
        id: 'fallback-widget-2',
        text: 'Live catalog item',
      },
    ],
    price,
    priceLabel,
    stockQuantity: null,
    availability: resolveAvailability(),
    createdAt: mobile.created_at,
    updatedAt: mobile.updated_at,
    specs,
    specGroups: buildFallbackSpecGroups(specs),
    productFeatureSections: [],
    faqs: buildFaqs([], mobile.name, priceLabel),
    reviews: [],
    relatedMobiles: [],
    breadcrumbItems: buildFallbackBreadcrumbs(collections, 'mobile'),
    aggregateRating: null,
  }
}

function buildFallbackProductDetailByHandle(handle: string): ProductDetail | null {
  const fallbackProduct = (fallbackProducts as unknown as FallbackProductRow[]).find((product) => product.slug === handle)
  if (fallbackProduct) {
    return buildFallbackProductDetail(fallbackProduct)
  }

  const fallbackMobile = (fallbackMobiles as unknown as FallbackMobileRow[]).find((mobile) => mobile.slug === handle)
  if (fallbackMobile) {
    return buildFallbackMobileDetail(fallbackMobile)
  }

  return null
}

function getFallbackProductHandles(): string[] {
  return [
    ...(fallbackProducts as unknown as FallbackProductRow[]).map((product) => product.slug),
    ...(fallbackMobiles as unknown as FallbackMobileRow[]).map((mobile) => mobile.slug),
  ].filter((slug): slug is string => Boolean(slug))
}

function buildEntryKey(type: StoreImageRelatedType, id: number): string {
  return `${type}:${id}`
}

function groupByEntry<T extends { related_type: StoreImageRelatedType; related_id: number }>(rows: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>()

  for (const row of rows) {
    const key = buildEntryKey(row.related_type, row.related_id)
    const existing = grouped.get(key)

    if (existing) {
      existing.push(row)
    } else {
      grouped.set(key, [row])
    }
  }

  return grouped
}

function uniqueById<T extends { id: number }>(rows: T[]): T[] {
  const seen = new Set<number>()
  const values: T[] = []

  for (const row of rows) {
    if (seen.has(row.id)) continue
    seen.add(row.id)
    values.push(row)
  }

  return values
}

function getSortPriorityValue(item: Product): number {
  return typeof item.sortPriority === 'number' ? item.sortPriority : Number.POSITIVE_INFINITY
}

function sortCatalogCards(items: Product[]): Product[] {
  return items.slice().sort((left, right) => {
    const leftKind = left.kind === 'mobile' ? 0 : 1
    const rightKind = right.kind === 'mobile' ? 0 : 1

    if (leftKind !== rightKind) {
      return leftKind - rightKind
    }

    const leftPriority = getSortPriorityValue(left)
    const rightPriority = getSortPriorityValue(right)

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority
    }

    return left.name.localeCompare(right.name)
  })
}

function sortHomeShowcaseCards(items: Product[]): Product[] {
  return items.slice().sort((left, right) => {
    const leftKind = left.kind === 'mobile' ? 0 : 1
    const rightKind = right.kind === 'mobile' ? 0 : 1

    if (leftKind !== rightKind) {
      return leftKind - rightKind
    }

    const leftPriority = getSortPriorityValue(left)
    const rightPriority = getSortPriorityValue(right)

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority
    }

    const leftPrice = typeof left.price === 'number' ? left.price : -1
    const rightPrice = typeof right.price === 'number' ? right.price : -1

    if (leftPrice !== rightPrice) {
      return rightPrice - leftPrice
    }

    return left.name.localeCompare(right.name)
  })
}

async function readCatalogSnapshotFromSupabase(options: CatalogSnapshotReadOptions = {}): Promise<CatalogSnapshotPayload> {
  const supabase = getSupabaseAdminClient()
  const includeDetailRows = options.includeDetailRows ?? true

  if (!supabase) {
    return {
      products: [],
      mobiles: [],
      categories: [],
      categoryRelations: [],
      productMobiles: [],
      images: [],
      faqs: [],
      specGroups: [],
      specGroupItems: [],
      productFeatureSections: [],
      productFeatureSlides: [],
      reviews: [],
      colors: [],
    }
  }

  const specGroupsPromise = supabase
    .from('spec_groups')
    .select(
      'id, related_type, related_id, title, subtitle, icon_key, media_url, media_alt, media_type, media_position, default_open, sort_order, created_at, updated_at',
    )
    .in('related_type', [...STORE_RELATED_TYPE_ENUM])
    .order('sort_order', { ascending: true })
    .then((response) => {
      if (response.error) {
        console.warn('[catalog-repository] spec_groups unavailable:', response.error.message)
        return { data: [] as SupabaseSpecGroupRow[], error: null }
      }

      return {
        data: (response.data ?? []) as SupabaseSpecGroupRow[],
        error: null,
      }
    })

  const specGroupItemsPromise = includeDetailRows
    ? fetchPagedSupabaseRows<SupabaseSpecGroupItemRow>((from, to) =>
        supabase
          .from('spec_group_items')
          .select('id, spec_group_id, section, label, value, sort_order, created_at, updated_at')
          .order('spec_group_id', { ascending: true })
          .order('sort_order', { ascending: true })
          .range(from, to),
      )
        .then((response) => {
          if (response.error) {
            console.warn('[catalog-repository] spec_group_items unavailable:', response.error.message)
            return { data: [] as SupabaseSpecGroupItemRow[], error: null }
          }

          return {
            data: (response.data ?? []) as SupabaseSpecGroupItemRow[],
            error: null,
          }
        })
    : Promise.resolve({ data: [] as SupabaseSpecGroupItemRow[], error: null })

  const productFeatureSectionsPromise = supabase
    .from('product_feature_sections')
    .select(
      'id, related_type, related_id, source_key, feature_key, feature_title, feature_version, title, display_context, cover_image_url, cover_video_playback_id, cover_video_url, cover_thumbnail_url, sort_order, active, created_at, updated_at',
    )
    .in('related_type', [...STORE_RELATED_TYPE_ENUM])
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .then((response) => {
      if (response.error) {
        console.warn('[catalog-repository] product_feature_sections unavailable:', response.error.message)
        return { data: [] as SupabaseProductFeatureSectionRow[], error: null }
      }

      return {
        data: (response.data ?? []) as SupabaseProductFeatureSectionRow[],
        error: null,
      }
    })

  const productFeatureSlidesPromise = includeDetailRows
    ? supabase
        .from('product_feature_slides')
        .select(
          'id, product_feature_section_id, source_key, title, body, media_type, image_url, video_playback_id, video_url, thumbnail_url, sort_order, active, created_at, updated_at',
        )
        .eq('active', true)
        .order('sort_order', { ascending: true })
        .then((response) => {
          if (response.error) {
            console.warn('[catalog-repository] product_feature_slides unavailable:', response.error.message)
            return { data: [] as SupabaseProductFeatureSlideRow[], error: null }
          }

          return {
            data: (response.data ?? []) as SupabaseProductFeatureSlideRow[],
            error: null,
          }
        })
    : Promise.resolve({ data: [] as SupabaseProductFeatureSlideRow[], error: null })

  const categorySeoFieldsPromise = supabase
    .from('categories')
    .select('id, seo_keywords, canonical_url, schema_json, seo_description_long')
    .then((response) => {
      if (response.error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[catalog-repository] optional category SEO fields unavailable:', response.error.message)
        }

        return { data: [] as Array<Pick<SupabaseCategoryRow, 'id' | 'seo_keywords' | 'canonical_url' | 'schema_json' | 'seo_description_long'>>, error: null }
      }

      return {
        data: (response.data ?? []) as Array<Pick<SupabaseCategoryRow, 'id' | 'seo_keywords' | 'canonical_url' | 'schema_json' | 'seo_description_long'>>,
        error: null,
      }
    })

  const [
    productsResponse,
    mobilesResponse,
    categoriesResponse,
    categoryRelationsResponse,
    categorySeoFieldsResponse,
    imagesResponse,
    faqsResponse,
    specGroupsResponse,
    specGroupItemsResponse,
    productFeatureSectionsResponse,
    productFeatureSlidesResponse,
    reviewsResponse,
    colorsResponse,
    productMobilesResponse,
  ] = await Promise.all([
    supabase
      .from('products')
      .select(
        'id, name, slug, description, short_description, meta_title, meta_description, seo_keywords, canonical_url, schema_json, seo_description_long, image_alt_text, price, stock_quantity, main_color_id, created_at, updated_at, product_type',
      )
      .order('name', { ascending: true }),
    supabase
      .from('mobiles')
      .select('id, name, slug, description, meta_title, meta_description, seo_keywords, canonical_url, schema_json, seo_description_long, image_alt_text, piority, release_date, created_at, updated_at, Price')
      .order('piority', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true }),
    supabase
      .from('categories')
      .select('id, name, slug, meta_title, meta_description, parent_id, created_at, updated_at')
      .order('id', { ascending: true }),
    supabase
      .from('category_relations')
      .select('id, category_id, related_type, related_id, created_at, updated_at')
      .in('related_type', [...STORE_RELATED_TYPE_ENUM])
      .order('id', { ascending: true }),
    categorySeoFieldsPromise,
    supabase
      .from('images')
      .select('id, related_type, related_id, color_id, url, alt_text, title, caption, file_name, slug, sort_order, created_at, updated_at')
      .in('related_type', [...STORE_RELATED_TYPE_ENUM, ...DETAIL_IMAGE_RELATED_TYPE_ENUM])
      .order('sort_order', { ascending: true }),
    fetchPagedSupabaseRows<SupabaseFaqRow>((from, to) =>
      supabase
        .from('faqs')
        .select('id, related_type, related_id, question, answer, created_at, updated_at')
        .in('related_type', [...STORE_RELATED_TYPE_ENUM])
        .order('id', { ascending: true })
        .range(from, to),
    ),
    specGroupsPromise,
    specGroupItemsPromise,
    productFeatureSectionsPromise,
    productFeatureSlidesPromise,
    supabase
      .from('reviews')
      .select('id, related_type, related_id, user_name, rating, comment, created_at, updated_at')
      .in('related_type', [...STORE_RELATED_TYPE_ENUM])
      .order('created_at', { ascending: false }),
    supabase.from('colors').select('id, name, hex_code, created_at, updated_at'),
    supabase.from('product_mobiles').select('id, product_id, mobile_id, created_at'),
  ])

  const responses = [
    productsResponse,
    mobilesResponse,
    categoriesResponse,
    categoryRelationsResponse,
    imagesResponse,
    faqsResponse,
    specGroupsResponse,
    specGroupItemsResponse,
    productFeatureSectionsResponse,
    productFeatureSlidesResponse,
    reviewsResponse,
    colorsResponse,
    productMobilesResponse,
  ]

  const responseNames = [
    'products',
    'mobiles',
    'categories',
    'category_relations',
    'images',
    'faqs',
    'spec_groups',
    'spec_group_items',
    'product_feature_sections',
    'product_feature_slides',
    'reviews',
    'colors',
    'product_mobiles',
  ] as const

  responses.forEach((response, index) => {
    if (response.error) {
      console.error(`[catalog-repository] ${responseNames[index]} unavailable:`, response.error.message)
    }
  })

  const products = (productsResponse.error ? [] : productsResponse.data ?? []) as SupabaseProductRow[]
  const mobiles = (mobilesResponse.error ? [] : mobilesResponse.data ?? []) as SupabaseMobileRow[]
  const categorySeoFieldsById = new Map((categorySeoFieldsResponse.data ?? []).map((row) => [row.id, row]))
  const categories = ((categoriesResponse.error ? [] : categoriesResponse.data ?? []) as SupabaseCategoryRow[]).map((category) => ({
    ...category,
    ...categorySeoFieldsById.get(category.id),
  }))
  const categoryRelations = (categoryRelationsResponse.error ? [] : categoryRelationsResponse.data ?? []) as SupabaseCategoryRelationRow[]
  const images = (imagesResponse.error ? [] : imagesResponse.data ?? []) as SupabaseImageRow[]
  const faqs = (faqsResponse.error ? [] : faqsResponse.data ?? []) as SupabaseFaqRow[]
  const specGroups = (specGroupsResponse.error ? [] : specGroupsResponse.data ?? []) as SupabaseSpecGroupRow[]
  const specGroupItems = (specGroupItemsResponse.error ? [] : specGroupItemsResponse.data ?? []) as SupabaseSpecGroupItemRow[]
  const productFeatureSections = (productFeatureSectionsResponse.error ? [] : productFeatureSectionsResponse.data ?? []) as SupabaseProductFeatureSectionRow[]
  const productFeatureSlides = (productFeatureSlidesResponse.error ? [] : productFeatureSlidesResponse.data ?? []) as SupabaseProductFeatureSlideRow[]
  const reviews = (reviewsResponse.error ? [] : reviewsResponse.data ?? []) as SupabaseReviewRow[]
  const colors = (colorsResponse.error ? [] : colorsResponse.data ?? []) as SupabaseColorRow[]
  const productMobiles = (productMobilesResponse.error ? [] : productMobilesResponse.data ?? []) as SupabaseProductMobileRow[]

  return {
    products,
    mobiles,
    categories,
    categoryRelations,
    productMobiles,
    images,
    faqs,
    specGroups,
    specGroupItems,
    productFeatureSections,
    productFeatureSlides,
    reviews,
    colors,
  }
}

function buildCatalogSnapshot(payload: CatalogSnapshotPayload): CatalogSnapshot {
  const {
    products,
    mobiles,
    categories,
    categoryRelations,
    productMobiles,
    images,
    faqs,
    specGroups,
    specGroupItems,
    productFeatureSections,
    productFeatureSlides,
    reviews,
    colors,
  } = payload
  const colorsById = new Map(colors.map((row) => [row.id, row]))
  const productsById = new Map(products.map((row) => [row.id, row]))
  const productsBySlug = new Map(products.map((row) => [row.slug, row]))
  const categoriesById = new Map(categories.map((row) => [row.id, row]))
  const categoriesBySlug = new Map(categories.map((row) => [row.slug, row]))
  const childCategoriesByParentId = new Map<number | null, SupabaseCategoryRow[]>()
  const mobilesById = new Map(mobiles.map((row) => [row.id, row]))
  const mobilesBySlug = new Map(mobiles.map((row) => [row.slug, row]))
  const productIdsByCategoryId = new Map<number, number[]>()
  const categoryIdsByProductId = new Map<number, number[]>()
  const mobileIdsByCategoryId = new Map<number, number[]>()
  const categoryIdsByMobileId = new Map<number, number[]>()
  const mobileIdsByProductId = new Map<number, number[]>()
  const productIdsByMobileId = new Map<number, number[]>()
  const specGroupItemsByGroupId = new Map<number, SupabaseSpecGroupItemRow[]>()
  const productFeatureSlidesBySectionId = new Map<number, SupabaseProductFeatureSlideRow[]>()
  const reviewRowsWithEntry = reviews.filter(
    (review): review is SupabaseReviewRow & { related_type: StoreRelatedType; related_id: number } =>
      (review.related_type === 'product' || review.related_type === 'mobile') && typeof review.related_id === 'number',
  )

  for (const category of categories) {
    const siblings = childCategoriesByParentId.get(category.parent_id ?? null) ?? []
    siblings.push(category)
    childCategoriesByParentId.set(category.parent_id ?? null, siblings)
  }

  for (const relation of categoryRelations) {
    if (relation.related_type === 'product') {
      const productIds = productIdsByCategoryId.get(relation.category_id) ?? []
      productIds.push(relation.related_id)
      productIdsByCategoryId.set(relation.category_id, productIds)

      const categoryIds = categoryIdsByProductId.get(relation.related_id) ?? []
      categoryIds.push(relation.category_id)
      categoryIdsByProductId.set(relation.related_id, categoryIds)
    }

    if (relation.related_type === 'mobile') {
      const mobileIds = mobileIdsByCategoryId.get(relation.category_id) ?? []
      mobileIds.push(relation.related_id)
      mobileIdsByCategoryId.set(relation.category_id, mobileIds)

      const categoryIds = categoryIdsByMobileId.get(relation.related_id) ?? []
      categoryIds.push(relation.category_id)
      categoryIdsByMobileId.set(relation.related_id, categoryIds)
    }
  }

  for (const relation of productMobiles) {
    if (!relation.product_id || !relation.mobile_id) continue
    const mobileIds = mobileIdsByProductId.get(relation.product_id) ?? []
    mobileIds.push(relation.mobile_id)
    mobileIdsByProductId.set(relation.product_id, mobileIds)

    const productIds = productIdsByMobileId.get(relation.mobile_id) ?? []
    productIds.push(relation.product_id)
    productIdsByMobileId.set(relation.mobile_id, productIds)
  }

  for (const item of specGroupItems) {
    const groupItems = specGroupItemsByGroupId.get(item.spec_group_id) ?? []
    groupItems.push(item)
    specGroupItemsByGroupId.set(item.spec_group_id, groupItems)
  }

  for (const slide of productFeatureSlides) {
    const sectionSlides = productFeatureSlidesBySectionId.get(slide.product_feature_section_id) ?? []
    sectionSlides.push(slide)
    productFeatureSlidesBySectionId.set(slide.product_feature_section_id, sectionSlides)
  }

  return {
    products,
    mobiles,
    categories,
    categoryRelations,
    productMobiles,
    images,
    faqs,
    specGroups,
    specGroupItems,
    productFeatureSections,
    productFeatureSlides,
    reviews,
    colorsById,
    productsById,
    productsBySlug,
    categoriesById,
    categoriesBySlug,
    childCategoriesByParentId,
    mobilesById,
    mobilesBySlug,
    productIdsByCategoryId,
    categoryIdsByProductId,
    mobileIdsByCategoryId,
    categoryIdsByMobileId,
    mobileIdsByProductId,
    productIdsByMobileId,
    imagesByEntryKey: groupByEntry(images as Array<SupabaseImageRow & { related_type: StoreImageRelatedType }>),
    faqsByEntryKey: groupByEntry(faqs as Array<SupabaseFaqRow & { related_type: StoreRelatedType }>),
    specGroupsByEntryKey: groupByEntry(specGroups as Array<SupabaseSpecGroupRow & { related_type: StoreRelatedType }>),
    specGroupItemsByGroupId,
    productFeatureSectionsByEntryKey: groupByEntry(productFeatureSections as Array<SupabaseProductFeatureSectionRow & { related_type: StoreRelatedType }>),
    productFeatureSlidesBySectionId,
    reviewsByEntryKey: groupByEntry(reviewRowsWithEntry),
  }
}

export const CATALOG_REVALIDATE_SECONDS = 300

async function readFullCatalogSnapshotFromSupabase() {
  return readCatalogSnapshotFromSupabase({ includeDetailRows: true })
}

async function readLiteCatalogSnapshotFromSupabase() {
  return readCatalogSnapshotFromSupabase({ includeDetailRows: false })
}

const readCachedCatalogSnapshotPayload = unstable_cache(readFullCatalogSnapshotFromSupabase, ['catalog-snapshot-v4'], {
  revalidate: CATALOG_REVALIDATE_SECONDS,
})

const readCachedLiteCatalogSnapshotPayload = unstable_cache(readLiteCatalogSnapshotFromSupabase, ['catalog-snapshot-lite-v5'], {
  revalidate: CATALOG_REVALIDATE_SECONDS,
})

const readCatalogSnapshotForRequest = cache(readCachedCatalogSnapshotPayload)
const readLiteCatalogSnapshotForRequest = cache(readCachedLiteCatalogSnapshotPayload)

async function getCatalogSnapshot(options: CatalogSnapshotReadOptions = {}): Promise<CatalogSnapshot> {
  const includeDetailRows = options.includeDetailRows ?? true
  const payload = includeDetailRows ? await readCatalogSnapshotForRequest() : await readLiteCatalogSnapshotForRequest()

  return buildCatalogSnapshot(payload)
}

function getTopLevelCategories(snapshot: CatalogSnapshot): SupabaseCategoryRow[] {
  return snapshot.childCategoriesByParentId.get(null) ?? []
}

function getChildCategories(snapshot: CatalogSnapshot, parentId: number): SupabaseCategoryRow[] {
  return snapshot.childCategoriesByParentId.get(parentId) ?? []
}

function getDescendantCategoryIds(snapshot: CatalogSnapshot, categoryId: number): number[] {
  const children = getChildCategories(snapshot, categoryId)

  return children.flatMap((child) => [child.id, ...getDescendantCategoryIds(snapshot, child.id)])
}

function getCategoryTreeIds(snapshot: CatalogSnapshot, categoryId: number): number[] {
  return [categoryId, ...getDescendantCategoryIds(snapshot, categoryId)]
}

function getCategoryDepth(snapshot: CatalogSnapshot, category: SupabaseCategoryRow): number {
  let depth = 0
  let currentParentId = category.parent_id

  while (currentParentId) {
    depth += 1
    currentParentId = snapshot.categoriesById.get(currentParentId)?.parent_id ?? null
  }

  return depth
}

function getCatalogCardsForCategoryIds(snapshot: CatalogSnapshot, categoryIds: number[]): Product[] {
  const productIds = [...new Set(categoryIds.flatMap((categoryId) => snapshot.productIdsByCategoryId.get(categoryId) ?? []))]
  const mobileIds = [...new Set(categoryIds.flatMap((categoryId) => snapshot.mobileIdsByCategoryId.get(categoryId) ?? []))]
  const productCards = productIds
    .map((productId) => snapshot.productsById.get(productId))
    .filter((product): product is SupabaseProductRow => Boolean(product))
    .map((product) => buildProductCard(product, snapshot))
  const mobileCards = mobileIds
    .map((mobileId) => snapshot.mobilesById.get(mobileId))
    .filter((mobile): mobile is SupabaseMobileRow => Boolean(mobile))
    .map((mobile) => buildMobileCard(mobile, snapshot))

  return sortCatalogCards([...productCards, ...mobileCards])
}

function getCatalogCardsForProductSlugs(snapshot: CatalogSnapshot, slugs: readonly string[]): Product[] {
  return slugs
    .map((slug) => snapshot.productsBySlug.get(slug))
    .filter((product): product is SupabaseProductRow => Boolean(product))
    .map((product) => buildProductCard(product, snapshot))
}

function getOrderedCategoryProductCards(snapshot: CatalogSnapshot, slug: string, fallbackSlugs: readonly string[]): Product[] {
  const category = snapshot.categoriesBySlug.get(slug)

  if (!category) {
    return getCatalogCardsForProductSlugs(snapshot, fallbackSlugs)
  }

  const productIds = snapshot.productIdsByCategoryId.get(category.id) ?? []
  const products = productIds
    .map((productId) => snapshot.productsById.get(productId))
    .filter((product): product is SupabaseProductRow => Boolean(product))
    .map((product) => buildProductCard(product, snapshot))

  if (products.length > 0) {
    return products
  }

  return getCatalogCardsForProductSlugs(snapshot, fallbackSlugs)
}

function getCategoryRelationTimestamps(
  snapshot: CatalogSnapshot,
  relatedType: 'product' | 'mobile',
  relatedId: number,
): Array<string | null> {
  return snapshot.categoryRelations
    .filter((relation) => relation.related_type === relatedType && relation.related_id === relatedId)
    .map((relation) => relation.updated_at || relation.created_at)
}

function buildNavigationItem(category: SupabaseCategoryRow, snapshot: CatalogSnapshot): NavigationItem {
  return {
    label: category.name,
    href: `/collections/${category.slug}`,
    slug: category.slug,
    description: category.meta_description,
    parentSlug: category.parent_id ? snapshot.categoriesById.get(category.parent_id)?.slug ?? null : null,
    children: getChildCategories(snapshot, category.id).map((child) => buildNavigationItem(child, snapshot)),
  }
}

function buildVirtualNavigationItem(
  slug: string,
  title: string,
  description: string,
  parentSlug: string | null = null,
): NavigationItem {
  return {
    label: title,
    href: `/collections/${slug}`,
    slug,
    description,
    parentSlug,
    children: [],
  }
}

function isVirtualCollectionSlug(slug: string): slug is VirtualCollectionSlug {
  return ALL_VIRTUAL_COLLECTION_SLUGS.includes(slug as VirtualCollectionSlug)
}

function getVirtualCollectionDepth(slug: VirtualCollectionSlug): number {
  return slug === 'shop-all' || slug === 'phones' ? 0 : 1
}

function getProductImages(snapshot: CatalogSnapshot, productId: number): SupabaseImageRow[] {
  return snapshot.imagesByEntryKey.get(buildEntryKey('product', productId)) ?? []
}

function getMobileImages(snapshot: CatalogSnapshot, mobileId: number): SupabaseImageRow[] {
  return snapshot.imagesByEntryKey.get(buildEntryKey('mobile', mobileId)) ?? []
}

function getProductDetailImages(snapshot: CatalogSnapshot, productId: number): SupabaseImageRow[] {
  return snapshot.imagesByEntryKey.get(buildEntryKey('detail_product', productId)) ?? []
}

function getMobileDetailImages(snapshot: CatalogSnapshot, mobileId: number): SupabaseImageRow[] {
  return snapshot.imagesByEntryKey.get(buildEntryKey('detail_mobile', mobileId)) ?? []
}

function isOfficialProductBackgroundImage(image: SupabaseImageRow): boolean {
  return image.slug?.startsWith('official-background-') || image.caption === 'Official product background'
}

function getPreferredProductBackgroundImages(detailImages: SupabaseImageRow[]): SupabaseImageRow[] {
  const officialImages = detailImages.filter(isOfficialProductBackgroundImage)
  return officialImages.length > 0 ? officialImages : detailImages
}

function getProductFaqs(snapshot: CatalogSnapshot, productId: number): SupabaseFaqRow[] {
  return snapshot.faqsByEntryKey.get(buildEntryKey('product', productId)) ?? []
}

function getMobileFaqs(snapshot: CatalogSnapshot, mobileId: number): SupabaseFaqRow[] {
  return snapshot.faqsByEntryKey.get(buildEntryKey('mobile', mobileId)) ?? []
}

function getProductSpecGroups(snapshot: CatalogSnapshot, productId: number): SupabaseSpecGroupRow[] {
  return snapshot.specGroupsByEntryKey.get(buildEntryKey('product', productId)) ?? []
}

function getMobileSpecGroups(snapshot: CatalogSnapshot, mobileId: number): SupabaseSpecGroupRow[] {
  return snapshot.specGroupsByEntryKey.get(buildEntryKey('mobile', mobileId)) ?? []
}

function getProductFeatureSections(snapshot: CatalogSnapshot, productId: number): SupabaseProductFeatureSectionRow[] {
  return snapshot.productFeatureSectionsByEntryKey.get(buildEntryKey('product', productId)) ?? []
}

function getMobileFeatureSections(snapshot: CatalogSnapshot, mobileId: number): SupabaseProductFeatureSectionRow[] {
  return snapshot.productFeatureSectionsByEntryKey.get(buildEntryKey('mobile', mobileId)) ?? []
}

function getProductCategories(snapshot: CatalogSnapshot, productId: number): SupabaseCategoryRow[] {
  const categoryIds = snapshot.categoryIdsByProductId.get(productId) ?? []
  const categories = categoryIds
    .map((categoryId) => snapshot.categoriesById.get(categoryId))
    .filter((category): category is SupabaseCategoryRow => Boolean(category))

  return uniqueById(categories)
}

function getMobileCategories(snapshot: CatalogSnapshot, mobileId: number): SupabaseCategoryRow[] {
  const categoryIds = snapshot.categoryIdsByMobileId.get(mobileId) ?? []
  const categories = categoryIds
    .map((categoryId) => snapshot.categoriesById.get(categoryId))
    .filter((category): category is SupabaseCategoryRow => Boolean(category))

  return uniqueById(categories)
}

function getImageColors(snapshot: CatalogSnapshot, images: SupabaseImageRow[]): SupabaseColorRow[] {
  return uniqueById(
    images
      .map((image) => (image.color_id ? snapshot.colorsById.get(image.color_id) : null))
      .filter((color): color is SupabaseColorRow => Boolean(color)),
  )
}

function buildAggregateRating(reviews: ProductDetailReview[]): ProductDetailAggregateRating | null {
  const numericRatings = reviews.map((review) => review.rating).filter((rating): rating is number => typeof rating === 'number')

  if (numericRatings.length === 0) {
    return null
  }

  const total = numericRatings.reduce((sum, rating) => sum + rating, 0)
  const ratingValue = Number((total / numericRatings.length).toFixed(1))

  return {
    ratingValue,
    reviewCount: numericRatings.length,
  }
}

function buildProductCard(product: SupabaseProductRow, snapshot: CatalogSnapshot): Product {
  const images = getProductImages(snapshot, product.id)
  const categories = getProductCategories(snapshot, product.id)
  const mainColor = product.main_color_id ? snapshot.colorsById.get(product.main_color_id) : null
  const typeLabel = product.product_type ? PRODUCT_TYPE_LABELS[product.product_type] ?? product.product_type : null
  const name = normalizeProductName(product.name)
  const price = product.price ?? null
  const priceLabel = formatPrice(price)

  return {
    id: `product-${product.id}`,
    name,
    handle: product.slug,
    href: `/products/${product.slug}`,
    image: images[0]?.url ?? null,
    description: buildProductMetaDescription(product, name),
    variant: mainColor?.name ?? images[0]?.caption ?? null,
    price,
    priceLabel,
    kind: 'product',
    subtitle: categories[0]?.name ?? typeLabel,
    colorName: mainColor?.name ?? (images[0]?.color_id ? snapshot.colorsById.get(images[0].color_id)?.name ?? null : null),
    collectionSlugs: categories.map((category) => category.slug),
    updatedAt: product.updated_at,
  }
}

function buildMobileCard(mobile: SupabaseMobileRow, snapshot: CatalogSnapshot): Product {
  const images = getMobileImages(snapshot, mobile.id)
  const colors = getImageColors(snapshot, images)
  const variant =
    colors.length > 0 ? `${colors.length} colour${colors.length === 1 ? '' : 's'}` : images[0]?.caption ?? null

  return {
    id: `mobile-${mobile.id}`,
    name: mobile.name,
    handle: mobile.slug,
    href: `/products/${mobile.slug}`,
    image: images[0]?.url ?? null,
    description: buildMobileMetaDescription(mobile),
    variant,
    price: mobile.Price,
    priceLabel: formatPrice(mobile.Price),
    kind: 'mobile',
    sortPriority: mobile.piority,
    subtitle: 'Phone',
    colorName: colors[0]?.name ?? null,
    collectionSlugs: getMobileCategories(snapshot, mobile.id).map((category) => category.slug),
    updatedAt: mobile.updated_at,
  }
}

function inferImageColorName(image: SupabaseImageRow, snapshot: CatalogSnapshot): string | null {
  if (image.color_id) {
    return snapshot.colorsById.get(image.color_id)?.name ?? null
  }

  const fallback = image.caption || image.title || image.alt_text || image.file_name || null

  if (!fallback) {
    return null
  }

  const normalized = fallback
    .replace(/\.(webp|png|jpe?g|avif)$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim()

  const knownColors = [
    'black',
    'white',
    'orange',
    'blue',
    'green',
    'yellow',
    'dark grey',
    'light grey',
    'grey',
    'gray',
    'silver',
    'red',
    'pink',
    'purple',
    'milk',
  ]

  return knownColors.find((color) => new RegExp(`\\b${color}\\b`, 'i').test(normalized)) ?? null
}

function buildProductVariantCards(product: SupabaseProductRow, snapshot: CatalogSnapshot): Product[] {
  const baseCard = buildProductCard(product, snapshot)
  const images = getProductImages(snapshot, product.id)
  const categories = getProductCategories(snapshot, product.id)
  const seen = new Set<string>()
  const variantCards: Product[] = []

  for (const image of images) {
    const colorName = inferImageColorName(image, snapshot)
    const key = colorName ? `color:${colorName.toLowerCase()}` : `image:${image.url}`

    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    variantCards.push({
      ...baseCard,
      id: `${baseCard.id}-${colorName ? colorName.toLowerCase().replace(/\s+/g, '-') : image.id}`,
      name: baseCard.name,
      image: image.url,
      variant: colorName ?? image.caption ?? image.title ?? baseCard.variant,
      colorName,
      collectionSlugs: categories.map((category) => category.slug),
    })
  }

  return variantCards.length > 0 ? variantCards : [baseCard]
}

function buildProductColorVariantCards(product: SupabaseProductRow, snapshot: CatalogSnapshot): Product[] {
  const baseCard = buildProductCard(product, snapshot)
  const images = getProductImages(snapshot, product.id)
  const categories = getProductCategories(snapshot, product.id)
  const colorImages = images
    .map((image) => {
      const color = image.color_id ? snapshot.colorsById.get(image.color_id) ?? null : null
      return color ? { image, color } : null
    })
    .filter((entry): entry is { image: SupabaseImageRow; color: SupabaseColorRow } => Boolean(entry))
  const uniqueColorIds = new Set(colorImages.map((entry) => entry.color.id))

  if (uniqueColorIds.size <= 1) {
    return [baseCard]
  }

  const seen = new Set<number>()
  const variantCards: Product[] = []

  for (const { image, color } of colorImages) {
    if (seen.has(color.id)) {
      continue
    }

    seen.add(color.id)
    variantCards.push({
      ...baseCard,
      id: `${baseCard.id}-${color.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: baseCard.name,
      image: image.url,
      variant: color.name,
      colorName: color.name,
      collectionSlugs: categories.map((category) => category.slug),
    })
  }

  return variantCards.length > 0 ? variantCards : [baseCard]
}

function buildMobileVariantCards(mobile: SupabaseMobileRow, snapshot: CatalogSnapshot): Product[] {
  const baseCard = buildMobileCard(mobile, snapshot)
  const images = getMobileImages(snapshot, mobile.id)
  const categories = getMobileCategories(snapshot, mobile.id)
  const seen = new Set<string>()
  const variantCards: Product[] = []

  for (const image of images) {
    const colorName = inferImageColorName(image, snapshot)
    const key = colorName ? `color:${colorName.toLowerCase()}` : `image:${image.url}`

    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    variantCards.push({
      ...baseCard,
      id: `${baseCard.id}-${colorName ? colorName.toLowerCase().replace(/\s+/g, '-') : image.id}`,
      name: baseCard.name,
      image: image.url,
      variant: colorName ?? image.caption ?? image.title ?? baseCard.variant,
      colorName,
      collectionSlugs: categories.map((category) => category.slug),
    })
  }

  return variantCards.length > 0 ? variantCards : [baseCard]
}

function isProtectorOrCoverProduct(product: SupabaseProductRow, snapshot: CatalogSnapshot): boolean {
  if (product.product_type === 'protector' || product.product_type === 'screen_protector') {
    return true
  }

  const categorySlugs = getProductCategories(snapshot, product.id).map((category) => category.slug)
  const haystack = `${product.name} ${product.slug} ${categorySlugs.join(' ')}`.toLowerCase()

  return /\b(protector|protectors|cover|covers|case|cases|phone-cases|phone-protectors)\b/.test(haystack)
}

function isCoverProduct(product: SupabaseProductRow, snapshot: CatalogSnapshot): boolean {
  if (product.product_type === 'covers') {
    return true
  }

  if (product.product_type === 'protector' || product.product_type === 'screen_protector') {
    return false
  }

  const categorySlugs = getProductCategories(snapshot, product.id).map((category) => category.slug)
  const haystack = `${product.name} ${product.slug} ${categorySlugs.join(' ')}`.toLowerCase()

  return /\b(cover|covers|case|cases|phone-cases)\b/.test(haystack)
}

function isWatchProduct(product: SupabaseProductRow, snapshot: CatalogSnapshot): boolean {
  const categorySlugs = getProductCategories(snapshot, product.id).map((category) => category.slug)
  const haystack = `${product.name} ${product.slug} ${categorySlugs.join(' ')}`.toLowerCase()

  return /\b(watch|watches)\b/.test(haystack)
}

function isAccessoriesCollectionProduct(product: SupabaseProductRow, snapshot: CatalogSnapshot): boolean {
  if (isWatchProduct(product, snapshot)) {
    return false
  }

  if (product.product_type && ACCESSORY_COLLECTION_PRODUCT_TYPES.has(product.product_type)) {
    return true
  }

  const categorySlugs = getProductCategories(snapshot, product.id).map((category) => category.slug)

  if (categorySlugs.some((slug) => ACCESSORY_COLLECTION_CATEGORY_SLUGS.has(slug))) {
    return true
  }

  const haystack = `${product.name} ${product.slug} ${categorySlugs.join(' ')}`.toLowerCase()

  return /\b(charger|chargers|cable|cables|cover|covers|case|cases|protector|protectors|glass|sheet)\b/.test(haystack)
}

function isCmfMobile(mobile: SupabaseMobileRow): boolean {
  return /^cmf\b/i.test(mobile.name.trim()) || mobile.slug.startsWith('cmf-')
}

function buildCmfCollectionProducts(snapshot: CatalogSnapshot, categoryProducts: Product[]): Product[] {
  const categoryProductHandles = new Set(categoryProducts.map((product) => product.handle))
  const cmfProductCards = snapshot.products
    .filter((product) => categoryProductHandles.has(product.slug))
    .filter((product) => !isProtectorOrCoverProduct(product, snapshot))
    .flatMap((product) => buildProductVariantCards(product, snapshot))

  const cmfMobileCards = snapshot.mobiles.filter(isCmfMobile).flatMap((mobile) => buildMobileVariantCards(mobile, snapshot))

  return sortCatalogCards([...cmfMobileCards, ...cmfProductCards])
}

function buildProductCollections(categories: SupabaseCategoryRow[], snapshot: CatalogSnapshot): ProductDetailCollection[] {
  return categories.map((category) => ({
    slug: category.slug,
    title: category.name,
    parentSlug: category.parent_id ? snapshot.categoriesById.get(category.parent_id)?.slug ?? null : null,
    parentTitle: category.parent_id ? snapshot.categoriesById.get(category.parent_id)?.name ?? null : null,
  }))
}

function buildBreadcrumbItems(
  categories: SupabaseCategoryRow[],
  snapshot: CatalogSnapshot,
  itemType: 'product' | 'mobile',
): ProductDetailBreadcrumbItem[] {
  const breadcrumbItems: ProductDetailBreadcrumbItem[] = [{ label: 'Home', href: '/' }]
  const primaryCategory = categories.find((category) => category.parent_id !== null) ?? categories[0] ?? null

  if (primaryCategory?.parent_id) {
    const parentCategory = snapshot.categoriesById.get(primaryCategory.parent_id)

    if (parentCategory) {
      breadcrumbItems.push({
        label: parentCategory.name,
        href: `/collections/${parentCategory.slug}`,
      })
    }
  }

  if (primaryCategory) {
    breadcrumbItems.push({
      label: primaryCategory.name,
      href: `/collections/${primaryCategory.slug}`,
    })

    return breadcrumbItems
  }

  breadcrumbItems.push(
    itemType === 'mobile'
      ? { label: 'Phones', href: '/collections/phones' }
      : { label: 'Shop all', href: '/collections/shop-all' },
  )

  return breadcrumbItems
}

function buildVariants(images: SupabaseImageRow[], snapshot: CatalogSnapshot, handle: string): ProductDetailVariant[] {
  const colors = getImageColors(snapshot, images)

  if (colors.length > 0) {
    return colors.map((color) => ({
      id: `variant-${color.id}`,
      label: color.name,
      href: `/products/${handle}`,
    }))
  }

  return images.slice(0, 4).map((image) => ({
    id: `variant-${image.id}`,
    label: image.caption || image.title || `Image ${image.sort_order + 1}`,
    href: `/products/${handle}`,
  }))
}

function buildWidgets(
  itemType: 'product' | 'mobile',
  productType: ProductType | null | undefined,
  images: SupabaseImageRow[],
  snapshot: CatalogSnapshot,
  stockQuantity?: number | null,
): ProductDetailWidget[] {
  const values: string[] = []

  if (itemType === 'product' && productType) {
    values.push(PRODUCT_TYPE_LABELS[productType] ?? productType)
  }

  for (const color of getImageColors(snapshot, images)) {
    values.push(color.name)
  }

  if (typeof stockQuantity === 'number') {
    values.push(stockQuantity > 0 ? 'In stock' : 'Out of stock')
  }

  if (values.length === 0) {
    values.push(itemType === 'mobile' ? 'Phone' : 'Live catalog item')
  }

  const uniqueValues = [...new Set(values)]

  return uniqueValues.slice(0, 3).map((text, index) => ({
    id: `widget-${index + 1}`,
    text,
  }))
}

function buildGallery(
  name: string,
  images: SupabaseImageRow[],
  snapshot: CatalogSnapshot,
  fallbackAltText?: string | null,
): ProductDetailMedia[] {
  const colorsById = snapshot.colorsById

  return images.map((image) => ({
    id: `media-${image.id}`,
    url: image.url,
    alt: image.alt_text || fallbackAltText || `${name} original product price in Pakistan from Nothing Official Store Pakistan`,
    title: image.title,
    caption: image.caption,
    colorName: image.color_id ? colorsById.get(image.color_id)?.name ?? null : null,
    colorHex: image.color_id ? colorsById.get(image.color_id)?.hex_code ?? null : null,
    slug: image.slug,
  }))
}

function isProductBackgroundImage(image: SupabaseImageRow) {
  const source = [image.slug, image.title, image.caption, image.file_name].filter(Boolean).join(' ').toLowerCase()

  return source.includes('product background') || source.includes('product-background')
}

function buildFaqs(faqs: SupabaseFaqRow[], productName?: string | null, priceLabel?: string | null): ProductDetailFaq[] {
  return faqs.map((faq) => ({
    id: `faq-${faq.id}`,
    question: faq.question,
    answer:
      productName && priceLabel && /price/i.test(faq.question)
        ? `The price of ${productName} in Pakistan is ${priceLabel}.`
        : faq.answer,
  }))
}

function buildDetailSpecs(
  itemType: 'product' | 'mobile',
  collections: ProductDetailCollection[],
  images: SupabaseImageRow[],
  snapshot: CatalogSnapshot,
  values: Array<[label: string, value: string | null | undefined]>,
): ProductDetailSpec[] {
  const specs: ProductDetailSpec[] = []
  const seen = new Set<string>()

  const pushSpec = (label: string, value: string | null | undefined) => {
    if (!value) {
      return
    }

    const key = `${label}:${value}`
    if (seen.has(key)) {
      return
    }

    seen.add(key)
    specs.push({
      id: `spec-${specs.length + 1}`,
      label,
      value,
    })
  }

  for (const [label, value] of values) {
    pushSpec(label, value)
  }

  const colorNames = uniqueById(getImageColors(snapshot, images)).map((color) => color.name)
  if (colorNames.length > 0) {
    pushSpec(itemType === 'mobile' ? 'Colours' : 'Colour options', colorNames.join(', '))
  }

  if (collections.length > 0) {
    pushSpec('Collections', collections.map((collection) => collection.title).join(', '))
  }

  return specs
}

function buildSpecGroups(
  groups: SupabaseSpecGroupRow[],
  specs: ProductDetailSpec[],
  itemsByGroupId: Map<number, SupabaseSpecGroupItemRow[]>,
): ProductDetailSpecGroup[] {
  if (groups.length === 0) {
    return specs.length > 0
      ? [
          {
            id: 'spec-group-overview',
            title: 'Specifications',
            subtitle: null,
            iconKey: null,
            mediaUrl: null,
            mediaAlt: null,
            mediaType: 'image',
            mediaPosition: 'top',
            defaultOpen: true,
            sortOrder: 0,
            specs,
          },
        ]
      : []
  }

  return groups.map((group) => {
    const groupItems = itemsByGroupId.get(group.id) ?? []

    return {
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
      specs: groupItems.map((item) => ({
        id: `spec-group-item-${item.id}`,
        section: item.section,
        label: item.label,
        value: item.value,
      })),
    }
  })
}

function buildProductSpecGroups(
  groups: SupabaseSpecGroupRow[],
  itemsByGroupId: Map<number, SupabaseSpecGroupItemRow[]>,
): ProductDetailSpecGroup[] {
  return buildSpecGroups(groups, [], itemsByGroupId).filter((group) => group.specs.length > 0 || group.mediaUrl)
}

function buildProductFeatureSections(
  sections: SupabaseProductFeatureSectionRow[],
  snapshot: CatalogSnapshot,
): ProductFeatureSection[] {
  return sections.map((section) => {
    const slides = snapshot.productFeatureSlidesBySectionId.get(section.id) ?? []

    return {
      id: `product-feature-section-${section.id}`,
      sourceKey: section.source_key,
      featureKey: section.feature_key,
      featureTitle: section.feature_title,
      featureVersion: section.feature_version,
      title: section.title,
      displayContext: section.display_context,
      coverImageUrl: section.cover_image_url,
      coverVideoPlaybackId: section.cover_video_playback_id,
      coverVideoUrl: section.cover_video_url,
      coverThumbnailUrl: section.cover_thumbnail_url,
      sortOrder: section.sort_order,
      slides: slides.map((slide) => ({
        id: `product-feature-slide-${slide.id}`,
        sourceKey: slide.source_key,
        title: slide.title,
        body: slide.body,
        mediaType: slide.media_type,
        imageUrl: slide.image_url,
        videoPlaybackId: slide.video_playback_id,
        videoUrl: slide.video_url,
        thumbnailUrl: slide.thumbnail_url,
        sortOrder: slide.sort_order,
      })),
    }
  })
}

function getProductReviews(snapshot: CatalogSnapshot, productId: number): SupabaseReviewRow[] {
  return snapshot.reviewsByEntryKey.get(buildEntryKey('product', productId)) ?? []
}

function getMobileReviews(snapshot: CatalogSnapshot, mobileId: number): SupabaseReviewRow[] {
  return snapshot.reviewsByEntryKey.get(buildEntryKey('mobile', mobileId)) ?? []
}

function buildReviews(reviews: SupabaseReviewRow[]): ProductDetailReview[] {

  return reviews.map((review) => ({
    id: `review-${review.id}`,
    userName: review.user_name,
    rating: review.rating,
    comment: review.comment,
    createdAt: formatCatalogDate(review.created_at),
  }))
}

function buildRelatedMobiles(snapshot: CatalogSnapshot, productId: number): ProductDetailRelatedItem[] {
  const mobileIds = snapshot.mobileIdsByProductId.get(productId) ?? []

  return uniqueById(
    mobileIds
      .map((mobileId) => snapshot.mobilesById.get(mobileId))
      .filter((mobile): mobile is SupabaseMobileRow => Boolean(mobile))
      .map((mobile) => ({
        id: mobile.id,
        name: mobile.name,
        slug: mobile.slug,
        image: getMobileImages(snapshot, mobile.id)[0]?.url ?? null,
        priceLabel: formatPrice(mobile.Price),
        subtitle: formatCatalogDate(mobile.release_date),
      })),
  ).map((mobile) => ({
    id: `mobile-${mobile.id}`,
    name: mobile.name,
    slug: mobile.slug,
    image: mobile.image,
    priceLabel: mobile.priceLabel,
    subtitle: mobile.subtitle,
  }))
}

function buildMobileAccessoryGroups(snapshot: CatalogSnapshot, mobileId: number): MobileAccessoryGroup[] {
  const productIds = snapshot.productIdsByMobileId.get(mobileId) ?? []
  const linkedProducts = uniqueById(
    productIds
      .map((productId) => snapshot.productsById.get(productId))
      .filter((product): product is SupabaseProductRow => Boolean(product)),
  )

  const groupedProducts = linkedProducts.map((product) => ({
    product,
    card: buildProductCard(product, snapshot),
  }))

  const protectors = groupedProducts
    .filter(({ product }) => product.product_type === 'protector' || product.product_type === 'screen_protector')
    .map(({ card }) => card)
    .sort((left, right) => left.name.localeCompare(right.name))
  const covers = groupedProducts
    .filter(({ product }) => isCoverProduct(product, snapshot))
    .map(({ card }) => card)
    .sort((left, right) => left.name.localeCompare(right.name))
  const chargers = groupedProducts
    .filter(({ product }) => product.product_type === 'charger' || product.product_type === 'data_cable')
    .map(({ card }) => card)
    .sort((left, right) => left.name.localeCompare(right.name))
  const earbuds = groupedProducts
    .filter(({ product }) => product.product_type === 'earbuds')
    .map(({ card }) => card)
    .sort((left, right) => left.name.localeCompare(right.name))
  const accessories = groupedProducts
    .filter(({ product }) => !product.product_type && !isCoverProduct(product, snapshot))
    .map(({ card }) => card)
    .sort((left, right) => left.name.localeCompare(right.name))

  const groups: MobileAccessoryGroup[] = [
    { id: 'covers', title: 'Related Covers', products: covers },
    { id: 'protectors', title: 'Related Protectors', products: protectors },
    { id: 'chargers', title: 'Related Charger and Cables', products: chargers },
    { id: 'earbuds', title: 'Related Earbuds', products: earbuds },
    { id: 'accessories', title: 'Other Accessories', products: accessories },
  ]

  return groups.filter((group) => group.products.length > 0)
}

function buildProductDetailFromProduct(product: SupabaseProductRow, snapshot: CatalogSnapshot): ProductDetail {
  const images = getProductImages(snapshot, product.id)
  const productBackgroundImages = getPreferredProductBackgroundImages(getProductDetailImages(snapshot, product.id))
  const productBackgroundImage = productBackgroundImages[0] ?? images.find(isProductBackgroundImage) ?? null
  const galleryImages = images.filter((image) => !isProductBackgroundImage(image))
  const faqs = getProductFaqs(snapshot, product.id)
  const categories = getProductCategories(snapshot, product.id)
  const collections = buildProductCollections(categories, snapshot)
  const variants = buildVariants(galleryImages, snapshot, product.slug)
  const canonicalPath = `/products/${product.slug}`
  const name = normalizeProductName(product.name)
  const reviews = buildReviews(getProductReviews(snapshot, product.id))
  const price = product.price ?? null
  const priceLabel = formatPrice(price)
  const metaDescription = buildProductMetaDescription(product, name)
  const gallery = buildGallery(name, galleryImages, snapshot, product.image_alt_text || `${name} price in Pakistan`)
  const fallbackBackgroundMedia = gallery[0] ?? null
  const backgroundMedia = productBackgroundImage
    ? buildGallery(name, [productBackgroundImage], snapshot, `${name} product background`)[0] ?? fallbackBackgroundMedia
    : fallbackBackgroundMedia
  const backgroundMediaItems = productBackgroundImages.length > 0
    ? buildGallery(name, productBackgroundImages, snapshot, `${name} product background`)
    : backgroundMedia
      ? [backgroundMedia]
      : []
  const specGroups = buildProductSpecGroups(getProductSpecGroups(snapshot, product.id), snapshot.specGroupItemsByGroupId)
  const specs = specGroups.flatMap((group) => group.specs)

  return {
    id: `product-${product.id}`,
    entityType: 'product',
    handle: product.slug,
    name,
    brandName: resolveBrandName(name),
    pageTitle: product.meta_title || name,
    summary: sanitizeCatalogCopy(product.short_description) || sanitizeCatalogCopy(product.description) || metaDescription,
    metaDescription,
    seoKeywords: buildProductSearchKeywords(name, product.product_type, product.seo_keywords),
    schemaJson: product.schema_json,
    description: sanitizeCatalogCopy(product.seo_description_long) || sanitizeCatalogCopy(product.description),
    sourceHref: canonicalPath,
    sourceUrl: buildAbsoluteUrl(canonicalPath),
    canonicalUrl: product.canonical_url || buildAbsoluteUrl(canonicalPath),
    ogImage: galleryImages[0]?.url ?? productBackgroundImage?.url ?? null,
    primaryImage: galleryImages[0]?.url ?? null,
    productBackgroundImage: backgroundMedia,
    productBackgroundImages: backgroundMediaItems,
    gallery,
    collectionSlugs: collections.map((collection) => collection.slug),
    collections,
    variantUrls: galleryImages.map((image) => image.url),
    variants,
    heroImages: galleryImages.map((image) => image.url),
    widgets: buildWidgets('product', product.product_type, galleryImages, snapshot, product.stock_quantity),
    price,
    priceLabel,
    stockQuantity: product.stock_quantity,
    availability: resolveAvailability(product.stock_quantity),
    createdAt: product.created_at,
    updatedAt: product.updated_at,
    specs,
    specGroups,
    productFeatureSections: buildProductFeatureSections(getProductFeatureSections(snapshot, product.id), snapshot),
    faqs: buildFaqs(faqs, name, priceLabel),
    reviews,
    relatedMobiles: buildRelatedMobiles(snapshot, product.id),
    breadcrumbItems: buildBreadcrumbItems(categories, snapshot, 'product'),
    aggregateRating: buildAggregateRating(reviews),
  }
}

function buildProductDetailFromMobile(mobile: SupabaseMobileRow, snapshot: CatalogSnapshot): ProductDetail {
  const images = getMobileImages(snapshot, mobile.id)
  const productBackgroundImages = getPreferredProductBackgroundImages(getMobileDetailImages(snapshot, mobile.id))
  const productBackgroundImage = productBackgroundImages[0] ?? images.find(isProductBackgroundImage) ?? null
  const galleryImages = images.filter((image) => !isProductBackgroundImage(image))
  const faqs = getMobileFaqs(snapshot, mobile.id)
  const categories = getMobileCategories(snapshot, mobile.id)
  const collections = buildProductCollections(categories, snapshot)
  const canonicalPath = `/products/${mobile.slug}`
  const metaDescription = buildMobileMetaDescription(mobile)
  const gallery = buildGallery(mobile.name, galleryImages, snapshot, mobile.image_alt_text || `${mobile.name} price in Pakistan`)
  const fallbackBackgroundMedia = gallery[0] ?? null
  const backgroundMedia = productBackgroundImage
    ? buildGallery(mobile.name, [productBackgroundImage], snapshot, `${mobile.name} product background`)[0] ?? fallbackBackgroundMedia
    : fallbackBackgroundMedia
  const backgroundMediaItems = productBackgroundImages.length > 0
    ? buildGallery(mobile.name, productBackgroundImages, snapshot, `${mobile.name} product background`)
    : backgroundMedia
      ? [backgroundMedia]
      : []
  const reviews = buildReviews(getMobileReviews(snapshot, mobile.id))
  const specs = buildDetailSpecs('mobile', collections, galleryImages, snapshot, [
    ['Release date', formatCatalogDate(mobile.release_date)],
    ['Updated', formatCatalogDate(mobile.updated_at)],
  ])

  return {
    id: `mobile-${mobile.id}`,
    entityType: 'mobile',
    handle: mobile.slug,
    name: mobile.name,
    brandName: resolveBrandName(mobile.name),
    pageTitle: mobile.meta_title || mobile.name,
    summary: sanitizeCatalogCopy(mobile.description) || metaDescription,
    metaDescription,
    seoKeywords: buildMobileSearchKeywords(mobile.name, mobile.seo_keywords),
    schemaJson: mobile.schema_json,
    description: sanitizeCatalogCopy(mobile.seo_description_long) || sanitizeCatalogCopy(mobile.description),
    sourceHref: canonicalPath,
    sourceUrl: buildAbsoluteUrl(canonicalPath),
    canonicalUrl: mobile.canonical_url || buildAbsoluteUrl(canonicalPath),
    ogImage: galleryImages[0]?.url ?? productBackgroundImage?.url ?? null,
    primaryImage: galleryImages[0]?.url ?? null,
    productBackgroundImage: backgroundMedia,
    productBackgroundImages: backgroundMediaItems,
    gallery,
    collectionSlugs: collections.map((collection) => collection.slug),
    collections,
    variantUrls: galleryImages.map((image) => image.url),
    variants: buildVariants(galleryImages, snapshot, mobile.slug),
    heroImages: galleryImages.map((image) => image.url),
    widgets: buildWidgets('mobile', null, galleryImages, snapshot),
    price: mobile.Price,
    priceLabel: formatPrice(mobile.Price),
    stockQuantity: null,
    availability: resolveAvailability(),
    createdAt: mobile.created_at,
    updatedAt: mobile.updated_at,
    specs,
    specGroups: buildSpecGroups(getMobileSpecGroups(snapshot, mobile.id), specs, snapshot.specGroupItemsByGroupId),
    productFeatureSections: buildProductFeatureSections(getMobileFeatureSections(snapshot, mobile.id), snapshot),
    faqs: buildFaqs(faqs, mobile.name, formatPrice(mobile.Price)),
    reviews,
    relatedMobiles: [],
    breadcrumbItems: buildBreadcrumbItems(categories, snapshot, 'mobile'),
    aggregateRating: buildAggregateRating(reviews),
  }
}

function getVirtualCollectionProducts(slug: VirtualCollectionSlug, snapshot: CatalogSnapshot): Product[] {
  if (slug === 'shop-all') {
    const productCards = snapshot.products
      .filter((product) => !isProtectorOrCoverProduct(product, snapshot))
      .flatMap((product) => buildProductVariantCards(product, snapshot))

    return sortCatalogCards(productCards)
  }

  if (slug === 'phones') {
    return sortCatalogCards(snapshot.mobiles.flatMap((mobile) => buildMobileVariantCards(mobile, snapshot)))
  }

  const productTypes = VIRTUAL_COLLECTIONS[slug].productTypes ?? []

  return sortCatalogCards(
    snapshot.products
      .filter((product) => product.product_type && productTypes.includes(product.product_type))
      .flatMap((product) => buildProductVariantCards(product, snapshot)),
  )
}

function getVirtualCollectionUpdatedAt(slug: VirtualCollectionSlug, snapshot: CatalogSnapshot, products: Product[]): string | null {
  if (slug === 'phones') {
    return getLatestTimestamp(snapshot.mobiles.map((mobile) => mobile.updated_at))
  }

  if (slug === 'shop-all') {
    return getLatestTimestamp(snapshot.products.map((product) => product.updated_at))
  }

  return getCollectionUpdatedAt(products, null)
}

function buildVirtualCollection(slug: VirtualCollectionSlug, snapshot: CatalogSnapshot): Collection {
  const config = VIRTUAL_COLLECTIONS[slug]
  const products = getVirtualCollectionProducts(slug, snapshot)

  return {
    slug,
    title: config.title,
    metaTitle: config.metaTitle,
    metaDescription: config.description,
    description: config.description,
    canonicalUrl: buildAbsoluteUrl(`/collections/${slug}`),
    schemaJson: null,
    sourceUrl: buildAbsoluteUrl(`/collections/${slug}`),
    heroImage: getCollectionHeroImage(products),
    updatedAt: getVirtualCollectionUpdatedAt(slug, snapshot, products),
    seoKeywords: [
      `${config.title} Pakistan`,
      `${config.title} price in Pakistan`,
      `Nothing ${config.title} Pakistan`,
      ...products.slice(0, 8).flatMap((product) => [product.name, `${product.name} price in Pakistan`]),
    ],
    products,
    parentCollection: null,
    childCollections: [],
    siblingCollections: [],
  }
}

export async function getHomePageData(): Promise<HomePageData> {
  const snapshot = await getCatalogSnapshot({ includeDetailRows: false })
  const shopAllProducts = sortCatalogCards(
    snapshot.products
      .filter((product) => !isProtectorOrCoverProduct(product, snapshot))
      .map((product) => buildProductCard(product, snapshot)),
  )
  const phoneProducts = sortHomeShowcaseCards(snapshot.mobiles.map((mobile) => buildMobileCard(mobile, snapshot)))
  const trendingPicks = getOrderedCategoryProductCards(snapshot, 'trending-picks', TRENDING_PICK_PRODUCT_SLUGS)
  const featuredCovers = getOrderedCategoryProductCards(snapshot, FEATURED_COVERS_CATEGORY_SLUG, FEATURED_COVER_PRODUCT_SLUGS)

  return {
    phoneModels: phoneProducts,
    featuredCovers,
    shopAllProducts,
    trendingPicks,
  }
}

export async function getNavigationMenuItems(): Promise<NavigationItem[]> {
  const snapshot = await getCatalogSnapshot({ includeDetailRows: false })
  const topLevelCategories = getTopLevelCategories(snapshot)

  return [
    buildVirtualNavigationItem('shop-all', VIRTUAL_COLLECTIONS['shop-all'].title, VIRTUAL_COLLECTIONS['shop-all'].description),
    buildVirtualNavigationItem('phones', VIRTUAL_COLLECTIONS.phones.title, VIRTUAL_COLLECTIONS.phones.description),
    buildVirtualNavigationItem('chargers', VIRTUAL_COLLECTIONS.chargers.title, VIRTUAL_COLLECTIONS.chargers.description, 'accessories'),
    ...topLevelCategories.map((category) => buildNavigationItem(category, snapshot)),
  ]
}

export async function getAllCollectionSlugs(): Promise<string[]> {
  const snapshot = await getCatalogSnapshot({ includeDetailRows: false })

  return [...ALL_VIRTUAL_COLLECTION_SLUGS, ...snapshot.categories.map((category) => category.slug)]
}

export async function getAllProductHandles(): Promise<string[]> {
  try {
    const snapshot = await getCatalogSnapshot({ includeDetailRows: false })
    const handles = [...snapshot.products.map((product) => product.slug), ...snapshot.mobiles.map((mobile) => mobile.slug)]

    return [...new Set([...handles, ...getFallbackProductHandles()])]
  } catch {
    return getFallbackProductHandles()
  }
}

export async function getProductStaticHandles(): Promise<string[]> {
  return [...new Set(await getAllProductHandles())]
}

function getCollectionHeroImage(products: Product[]): string | null {
  return products.find((product) => product.image)?.image ?? null
}

function getCollectionUpdatedAt(products: Product[], fallbackValue: string | null | undefined): string | null {
  return getLatestTimestamp([fallbackValue, ...products.map((product) => product.updatedAt)])
}

function filterAccessoriesCollectionCards(snapshot: CatalogSnapshot, products: Product[]): Product[] {
  const allowedHandles = new Set(
    snapshot.products
      .filter((product) => isAccessoriesCollectionProduct(product, snapshot))
      .map((product) => product.slug),
  )

  return products.filter((product) => allowedHandles.has(product.handle))
}

export async function getCollectionSitemapEntries(): Promise<SitemapCollectionEntry[]> {
  const snapshot = await getCatalogSnapshot()
  const entries: SitemapCollectionEntry[] = ALL_VIRTUAL_COLLECTION_SLUGS.map((slug) => {
    const config = VIRTUAL_COLLECTIONS[slug]
    const products = getVirtualCollectionProducts(slug, snapshot)

    return {
      slug,
      title: config.title,
      description: config.description,
      image: getCollectionHeroImage(products),
      updatedAt: getVirtualCollectionUpdatedAt(slug, snapshot, products),
      itemCount: products.length,
      depth: getVirtualCollectionDepth(slug),
    }
  }).filter((entry) => Boolean(entry.image || entry.updatedAt))

  for (const category of snapshot.categories) {
    const categoryTreeIds = getCategoryTreeIds(snapshot, category.id)
    const rawProducts = getCatalogCardsForCategoryIds(snapshot, categoryTreeIds)
    const products = category.slug === 'accessories' ? filterAccessoriesCollectionCards(snapshot, rawProducts) : rawProducts
    const relationTimestamps = snapshot.categoryRelations
      .filter((relation) => categoryTreeIds.includes(relation.category_id))
      .map((relation) => relation.updated_at || relation.created_at)

    if (products.length === 0 && !INDEXABLE_CONTENT_COLLECTION_SLUGS.has(category.slug)) {
      continue
    }

    entries.push({
      slug: category.slug,
      title: category.name,
      description: category.meta_description || category.seo_description_long || null,
      image: getCollectionHeroImage(products),
      updatedAt: getLatestTimestamp([category.updated_at, category.created_at, ...relationTimestamps, ...products.map((product) => product.updatedAt)]),
      itemCount: products.length,
      depth: getCategoryDepth(snapshot, category),
    })
  }

  return entries
}

export async function getProductSitemapEntries(): Promise<SitemapProductEntry[]> {
  const snapshot = await getCatalogSnapshot()

  const productEntries = snapshot.products.map((product) => {
    const images = getProductImages(snapshot, product.id)
    const faqs = getProductFaqs(snapshot, product.id)
    const reviews = getProductReviews(snapshot, product.id)
    const linkedMobileIds = snapshot.mobileIdsByProductId.get(product.id) ?? []
    const linkedMobilesUpdatedAt = linkedMobileIds
      .map((mobileId) => snapshot.mobilesById.get(mobileId)?.updated_at ?? null)
      .filter((value): value is string => Boolean(value))
    const productMobileTimestamps = snapshot.productMobiles
      .filter((relation) => relation.product_id === product.id)
      .map((relation) => relation.created_at)
    const categories = getProductCategories(snapshot, product.id)

    return {
      handle: product.slug,
      title: product.meta_title || product.name,
      description: product.meta_description || product.short_description || product.description,
      image: images[0]?.url ?? null,
      updatedAt: getLatestTimestamp([
        product.updated_at,
        ...images.map((image) => image.updated_at),
        ...faqs.map((faq) => faq.updated_at || faq.created_at),
        ...reviews.map((review) => review.updated_at || review.created_at),
        ...getCategoryRelationTimestamps(snapshot, 'product', product.id),
        ...productMobileTimestamps,
        ...linkedMobilesUpdatedAt,
      ]),
      entityType: 'product' as const,
      productType: product.product_type,
      stockQuantity: product.stock_quantity,
      linkedItemCount: linkedMobileIds.length,
      collectionSlugs: categories.map((category) => category.slug),
    }
  })

  const mobileEntries = snapshot.mobiles.map((mobile) => {
    const images = getMobileImages(snapshot, mobile.id)
    const faqs = getMobileFaqs(snapshot, mobile.id)
    const linkedProductIds = snapshot.productIdsByMobileId.get(mobile.id) ?? []
    const linkedProducts = linkedProductIds
      .map((productId) => snapshot.productsById.get(productId))
      .filter((product): product is SupabaseProductRow => Boolean(product))
    const productMobileTimestamps = snapshot.productMobiles
      .filter((relation) => relation.mobile_id === mobile.id)
      .map((relation) => relation.created_at)
    const categories = getMobileCategories(snapshot, mobile.id)

    return {
      handle: mobile.slug,
      title: mobile.meta_title || mobile.name,
      description: mobile.meta_description || mobile.description,
      image: images[0]?.url ?? null,
      updatedAt: getLatestTimestamp([
        mobile.updated_at,
        ...images.map((image) => image.updated_at),
        ...faqs.map((faq) => faq.updated_at || faq.created_at),
        ...getCategoryRelationTimestamps(snapshot, 'mobile', mobile.id),
        ...productMobileTimestamps,
        ...linkedProducts.map((product) => product.updated_at),
      ]),
      entityType: 'mobile' as const,
      productType: null,
      stockQuantity: null,
      linkedItemCount: linkedProducts.length,
      collectionSlugs: categories.map((category) => category.slug),
    }
  })

  return [...productEntries, ...mobileEntries]
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const snapshot = await getCatalogSnapshot({ includeDetailRows: false })

  if (isVirtualCollectionSlug(slug)) {
    return buildVirtualCollection(slug, snapshot)
  }

  const category = snapshot.categoriesBySlug.get(slug)

  if (!category) {
    return null
  }

  const categoryTreeIds = getCategoryTreeIds(snapshot, category.id)
  const rawProducts = getCatalogCardsForCategoryIds(snapshot, categoryTreeIds)
  const products =
    category.slug === 'cmf'
      ? buildCmfCollectionProducts(snapshot, rawProducts)
      : category.slug === 'accessories'
        ? sortCatalogCards(
            snapshot.products
              .filter((product) => rawProducts.some((card) => card.handle === product.slug))
              .filter((product) => isAccessoriesCollectionProduct(product, snapshot))
              .flatMap((product) => buildProductColorVariantCards(product, snapshot)),
          )
      : category.slug === 'shop-all'
        ? rawProducts
        : sortCatalogCards(
            snapshot.products
              .filter((product) => rawProducts.some((card) => card.handle === product.slug))
              .flatMap((product) => buildProductVariantCards(product, snapshot)),
          )
  const relationTimestamps = snapshot.categoryRelations
    .filter((relation) => categoryTreeIds.includes(relation.category_id))
    .map((relation) => relation.updated_at || relation.created_at)

  const parentCategory = category.parent_id ? snapshot.categoriesById.get(category.parent_id) ?? null : null
  const childCollections = getChildCategories(snapshot, category.id).map((child) => buildNavigationItem(child, snapshot))
  const siblingCollections = parentCategory
    ? getChildCategories(snapshot, parentCategory.id)
        .filter((child) => child.id !== category.id)
        .map((child) => buildNavigationItem(child, snapshot))
    : []

  return {
    slug: category.slug,
    title: category.name,
    metaTitle: category.meta_title,
    metaDescription: category.meta_description || category.seo_description_long,
    description: category.seo_description_long || category.meta_description,
    canonicalUrl: category.canonical_url || buildAbsoluteUrl(`/collections/${category.slug}`),
    schemaJson: category.schema_json,
    sourceUrl: buildAbsoluteUrl(`/collections/${category.slug}`),
    heroImage: getCollectionHeroImage(products),
    updatedAt: getLatestTimestamp([category.updated_at, ...relationTimestamps, ...products.map((product) => product.updatedAt)]),
    seoKeywords: [
      category.name,
      `${category.name} Pakistan`,
      `${category.name} price in Pakistan`,
      ...splitSeoKeywords(category.seo_keywords),
      ...products.slice(0, 8).flatMap((product) => [product.name, `${product.name} price in Pakistan`]),
    ],
    products,
    parentCollection: parentCategory ? buildNavigationItem(parentCategory, snapshot) : null,
    childCollections,
    siblingCollections,
  }
}

export async function getProductDetailByHandle(handle: string, options: ProductDetailReadOptions = {}): Promise<ProductDetail | null> {
  try {
    const snapshot = await getCatalogSnapshot(options)
    const product = snapshot.productsBySlug.get(handle)

    if (product) {
      return buildProductDetailFromProduct(product, snapshot)
    }

    const mobile = snapshot.mobilesBySlug.get(handle)

    if (mobile) {
      return buildProductDetailFromMobile(mobile, snapshot)
    }
  } catch (error) {
    console.warn('[catalog-repository] product detail snapshot unavailable, using fallback catalog:', error)
  }

  return buildFallbackProductDetailByHandle(handle)
}

export async function getMobileAccessoryGroupsByHandle(handle: string): Promise<MobileAccessoryGroup[]> {
  const snapshot = await getCatalogSnapshot({ includeDetailRows: false })
  const mobile = snapshot.mobilesBySlug.get(handle)

  if (!mobile) {
    return []
  }

  return buildMobileAccessoryGroups(snapshot, mobile.id)
}

export async function getSupportHeroImage(): Promise<SupportHeroImage> {
  const supabase = getSupabaseAdminClient()

  if (!supabase) {
    return {
      url: null,
      alt: 'Nothing Official Store Pakistan support',
    }
  }

  const fetchFirstImage = async (relatedType: StoreRelatedType) => {
    const { data, error } = await supabase
      .from('images')
      .select('url, alt_text, title, caption, related_id, sort_order')
      .eq('related_type', relatedType)
      .order('related_id', { ascending: true })
      .order('sort_order', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error || !data) {
      return null
    }

    const image = data as Pick<SupabaseImageRow, 'url' | 'alt_text' | 'title' | 'caption'>

    return {
      url: image.url,
      alt: image.alt_text || image.title || image.caption || 'Nothing Official Store Pakistan support',
    }
  }

  const mobileImage = await fetchFirstImage('mobile')
  if (mobileImage) {
    return mobileImage
  }

  const productImage = await fetchFirstImage('product')
  if (productImage) {
    return productImage
  }

  return {
    url: null,
    alt: 'Nothing Official Store Pakistan support',
  }
}
