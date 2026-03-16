'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/components/CartProvider'
import type { CartItemInput } from '@/lib/models/cart'

type AddToCartButtonProps = {
  item: CartItemInput
  className?: string
}

export function AddToCartButton({ item, className }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [wasAdded, setWasAdded] = useState(false)

  useEffect(() => {
    if (!wasAdded) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setWasAdded(false)
    }, 1800)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [wasAdded])

  return (
    <button
      type="button"
      onClick={() => {
        addItem(item)
        setWasAdded(true)
      }}
      className={
        className ||
        'inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-5 text-[10px] uppercase tracking-[0.24em] text-black/65 transition-colors hover:bg-black hover:text-white'
      }
    >
      {wasAdded ? 'Added to cart' : 'Add to cart'}
    </button>
  )
}
