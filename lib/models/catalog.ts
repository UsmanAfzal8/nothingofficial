export type CollectionSlug = string

export interface Product {
  id: string
  name: string
  handle: string
  href: string
  image: string | null
  description?: string | null
  variant: string | null
  price?: number | null
  priceLabel?: string | null
  kind?: 'product' | 'mobile'
  sortPriority?: number | null
  subtitle?: string | null
  updatedAt?: string | null
}

export interface Collection {
  slug: CollectionSlug
  title: string
  metaTitle?: string | null
  metaDescription?: string | null
  description?: string | null
  canonicalUrl?: string | null
  schemaJson?: Record<string, unknown> | null
  sourceUrl: string
  heroImage?: string | null
  updatedAt?: string | null
  seoKeywords?: string[]
  products: Product[]
  parentCollection?: NavigationItem | null
  childCollections?: NavigationItem[]
  siblingCollections?: NavigationItem[]
}

export interface HomePageData {
  phoneModels: Product[]
  shopAllProducts: Product[]
  trendingPicks: Product[]
}

export interface NavigationItem {
  label: string
  href: string
  slug: string
  description?: string | null
  parentSlug?: string | null
  children?: NavigationItem[]
}
