export type CartItemEntityType = 'product' | 'mobile'

export interface CartItemInput {
  handle: string
  name: string
  image: string | null
  price: number | null
  priceLabel?: string | null
  subtitle?: string | null
  entityType: CartItemEntityType
}

export interface CartItem extends CartItemInput {
  quantity: number
}
