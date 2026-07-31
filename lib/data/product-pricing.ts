export type ProductPriceRule = {
  price: number
  originalPrice: number
  warrantyMonths: number | null
  warrantyPrice: number | null
}

const PRODUCT_PRICE_RULES: Record<string, ProductPriceRule> = {
  'nothing-pakistan-cmf-power-65w-gan': { price: 10999, originalPrice: 15999, warrantyMonths: null, warrantyPrice: null },
  'nothing-pakistan-cmf-buds-pro-2': { price: 16499, originalPrice: 21499, warrantyMonths: 6, warrantyPrice: 18499 },
  'nothing-pakistan-cmf-buds-2-plus': { price: 14999, originalPrice: 19999, warrantyMonths: 6, warrantyPrice: 16999 },
  'nothing-pakistan-cmf-watch-3-pro': { price: 27999, originalPrice: 32999, warrantyMonths: 6, warrantyPrice: 29999 },
  'nothing-pakistan-cmf-watch-pro': { price: 14499, originalPrice: 19499, warrantyMonths: 6, warrantyPrice: 16499 },
}

export function getProductPriceRule(handle: string | null | undefined): ProductPriceRule | null {
  return handle ? PRODUCT_PRICE_RULES[handle] ?? null : null
}
