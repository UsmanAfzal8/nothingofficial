import type { ProductDetailSpecGroup } from '@/lib/models/product-detail'

export const COMPARISON_FAMILIES = ['mobile', 'earbuds', 'headphones', 'watch', 'charger'] as const

export type ComparisonFamily = (typeof COMPARISON_FAMILIES)[number]

export interface ComparisonCandidate {
  key: string
  entityType: 'product' | 'mobile'
  entityId: number
  family: ComparisonFamily
  handle: string
  name: string
  summary: string | null
  image: string | null
  imageAlt: string
  price: number | null
  priceLabel: string | null
  originalPrice: number | null
  originalPriceLabel: string | null
  warrantyYears: number | null
  sortPriority: number | null
}

export interface ComparisonProduct extends ComparisonCandidate {
  specGroups: ProductDetailSpecGroup[]
}

export interface ProductComparisonData {
  candidates: ComparisonCandidate[]
  left: ComparisonProduct
  right: ComparisonProduct
}
