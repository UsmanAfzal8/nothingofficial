import type { OrderStatus, PaymentStatus, ProductType, RelatedType } from '@/lib/models/supabase-enums'
export type { StoreRelatedType } from '@/lib/models/supabase-enums'

export interface SupabaseCategoryRow {
  id: number
  name: string
  slug: string
  meta_title: string | null
  meta_description: string | null
  parent_id: number | null
  created_at: string | null
  updated_at: string | null
}

export interface SupabaseBlogRow {
  id: number
  title: string
  slug: string
  content: string
  meta_title: string | null
  meta_description: string | null
  created_at: string | null
  updated_at: string | null
}

export interface SupabaseCategoryRelationRow {
  id: number
  category_id: number
  related_type: RelatedType
  related_id: number
  created_at: string | null
  updated_at: string | null
}

export interface SupabaseColorRow {
  id: number
  name: string
  hex_code: string | null
  created_at: string | null
  updated_at: string | null
}

export interface SupabaseImageRow {
  id: number
  related_type: RelatedType
  related_id: number
  color_id: number | null
  url: string
  alt_text: string | null
  title: string | null
  caption: string | null
  file_name: string | null
  slug: string | null
  sort_order: number
  created_at: string | null
  updated_at: string | null
}

export interface SupabaseFaqRow {
  id: number
  related_type: RelatedType
  related_id: number
  question: string
  answer: string
  created_at: string | null
  updated_at: string | null
}

export interface SupabaseProductRow {
  id: number
  name: string
  slug: string
  description: string | null
  short_description: string | null
  meta_title: string | null
  meta_description: string | null
  price: number | null
  stock_quantity: number | null
  main_color_id: number | null
  created_at: string | null
  updated_at: string | null
  product_type: ProductType | null
}

export interface SupabaseMobileRow {
  id: number
  name: string
  slug: string
  description: string | null
  meta_title: string | null
  meta_description: string | null
  piority: number | null
  release_date: string | null
  created_at: string | null
  updated_at: string | null
  Price: number | null
}

export interface SupabaseOrderRow {
  id: number
  user_id: number | null
  items: Record<string, unknown>
  total_price: number | null
  shipping_address: string | null
  billing_address: string | null
  payment_status: PaymentStatus | null
  order_status: OrderStatus | null
  created_at: string | null
  updated_at: string | null
}

export interface SupabaseUserRow {
  id: number
  name: string
  phone: string | null
  created_at: string | null
  updated_at: string | null
  Address: string | null
  'Postal Code': string | null
  City: string | null
}

export interface SupabaseReviewRow {
  id: number
  product_id: number | null
  user_name: string
  rating: number | null
  comment: string | null
  created_at: string | null
  updated_at: string | null
}

export interface SupabaseProductMobileRow {
  id: number
  product_id: number | null
  mobile_id: number | null
  created_at: string | null
}
