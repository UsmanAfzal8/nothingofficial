import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('browser, server and storefront copy use the centralized 6% government tax', async () => {
  const pricing = await readFile(new URL('../lib/data/checkout-pricing.ts', import.meta.url), 'utf8')
  const form = await readFile(new URL('../components/OrderForm.tsx', import.meta.url), 'utf8')
  const route = await readFile(new URL('../app/api/orders/route.ts', import.meta.url), 'utf8')
  const collection = await readFile(new URL('../app/collections/[slug]/page.tsx', import.meta.url), 'utf8')

  assert.match(pricing, /GOVT_TAX_RATE = 0\.06/)
  assert.match(pricing, /GOVT_TAX_PERCENT = 6/)
  for (const source of [form, route, collection]) {
    assert.match(source, /GOVT_TAX_PERCENT/)
  }
  for (const source of [form, route]) {
    assert.match(source, /GOVT_TAX_RATE/)
    assert.doesNotMatch(source, /GOVT_TAX_RATE = 0\.04/)
  }
})
