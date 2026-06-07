import type { OrderStatus, PaymentStatus } from '@/lib/models/supabase-enums'

export interface OrderItem {
  product_handle: string | null
  product_name: string
  image_url?: string | null
  color_name?: string | null
  quantity: number
  unit_price: number
  currency?: string | null
  notes?: string | null
}

export interface Order {
  id: number
  userId: number | null
  items: OrderItem[]
  totalPrice: number | null
  shippingAddress: string | null
  billingAddress: string | null
  paymentStatus: PaymentStatus | null
  orderStatus: OrderStatus | null
  createdAt: string | null
  updatedAt: string | null
}
