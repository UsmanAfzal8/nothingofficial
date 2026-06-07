'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { CartItem, CartItemInput } from '@/lib/models/cart'

type CartContextValue = {
  isHydrated: boolean
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (item: CartItemInput, quantity?: number) => void
  updateQuantity: (handle: string, quantity: number) => void
  removeItem: (handle: string) => void
  clearCart: () => void
}

const STORAGE_KEY = 'nothing-pakistan-cart:v2'

const CartContext = createContext<CartContextValue | null>(null)

function normalizeQuantity(value: number): number {
  if (!Number.isFinite(value)) {
    return 1
  }

  const rounded = Math.floor(value)
  return rounded > 0 ? rounded : 1
}

function normalizeCartItem(item: CartItemInput, quantity = 1): CartItem {
  return {
    ...item,
    quantity: normalizeQuantity(quantity),
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const cartHandlesKey = useMemo(() => items.map((item) => item.handle).join('|'), [items])

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (!saved) {
        setIsHydrated(true)
        return
      }

      const parsed = JSON.parse(saved)
      if (!Array.isArray(parsed)) {
        setIsHydrated(true)
        return
      }

      const restoredItems = parsed
        .filter((item): item is CartItem => Boolean(item && typeof item === 'object' && typeof item.handle === 'string'))
        .map((item) =>
          normalizeCartItem(
            {
              handle: item.handle,
              name: item.name,
              image: item.image ?? null,
              colorName: item.colorName ?? null,
              price: typeof item.price === 'number' ? item.price : null,
              priceLabel: item.priceLabel ?? null,
              subtitle: item.subtitle ?? null,
              entityType: item.entityType === 'mobile' ? 'mobile' : 'product',
            },
            item.quantity,
          ),
        )

      setItems(restoredItems)
    } catch (error) {
      console.error('[cart] failed to restore cart:', error)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [isHydrated, items])

  useEffect(() => {
    const handles = cartHandlesKey ? cartHandlesKey.split('|') : []

    if (!isHydrated || handles.length === 0) {
      return
    }

    const controller = new AbortController()

    async function refreshLivePrices() {
      try {
        const response = await fetch('/api/cart-prices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ handles }),
          signal: controller.signal,
        })

        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as {
          items?: Array<{
            handle: string
            name?: string | null
            image?: string | null
            price?: number | null
            priceLabel?: string | null
            entityType?: 'product' | 'mobile'
          }>
        }
        const liveItemsByHandle = new Map((payload.items ?? []).map((item) => [item.handle, item]))

        setItems((currentItems) =>
          currentItems.map((item) => {
            const liveItem = liveItemsByHandle.get(item.handle)

            if (!liveItem) {
              return item
            }

            return {
              ...item,
              name: liveItem.name ?? item.name,
              image: item.image ?? liveItem.image ?? null,
              price: typeof liveItem.price === 'number' ? liveItem.price : null,
              priceLabel: liveItem.priceLabel ?? null,
              entityType: liveItem.entityType ?? item.entityType,
            }
          }),
        )
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('[cart] failed to refresh live prices:', error)
        }
      }
    }

    refreshLivePrices()

    return () => controller.abort()
  }, [cartHandlesKey, isHydrated])

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0)
    const subtotal = items.reduce((total, item) => total + (item.price ?? 0) * item.quantity, 0)

    return {
      isHydrated,
      items,
      itemCount,
      subtotal,
      addItem: (item, quantity = 1) => {
        setItems((currentItems) => {
          const nextQuantity = normalizeQuantity(quantity)
          const existingItem = currentItems.find((entry) => entry.handle === item.handle)

          if (!existingItem) {
            return [...currentItems, normalizeCartItem(item, nextQuantity)]
          }

          return currentItems.map((entry) =>
            entry.handle === item.handle
              ? {
                  ...entry,
                  quantity: entry.quantity + nextQuantity,
                  image: item.image ?? entry.image,
                  colorName: item.colorName ?? entry.colorName,
                  price: item.price ?? entry.price,
                  priceLabel: item.priceLabel ?? entry.priceLabel,
                  subtitle: item.subtitle ?? entry.subtitle,
                }
              : entry,
          )
        })
      },
      updateQuantity: (handle, quantity) => {
        const nextQuantity = Math.floor(quantity)

        setItems((currentItems) =>
          currentItems.flatMap((item) => {
            if (item.handle !== handle) {
              return [item]
            }

            if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
              return []
            }

            return [{ ...item, quantity: nextQuantity }]
          }),
        )
      },
      removeItem: (handle) => {
        setItems((currentItems) => currentItems.filter((item) => item.handle !== handle))
      },
      clearCart: () => {
        setItems([])
      },
    }
  }, [isHydrated, items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }

  return context
}
