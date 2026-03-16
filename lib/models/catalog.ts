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
  subtitle?: string | null
  updatedAt?: string | null
}

export interface Collection {
  slug: CollectionSlug
  title: string
  metaTitle?: string | null
  metaDescription?: string | null
  description?: string | null
  sourceUrl: string
  heroImage?: string | null
  updatedAt?: string | null
  products: Product[]
  parentCollection?: NavigationItem | null
  childCollections?: NavigationItem[]
  siblingCollections?: NavigationItem[]
}

export interface HomePageSection {
  slug: string
  title: string
  description?: string | null
  href: string
  featuredProduct: Product | null
  products: Product[]
  childCollections?: NavigationItem[]
}

export interface HomePageData {
  sections: HomePageSection[]
  sectionNavigation: NavigationItem[]
  featuredProduct: Product | null
}

export interface NavigationItem {
  label: string
  href: string
  slug: string
  description?: string | null
  parentSlug?: string | null
  children?: NavigationItem[]
}
