export const SUPABASE_PUBLIC_SCHEMA = 'public' as const

export const RELATED_TYPE_ENUM = ['product', 'blog', 'review', 'category', 'mobile', 'detail_mobile', 'detail_product'] as const
export type RelatedType = (typeof RELATED_TYPE_ENUM)[number]
export const STORE_RELATED_TYPE_ENUM = ['product', 'mobile'] as const
export const DETAIL_IMAGE_RELATED_TYPE_ENUM = ['detail_mobile', 'detail_product'] as const

export const PAYMENT_STATUS_ENUM = ['pending', 'paid', 'failed'] as const
export type PaymentStatus = (typeof PAYMENT_STATUS_ENUM)[number]

export const ORDER_STATUS_ENUM = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const
export type OrderStatus = (typeof ORDER_STATUS_ENUM)[number]

export const PRODUCT_TYPE_ENUM = ['charger', 'data_cable', 'protector', 'earbuds', 'covers', 'screen_protector'] as const
export type ProductType = (typeof PRODUCT_TYPE_ENUM)[number]

export type StoreRelatedType = Extract<RelatedType, 'product' | 'mobile'>
export type DetailImageRelatedType = Extract<RelatedType, 'detail_mobile' | 'detail_product'>
export type StoreImageRelatedType = StoreRelatedType | DetailImageRelatedType
