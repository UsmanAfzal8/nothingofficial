import type { Collection, HomePageData, NavigationItem, Product } from '@/lib/models/catalog'
import type {
  ProductDetail,
  ProductDetailAggregateRating,
  ProductDetailBreadcrumbItem,
  ProductDetailCollection,
  ProductDetailFaq,
  ProductDetailMedia,
  ProductDetailRelatedItem,
  ProductDetailReview,
  ProductDetailSpec,
  ProductDetailVariant,
  ProductDetailWidget,
} from '@/lib/models/product-detail'
import type {
  StoreRelatedType,
  SupabaseCategoryRelationRow,
  SupabaseCategoryRow,
  SupabaseColorRow,
  SupabaseFaqRow,
  SupabaseImageRow,
  SupabaseMobileRow,
  SupabaseProductMobileRow,
  SupabaseProductRow,
  SupabaseReviewRow,
} from '@/lib/models/supabase-store'
import { STORE_RELATED_TYPE_ENUM } from '@/lib/models/supabase-enums'
import type { ProductType } from '@/lib/models/supabase-enums'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import { buildAbsoluteUrl, splitSeoKeywords, trimSeoDescription } from '@/lib/utils/seo'

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
  id: 'protectors' | 'chargers' | 'earbuds' | 'accessories'
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
  reviews: SupabaseReviewRow[]
  colorsById: Map<number, SupabaseColorRow>
  categoriesById: Map<number, SupabaseCategoryRow>
  mobilesById: Map<number, SupabaseMobileRow>
  productIdsByCategoryId: Map<number, number[]>
  categoryIdsByProductId: Map<number, number[]>
  mobileIdsByCategoryId: Map<number, number[]>
  categoryIdsByMobileId: Map<number, number[]>
  mobileIdsByProductId: Map<number, number[]>
  productIdsByMobileId: Map<number, number[]>
  imagesByEntryKey: Map<string, SupabaseImageRow[]>
  faqsByEntryKey: Map<string, SupabaseFaqRow[]>
  reviewsByProductId: Map<number, SupabaseReviewRow[]>
}

const EMPTY_SNAPSHOT: CatalogSnapshot = {
  products: [],
  mobiles: [],
  categories: [],
  categoryRelations: [],
  productMobiles: [],
  images: [],
  faqs: [],
  reviews: [],
  colorsById: new Map(),
  categoriesById: new Map(),
  mobilesById: new Map(),
  productIdsByCategoryId: new Map(),
  categoryIdsByProductId: new Map(),
  mobileIdsByCategoryId: new Map(),
  categoryIdsByMobileId: new Map(),
  mobileIdsByProductId: new Map(),
  productIdsByMobileId: new Map(),
  imagesByEntryKey: new Map(),
  faqsByEntryKey: new Map(),
  reviewsByProductId: new Map(),
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
const TRENDING_PICK_PRODUCT_SLUGS = [
  'cmf-buds-pro',
  'cmf-power-65w-gan',
  'nothing-usb-c-to-usb-c-cable',
  'cmf-buds-pro-2',
  'nothing-power-45w',
  'cmf-power-100w-gan',
] as const

type VirtualCollectionSlug = (typeof ALL_VIRTUAL_COLLECTION_SLUGS)[number]

const VIRTUAL_COLLECTIONS: Record<VirtualCollectionSlug, VirtualCollectionConfig> = {
  'shop-all': {
    title: 'Shop all',
    metaTitle: 'Nothing Pakistan Shop All | Chargers, Accessories and CMF',
    description: 'Browse the full Nothing Pakistan catalog for chargers, earbuds, protectors, CMF devices, and other compatible accessories.',
  },
  phones: {
    title: 'Phone models',
    metaTitle: 'Nothing Phone Models in Pakistan | Compatible Accessories | Nothing Pakistan',
    description: 'Browse Nothing phone model pages and jump into compatible chargers, protectors, earbuds, and support routes in Pakistan.',
  },
  chargers: {
    title: 'Chargers',
    metaTitle: 'Nothing Chargers in Pakistan | Nothing Pakistan',
    description: 'Shop Nothing chargers and charging cables in Pakistan with live product pages, pricing, and ordering support.',
    productTypes: ['charger', 'data_cable'],
  },
  protectors: {
    title: 'Protectors',
    metaTitle: 'Nothing Protectors in Pakistan | Nothing Pakistan',
    description: 'Browse screen protectors and protective accessories for Nothing devices in Pakistan.',
    productTypes: ['protector'],
  },
  earbuds: {
    title: 'Earbuds',
    metaTitle: 'Nothing Earbuds in Pakistan | Nothing Pakistan',
    description: 'Browse Nothing earbuds and audio accessories in Pakistan with live catalog pages and ordering support.',
    productTypes: ['earbuds'],
  },
} as const

const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  charger: 'Charger',
  data_cable: 'Cable',
  protector: 'Protector',
  earbuds: 'Audio',
}

const PRODUCT_TYPE_SEARCH_LABELS: Record<ProductType, string[]> = {
  charger: ['Nothing charger price in Pakistan', 'CMF charger Pakistan', 'GaN charger Pakistan'],
  data_cable: ['Nothing cable price in Pakistan', 'USB-C cable Pakistan', 'Nothing data cable Pakistan'],
  protector: ['Nothing screen protector Pakistan', 'Nothing phone protector price in Pakistan'],
  earbuds: ['Nothing earbuds price in Pakistan', 'CMF earbuds Pakistan', 'wireless earbuds Pakistan'],
}

const SNAPSHOT_CACHE_TTL_MS = process.env.NODE_ENV === 'development' ? 15_000 : 120_000
let snapshotCache: { value: CatalogSnapshot; expiresAt: number } | null = null
let snapshotInFlight: Promise<CatalogSnapshot> | null = null

const PRODUCT_PRICE_OVERRIDES: Record<string, number> = {
  'cmf-buds-pro-2': 13000,
  'cmf-buds-2': 16000,
  'cmf-buds-2-plus': 15000,
  'cmf-buds-2a': 11000,
  'cmf-power-65w-gan': 6500,
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

function resolveProductPrice(slug: string, price: number | null | undefined): number | null {
  return PRODUCT_PRICE_OVERRIDES[slug] ?? price ?? null
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

function buildProductMetaDescription(product: SupabaseProductRow, name: string, priceLabel: string | null): string {
  const productTypeLabel = product.product_type ? PRODUCT_TYPE_LABELS[product.product_type] ?? product.product_type : 'Nothing accessory'
  const priceText = priceLabel ? ` Current price: ${priceLabel}.` : ''
  const fallback =
    `Shop ${name} in Pakistan from Nothing Pakistan. Check ${productTypeLabel.toLowerCase()} details, compatibility, PKR pricing, availability, delivery, and WhatsApp support.${priceText}`

  return trimSeoDescription(product.meta_description || product.short_description || product.seo_description_long || product.description || fallback)
}

function buildMobileMetaDescription(mobile: SupabaseMobileRow): string {
  const priceLabel = formatPrice(mobile.Price)
  const priceText = priceLabel ? ` ${mobile.name} price in Pakistan is listed as ${priceLabel}.` : ''
  const fallback =
    `${mobile.name} page for Pakistan shoppers with price information, compatible Nothing accessories, chargers, protectors, earbuds, and support links.${priceText}`

  return trimSeoDescription(mobile.meta_description || mobile.seo_description_long || mobile.description || fallback)
}

function resolveAvailability(stockQuantity?: number | null): ProductDetail['availability'] {
  if (typeof stockQuantity !== 'number') {
    return 'https://schema.org/InStock'
  }

  return stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
}

function buildEntryKey(type: StoreRelatedType, id: number): string {
  return `${type}:${id}`
}

function groupByEntry<T extends { related_type: StoreRelatedType; related_id: number }>(rows: T[]): Map<string, T[]> {
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

async function readCatalogSnapshotFromSupabase(): Promise<CatalogSnapshot> {
  const supabase = getSupabaseAdminClient()

  if (!supabase) {
    return EMPTY_SNAPSHOT
  }

  const [
    productsResponse,
    mobilesResponse,
    categoriesResponse,
    categoryRelationsResponse,
    imagesResponse,
    faqsResponse,
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
    supabase
      .from('images')
      .select('id, related_type, related_id, color_id, url, alt_text, title, caption, file_name, slug, sort_order, created_at, updated_at')
      .in('related_type', [...STORE_RELATED_TYPE_ENUM])
      .order('sort_order', { ascending: true }),
    supabase
      .from('faqs')
      .select('id, related_type, related_id, question, answer, created_at, updated_at')
      .in('related_type', [...STORE_RELATED_TYPE_ENUM]),
    supabase
      .from('reviews')
      .select('id, product_id, user_name, rating, comment, created_at, updated_at')
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
    reviewsResponse,
    colorsResponse,
    productMobilesResponse,
  ]

  const failedResponse = responses.find((response) => response.error)

  if (failedResponse?.error) {
    console.error('[catalog-repository] failed to read Supabase catalog:', failedResponse.error.message)
    return EMPTY_SNAPSHOT
  }

  const products = (productsResponse.data ?? []) as SupabaseProductRow[]
  const mobiles = (mobilesResponse.data ?? []) as SupabaseMobileRow[]
  const categories = (categoriesResponse.data ?? []) as SupabaseCategoryRow[]
  const categoryRelations = (categoryRelationsResponse.data ?? []) as SupabaseCategoryRelationRow[]
  const images = (imagesResponse.data ?? []) as SupabaseImageRow[]
  const faqs = (faqsResponse.data ?? []) as SupabaseFaqRow[]
  const reviews = (reviewsResponse.data ?? []) as SupabaseReviewRow[]
  const colors = (colorsResponse.data ?? []) as SupabaseColorRow[]
  const productMobiles = (productMobilesResponse.data ?? []) as SupabaseProductMobileRow[]

  const colorsById = new Map(colors.map((row) => [row.id, row]))
  const categoriesById = new Map(categories.map((row) => [row.id, row]))
  const mobilesById = new Map(mobiles.map((row) => [row.id, row]))
  const productIdsByCategoryId = new Map<number, number[]>()
  const categoryIdsByProductId = new Map<number, number[]>()
  const mobileIdsByCategoryId = new Map<number, number[]>()
  const categoryIdsByMobileId = new Map<number, number[]>()
  const mobileIdsByProductId = new Map<number, number[]>()
  const productIdsByMobileId = new Map<number, number[]>()
  const reviewsByProductId = new Map<number, SupabaseReviewRow[]>()

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

  for (const review of reviews) {
    if (!review.product_id) continue
    const productReviews = reviewsByProductId.get(review.product_id) ?? []
    productReviews.push(review)
    reviewsByProductId.set(review.product_id, productReviews)
  }

  return {
    products,
    mobiles,
    categories,
    categoryRelations,
    productMobiles,
    images,
    faqs,
    reviews,
    colorsById,
    categoriesById,
    mobilesById,
    productIdsByCategoryId,
    categoryIdsByProductId,
    mobileIdsByCategoryId,
    categoryIdsByMobileId,
    mobileIdsByProductId,
    productIdsByMobileId,
    imagesByEntryKey: groupByEntry(images as Array<SupabaseImageRow & { related_type: StoreRelatedType }>),
    faqsByEntryKey: groupByEntry(faqs as Array<SupabaseFaqRow & { related_type: StoreRelatedType }>),
    reviewsByProductId,
  }
}

async function getCatalogSnapshot(): Promise<CatalogSnapshot> {
  const now = Date.now()

  if (snapshotCache && snapshotCache.expiresAt > now) {
    return snapshotCache.value
  }

  if (snapshotInFlight) {
    return snapshotInFlight
  }

  snapshotInFlight = readCatalogSnapshotFromSupabase()
    .then((snapshot) => {
      snapshotCache = { value: snapshot, expiresAt: Date.now() + SNAPSHOT_CACHE_TTL_MS }
      return snapshot
    })
    .finally(() => {
      snapshotInFlight = null
    })

  return snapshotInFlight
}

function getTopLevelCategories(snapshot: CatalogSnapshot): SupabaseCategoryRow[] {
  return snapshot.categories.filter((category) => category.parent_id === null)
}

function getChildCategories(snapshot: CatalogSnapshot, parentId: number): SupabaseCategoryRow[] {
  return snapshot.categories.filter((category) => category.parent_id === parentId)
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
    .map((productId) => snapshot.products.find((product) => product.id === productId))
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
    .map((slug) => snapshot.products.find((product) => product.slug === slug))
    .filter((product): product is SupabaseProductRow => Boolean(product))
    .map((product) => buildProductCard(product, snapshot))
}

function getOrderedCategoryProductCards(snapshot: CatalogSnapshot, slug: string, fallbackSlugs: readonly string[]): Product[] {
  const category = snapshot.categories.find((item) => item.slug === slug)

  if (!category) {
    return getCatalogCardsForProductSlugs(snapshot, fallbackSlugs)
  }

  const productIds = snapshot.productIdsByCategoryId.get(category.id) ?? []
  const products = productIds
    .map((productId) => snapshot.products.find((product) => product.id === productId))
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

function getProductFaqs(snapshot: CatalogSnapshot, productId: number): SupabaseFaqRow[] {
  return snapshot.faqsByEntryKey.get(buildEntryKey('product', productId)) ?? []
}

function getMobileFaqs(snapshot: CatalogSnapshot, mobileId: number): SupabaseFaqRow[] {
  return snapshot.faqsByEntryKey.get(buildEntryKey('mobile', mobileId)) ?? []
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
  const price = resolveProductPrice(product.slug, product.price)
  const priceLabel = formatPrice(price)

  return {
    id: `product-${product.id}`,
    name,
    handle: product.slug,
    href: `/products/${product.slug}`,
    image: images[0]?.url ?? null,
    description: buildProductMetaDescription(product, name, priceLabel),
    variant: mainColor?.name ?? images[0]?.caption ?? null,
    price,
    priceLabel,
    kind: 'product',
    subtitle: categories[0]?.name ?? typeLabel,
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
    updatedAt: mobile.updated_at,
  }
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
    alt: image.alt_text || fallbackAltText || image.title || image.caption || name,
    title: image.title,
    caption: image.caption,
    colorName: image.color_id ? colorsById.get(image.color_id)?.name ?? null : null,
    colorHex: image.color_id ? colorsById.get(image.color_id)?.hex_code ?? null : null,
    slug: image.slug,
  }))
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

function buildReviews(snapshot: CatalogSnapshot, productId: number): ProductDetailReview[] {
  const reviews = snapshot.reviewsByProductId.get(productId) ?? []

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
      .map((productId) => snapshot.products.find((product) => product.id === productId))
      .filter((product): product is SupabaseProductRow => Boolean(product)),
  )

  const groupedProducts = linkedProducts.map((product) => ({
    product,
    card: buildProductCard(product, snapshot),
  }))

  const protectors = groupedProducts
    .filter(({ product }) => product.product_type === 'protector')
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
    .filter(({ product }) => !product.product_type)
    .map(({ card }) => card)
    .sort((left, right) => left.name.localeCompare(right.name))

  const groups: MobileAccessoryGroup[] = [
    { id: 'protectors', title: 'Related Protectors', products: protectors },
    { id: 'chargers', title: 'Related Charger and Cables', products: chargers },
    { id: 'earbuds', title: 'Related Earbuds', products: earbuds },
    { id: 'accessories', title: 'Other Accessories', products: accessories },
  ]

  return groups.filter((group) => group.products.length > 0)
}

function buildProductDetailFromProduct(product: SupabaseProductRow, snapshot: CatalogSnapshot): ProductDetail {
  const images = getProductImages(snapshot, product.id)
  const faqs = getProductFaqs(snapshot, product.id)
  const categories = getProductCategories(snapshot, product.id)
  const collections = buildProductCollections(categories, snapshot)
  const variants = buildVariants(images, snapshot, product.slug)
  const canonicalPath = `/products/${product.slug}`
  const mainColor = product.main_color_id ? snapshot.colorsById.get(product.main_color_id) ?? null : null
  const name = normalizeProductName(product.name)
  const reviews = buildReviews(snapshot, product.id)
  const price = resolveProductPrice(product.slug, product.price)
  const priceLabel = formatPrice(price)
  const metaDescription = buildProductMetaDescription(product, name, priceLabel)
  const gallery = buildGallery(name, images, snapshot, product.image_alt_text || `${name} price in Pakistan`)

  return {
    id: `product-${product.id}`,
    entityType: 'product',
    handle: product.slug,
    name,
    brandName: resolveBrandName(name),
    pageTitle: product.meta_title || name,
    summary: product.short_description || metaDescription,
    metaDescription,
    seoKeywords: buildProductSearchKeywords(name, product.product_type, product.seo_keywords),
    schemaJson: product.schema_json,
    description: product.seo_description_long || product.description,
    sourceHref: canonicalPath,
    sourceUrl: buildAbsoluteUrl(canonicalPath),
    canonicalUrl: product.canonical_url || buildAbsoluteUrl(canonicalPath),
    ogImage: images[0]?.url ?? null,
    primaryImage: images[0]?.url ?? null,
    gallery,
    collectionSlugs: collections.map((collection) => collection.slug),
    collections,
    variantUrls: images.map((image) => image.url),
    variants,
    heroImages: images.map((image) => image.url),
    widgets: buildWidgets('product', product.product_type, images, snapshot, product.stock_quantity),
    price,
    priceLabel,
    stockQuantity: product.stock_quantity,
    availability: resolveAvailability(product.stock_quantity),
    createdAt: product.created_at,
    updatedAt: product.updated_at,
    specs: buildDetailSpecs('product', collections, images, snapshot, [
      ['Type', product.product_type ? PRODUCT_TYPE_LABELS[product.product_type] ?? product.product_type : null],
      ['Main colour', mainColor?.name],
      ['Stock', typeof product.stock_quantity === 'number' ? `${product.stock_quantity} units available` : null],
      ['Updated', formatCatalogDate(product.updated_at)],
    ]),
    faqs: buildFaqs(faqs, name, priceLabel),
    reviews,
    relatedMobiles: buildRelatedMobiles(snapshot, product.id),
    breadcrumbItems: buildBreadcrumbItems(categories, snapshot, 'product'),
    aggregateRating: buildAggregateRating(reviews),
  }
}

function buildProductDetailFromMobile(mobile: SupabaseMobileRow, snapshot: CatalogSnapshot): ProductDetail {
  const images = getMobileImages(snapshot, mobile.id)
  const faqs = getMobileFaqs(snapshot, mobile.id)
  const categories = getMobileCategories(snapshot, mobile.id)
  const collections = buildProductCollections(categories, snapshot)
  const canonicalPath = `/products/${mobile.slug}`
  const metaDescription = buildMobileMetaDescription(mobile)
  const gallery = buildGallery(mobile.name, images, snapshot, mobile.image_alt_text || `${mobile.name} price in Pakistan`)

  return {
    id: `mobile-${mobile.id}`,
    entityType: 'mobile',
    handle: mobile.slug,
    name: mobile.name,
    brandName: resolveBrandName(mobile.name),
    pageTitle: mobile.meta_title || mobile.name,
    summary: metaDescription,
    metaDescription,
    seoKeywords: buildMobileSearchKeywords(mobile.name, mobile.seo_keywords),
    schemaJson: mobile.schema_json,
    description: mobile.seo_description_long || mobile.description,
    sourceHref: canonicalPath,
    sourceUrl: buildAbsoluteUrl(canonicalPath),
    canonicalUrl: mobile.canonical_url || buildAbsoluteUrl(canonicalPath),
    ogImage: images[0]?.url ?? null,
    primaryImage: images[0]?.url ?? null,
    gallery,
    collectionSlugs: collections.map((collection) => collection.slug),
    collections,
    variantUrls: images.map((image) => image.url),
    variants: buildVariants(images, snapshot, mobile.slug),
    heroImages: images.map((image) => image.url),
    widgets: buildWidgets('mobile', null, images, snapshot),
    price: mobile.Price,
    priceLabel: formatPrice(mobile.Price),
    stockQuantity: null,
    availability: resolveAvailability(),
    createdAt: mobile.created_at,
    updatedAt: mobile.updated_at,
    specs: buildDetailSpecs('mobile', collections, images, snapshot, [
      ['Release date', formatCatalogDate(mobile.release_date)],
      ['Updated', formatCatalogDate(mobile.updated_at)],
    ]),
    faqs: buildFaqs(faqs, mobile.name, formatPrice(mobile.Price)),
    reviews: [],
    relatedMobiles: [],
    breadcrumbItems: buildBreadcrumbItems(categories, snapshot, 'mobile'),
    aggregateRating: null,
  }
}

function getVirtualCollectionProducts(slug: VirtualCollectionSlug, snapshot: CatalogSnapshot): Product[] {
  if (slug === 'shop-all') {
    const productCards = snapshot.products.map((product) => buildProductCard(product, snapshot))

    return sortCatalogCards(productCards)
  }

  if (slug === 'phones') {
    return sortCatalogCards(snapshot.mobiles.map((mobile) => buildMobileCard(mobile, snapshot)))
  }

  const productTypes = VIRTUAL_COLLECTIONS[slug].productTypes ?? []

  return sortCatalogCards(
    snapshot.products
      .filter((product) => product.product_type && productTypes.includes(product.product_type))
      .map((product) => buildProductCard(product, snapshot)),
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
  const snapshot = await getCatalogSnapshot()
  const shopAllProducts = sortCatalogCards(getVirtualCollectionProducts('shop-all', snapshot))
  const phoneProducts = sortHomeShowcaseCards(getVirtualCollectionProducts('phones', snapshot))
  const trendingPicks = getOrderedCategoryProductCards(snapshot, 'trending-picks', TRENDING_PICK_PRODUCT_SLUGS)

  return {
    phoneModels: phoneProducts,
    shopAllProducts,
    trendingPicks,
  }
}

export async function getNavigationMenuItems(): Promise<NavigationItem[]> {
  const snapshot = await getCatalogSnapshot()
  const topLevelCategories = getTopLevelCategories(snapshot)

  return [
    buildVirtualNavigationItem('shop-all', VIRTUAL_COLLECTIONS['shop-all'].title, VIRTUAL_COLLECTIONS['shop-all'].description),
    buildVirtualNavigationItem('phones', VIRTUAL_COLLECTIONS.phones.title, VIRTUAL_COLLECTIONS.phones.description),
    buildVirtualNavigationItem('chargers', VIRTUAL_COLLECTIONS.chargers.title, VIRTUAL_COLLECTIONS.chargers.description, 'accessories'),
    ...topLevelCategories.map((category) => buildNavigationItem(category, snapshot)),
  ]
}

export async function getAllCollectionSlugs(): Promise<string[]> {
  const snapshot = await getCatalogSnapshot()

  return [...ALL_VIRTUAL_COLLECTION_SLUGS, ...snapshot.categories.map((category) => category.slug)]
}

export async function getAllProductHandles(): Promise<string[]> {
  const snapshot = await getCatalogSnapshot()

  return [...snapshot.products.map((product) => product.slug), ...snapshot.mobiles.map((mobile) => mobile.slug)]
}

function getCollectionHeroImage(products: Product[]): string | null {
  return products.find((product) => product.image)?.image ?? null
}

function getCollectionUpdatedAt(products: Product[], fallbackValue: string | null | undefined): string | null {
  return getLatestTimestamp([fallbackValue, ...products.map((product) => product.updatedAt)])
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
    const products = getCatalogCardsForCategoryIds(snapshot, categoryTreeIds)
    const relationTimestamps = snapshot.categoryRelations
      .filter((relation) => categoryTreeIds.includes(relation.category_id))
      .map((relation) => relation.updated_at || relation.created_at)

    if (products.length === 0) {
      continue
    }

    entries.push({
      slug: category.slug,
      title: category.name,
      description: category.meta_description || category.seo_description_long || null,
      image: getCollectionHeroImage(products),
      updatedAt: getLatestTimestamp([category.updated_at, ...relationTimestamps, ...products.map((product) => product.updatedAt)]),
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
    const reviews = snapshot.reviewsByProductId.get(product.id) ?? []
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
      .map((productId) => snapshot.products.find((product) => product.id === productId))
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
  const snapshot = await getCatalogSnapshot()

  if (isVirtualCollectionSlug(slug)) {
    return buildVirtualCollection(slug, snapshot)
  }

  const category = snapshot.categories.find((item) => item.slug === slug)

  if (!category) {
    return null
  }

  const categoryTreeIds = getCategoryTreeIds(snapshot, category.id)
  const products = getCatalogCardsForCategoryIds(snapshot, categoryTreeIds)
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

export async function getProductDetailByHandle(handle: string): Promise<ProductDetail | null> {
  const snapshot = await getCatalogSnapshot()
  const product = snapshot.products.find((item) => item.slug === handle)

  if (product) {
    return buildProductDetailFromProduct(product, snapshot)
  }

  const mobile = snapshot.mobiles.find((item) => item.slug === handle)

  if (mobile) {
    return buildProductDetailFromMobile(mobile, snapshot)
  }

  return null
}

export async function getMobileAccessoryGroupsByHandle(handle: string): Promise<MobileAccessoryGroup[]> {
  const snapshot = await getCatalogSnapshot()
  const mobile = snapshot.mobiles.find((item) => item.slug === handle)

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
      alt: 'Nothing Pakistan support',
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
      alt: image.alt_text || image.title || image.caption || 'Nothing Pakistan support',
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
    alt: 'Nothing Pakistan support',
  }
}
