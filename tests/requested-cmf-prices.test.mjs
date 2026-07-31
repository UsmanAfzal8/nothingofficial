import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('../lib/data/product-pricing.ts', import.meta.url), 'utf8')

const expected = [
  ['nothing-pakistan-cmf-power-65w-gan', 10999, 15999, null, null],
  ['nothing-pakistan-cmf-buds-pro-2', 16499, 21499, 6, 18499],
  ['nothing-pakistan-cmf-buds-2-plus', 14999, 19999, 6, 16999],
  ['nothing-pakistan-cmf-watch-3-pro', 27999, 32999, 6, 29999],
  ['nothing-pakistan-cmf-watch-pro', 14499, 19499, 6, 16499],
]

test('requested CMF price rules are exact', () => {
  for (const [handle, price, originalPrice, warrantyMonths, warrantyPrice] of expected) {
    const rule = `'${handle}': { price: ${price}, originalPrice: ${originalPrice}, warrantyMonths: ${warrantyMonths}, warrantyPrice: ${warrantyPrice} }`
    assert.ok(source.includes(rule), `missing exact rule for ${handle}`)
  }
})

test('every original price and warranty price follows the approved offset', () => {
  for (const [, price, originalPrice, warrantyMonths, warrantyPrice] of expected) {
    assert.equal(originalPrice, price + 5000)
    assert.equal(warrantyPrice, warrantyMonths ? price + 2000 : null)
  }
})
