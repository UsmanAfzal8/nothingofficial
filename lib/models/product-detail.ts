import type { CollectionSlug } from '@/lib/models/catalog'

export interface ProductDetailWidget {
  id: string
  text: string
}

export interface ProductDetailMedia {
  id: string
  url: string
  alt: string
  title?: string | null
  caption?: string | null
  colorName?: string | null
  colorHex?: string | null
  slug?: string | null
}

export interface ProductDetailFaq {
  id: string
  question: string
  answer: string
}

export interface ProductDetailCollection {
  slug: string
  title: string
  parentSlug?: string | null
  parentTitle?: string | null
}

export interface ProductDetailRelatedItem {
  id: string
  name: string
  slug: string
  image: string | null
  priceLabel?: string | null
  subtitle?: string | null
}

export interface ProductDetailSpec {
  id: string
  label: string
  value: string
}

export interface ProductDetailReview {
  id: string
  userName: string
  rating: number | null
  comment?: string | null
  createdAt?: string | null
}

export interface ProductDetailVariant {
  id: string
  label: string
  href: string
}

export interface ProductDetailBreadcrumbItem {
  label: string
  href: string
}

export interface ProductDetailAggregateRating {
  ratingValue: number
  reviewCount: number
}

export interface ProductDetail {
  id: string
  entityType: 'product' | 'mobile'
  handle: string
  name: string
  brandName: string
  pageTitle: string
  summary?: string | null
  metaDescription?: string | null
  seoKeywords?: string[]
  schemaJson?: Record<string, unknown> | null
  description?: string | null
  sourceHref: string
  sourceUrl: string
  canonicalUrl: string
  ogImage: string | null
  primaryImage: string | null
  productBackgroundImage?: ProductDetailMedia | null
  gallery: ProductDetailMedia[]
  collectionSlugs: CollectionSlug[]
  collections: ProductDetailCollection[]
  variantUrls: string[]
  variants: ProductDetailVariant[]
  heroImages: string[]
  widgets: ProductDetailWidget[]
  price?: number | null
  priceLabel?: string | null
  stockQuantity?: number | null
  availability: 'https://schema.org/InStock' | 'https://schema.org/OutOfStock' | 'https://schema.org/PreOrder'
  createdAt?: string | null
  updatedAt?: string | null
  specs?: ProductDetailSpec[]
  faqs?: ProductDetailFaq[]
  reviews?: ProductDetailReview[]
  relatedMobiles?: ProductDetailRelatedItem[]
  breadcrumbItems: ProductDetailBreadcrumbItem[]
  aggregateRating?: ProductDetailAggregateRating | null
}
