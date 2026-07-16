export const COD_SHIPPING_FEE = 600
export const BANK_TRANSFER_SHIPPING_FEE = 400
export const BANK_TRANSFER_FREE_SHIPPING_MINIMUM = 5000

export function getShippingFee({
  subtotal,
  paymentMethod,
  deliveryType,
}: {
  subtotal: number
  paymentMethod: 'cod' | 'bank_transfer'
  deliveryType: 'ship' | 'pickup'
}): number {
  if (deliveryType === 'pickup') return 0
  if (paymentMethod === 'cod') return COD_SHIPPING_FEE

  return subtotal < BANK_TRANSFER_FREE_SHIPPING_MINIMUM ? BANK_TRANSFER_SHIPPING_FEE : 0
}
