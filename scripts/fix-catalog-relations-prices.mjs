import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnvFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8')
    for (const line of content.split(/\r?\n/)) {
      const trimmedLine = line.trim()
      if (!trimmedLine || trimmedLine.startsWith('#') || !trimmedLine.includes('=')) continue
      const [key, ...valueParts] = trimmedLine.split('=')
      const value = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '')
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // Shell env vars can provide credentials.
  }
}

loadEnvFile(resolve(process.cwd(), '.env.local'))
loadEnvFile(resolve(process.cwd(), 'env'))
loadEnvFile(resolve(process.cwd(), '.env'))

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const normalizePrice = (value) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 && value % 50 === 0
    ? value - 1
    : value

function inferCategorySlugs(item, relatedType) {
  const haystack = `${item.name ?? ''} ${item.slug ?? ''} ${item.product_type ?? ''}`.toLowerCase()
  const slugs = new Set()

  if (/\bcmf\b/.test(haystack)) slugs.add('cmf')
  if (relatedType === 'mobile' || /\b(phone|mobile)\b/.test(haystack)) slugs.add('phones')
  if (/\b(buds|earbuds|ear|headphone|audio)\b/.test(haystack)) slugs.add('earbuds')
  if (/\bwatch\b/.test(haystack)) {
    slugs.add('watches')
    slugs.add('accessories')
  }
  if (/\bcharger|gan|power\b/.test(haystack)) {
    slugs.add('chargers')
    slugs.add('accessories')
  }
  if (/\bcable|usb-c|data_cable\b/.test(haystack)) {
    slugs.add('chargers')
    slugs.add('accessories')
  }
  if (/\bprotector|glass|privacy|sheet\b/.test(haystack)) {
    slugs.add('protectors')
    slugs.add('accessories')
  }
  if (/\bcase|cover\b/.test(haystack)) slugs.add('accessories')
  if (slugs.size === 0 && relatedType === 'product') slugs.add('accessories')

  return [...slugs]
}

async function fetchRows(table, columns) {
  const { data, error } = await supabase.from(table).select(columns)
  if (error) throw new Error(`${table}: ${error.message}`)
  return data ?? []
}

async function updatePrice(table, id, column, value) {
  const { error } = await supabase.from(table).update({ [column]: value }).eq('id', id)
  if (error) throw new Error(`Failed updating ${table} ${id}: ${error.message}`)
}

async function main() {
  const [categories, products, mobiles, relations] = await Promise.all([
    fetchRows('categories', 'id,name,slug'),
    fetchRows('products', 'id,name,slug,product_type,price'),
    fetchRows('mobiles', 'id,name,slug,Price'),
    fetchRows('category_relations', 'category_id,related_type,related_id'),
  ])

  const categoryIdBySlug = new Map(categories.map((category) => [category.slug, category.id]))
  const existingRelations = new Set(relations.map((relation) => `${relation.category_id}:${relation.related_type}:${relation.related_id}`))
  const relationRows = []

  for (const product of products) {
    for (const slug of inferCategorySlugs(product, 'product')) {
      const categoryId = categoryIdBySlug.get(slug)
      const key = `${categoryId}:product:${product.id}`
      if (categoryId && !existingRelations.has(key)) relationRows.push({ category_id: categoryId, related_type: 'product', related_id: product.id })
    }
  }

  for (const mobile of mobiles) {
    for (const slug of inferCategorySlugs(mobile, 'mobile')) {
      const categoryId = categoryIdBySlug.get(slug)
      const key = `${categoryId}:mobile:${mobile.id}`
      if (categoryId && !existingRelations.has(key)) relationRows.push({ category_id: categoryId, related_type: 'mobile', related_id: mobile.id })
    }
  }

  if (relationRows.length > 0) {
    const { error } = await supabase.from('category_relations').insert(relationRows)
    if (error) throw new Error(`Failed inserting category relations: ${error.message}`)
  }

  let productPriceUpdates = 0
  for (const product of products) {
    const nextPrice = normalizePrice(product.price)
    if (nextPrice !== product.price) {
      await updatePrice('products', product.id, 'price', nextPrice)
      productPriceUpdates += 1
    }
  }

  let mobilePriceUpdates = 0
  for (const mobile of mobiles) {
    const nextPrice = normalizePrice(mobile.Price)
    if (nextPrice !== mobile.Price) {
      await updatePrice('mobiles', mobile.id, 'Price', nextPrice)
      mobilePriceUpdates += 1
    }
  }

  console.log(JSON.stringify({
    categoryRelationsAdded: relationRows.length,
    productPriceUpdates,
    mobilePriceUpdates,
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
