import type { CollectionSlug } from '@/lib/models/catalog'
import type { ComparisonFamily } from '@/lib/models/comparison'

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
  section?: string | null
  label: string
  value: string
}

export interface ProductDetailSpecGroup {
  id: string
  title: string
  subtitle?: string | null
  iconKey?: string | null
  mediaUrl?: string | null
  mediaAlt?: string | null
  mediaType?: string | null
  mediaPosition?: string | null
  defaultOpen: boolean
  sortOrder: number
  specs: ProductDetailSpec[]
}

export interface ProductFeatureSlide {
  id: string
  sourceKey?: string | null
  title: string
  body?: string | null
  mediaType: 'image' | 'video'
  imageUrl?: string | null
  videoPlaybackId?: string | null
  videoUrl?: string | null
  thumbnailUrl?: string | null
  sortOrder: number
}

export interface ProductFeatureSection {
  id: string
  sourceKey?: string | null
  featureKey: string
  featureTitle: string
  featureVersion?: string | null
  title: string
  displayContext: 'mobile' | 'desktop' | 'all'
  coverImageUrl?: string | null
  coverVideoPlaybackId?: string | null
  coverVideoUrl?: string | null
  coverThumbnailUrl?: string | null
  sortOrder: number
  slides: ProductFeatureSlide[]
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
  comparisonFamily: ComparisonFamily | null
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
  productBackgroundImages?: ProductDetailMedia[]
  gallery: ProductDetailMedia[]
  collectionSlugs: CollectionSlug[]
  collections: ProductDetailCollection[]
  variantUrls: string[]
  variants: ProductDetailVariant[]
  heroImages: string[]
  widgets: ProductDetailWidget[]
  price?: number | null
  priceLabel?: string | null
  originalPrice?: number | null
  originalPriceLabel?: string | null
  warrantyYears?: number | null
  warrantyMonths?: number | null
  warrantyPrice?: number | null
  warrantyPriceLabel?: string | null
  stockQuantity?: number | null
  availability: 'https://schema.org/InStock' | 'https://schema.org/OutOfStock' | 'https://schema.org/PreOrder'
  createdAt?: string | null
  updatedAt?: string | null
  specs?: ProductDetailSpec[]
  specGroups?: ProductDetailSpecGroup[]
  productFeatureSections?: ProductFeatureSection[]
  faqs?: ProductDetailFaq[]
  reviews?: ProductDetailReview[]
  relatedMobiles?: ProductDetailRelatedItem[]
  breadcrumbItems: ProductDetailBreadcrumbItem[]
  aggregateRating?: ProductDetailAggregateRating | null
}
