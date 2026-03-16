export const SUPABASE_PUBLIC_SCHEMA = 'public' as const

export const RELATED_TYPE_ENUM = ['product', 'blog', 'review', 'category', 'mobile'] as const
export type RelatedType = (typeof RELATED_TYPE_ENUM)[number]
export const STORE_RELATED_TYPE_ENUM = ['product', 'mobile'] as const

export const PAYMENT_STATUS_ENUM = ['pending', 'paid', 'failed'] as const
export type PaymentStatus = (typeof PAYMENT_STATUS_ENUM)[number]

export const ORDER_STATUS_ENUM = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const
export type OrderStatus = (typeof ORDER_STATUS_ENUM)[number]

export const PRODUCT_TYPE_ENUM = ['charger', 'data_cable', 'protector', 'earbuds'] as const
export type ProductType = (typeof PRODUCT_TYPE_ENUM)[number]

export type StoreRelatedType = Extract<RelatedType, 'product' | 'mobile'>
