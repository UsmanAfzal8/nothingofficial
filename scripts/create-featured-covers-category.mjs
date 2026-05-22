import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const CATEGORY = {
  name: 'Featured Covers',
  slug: 'featured-covers',
  parentSlug: 'accessories',
  metaTitle: 'Featured Nothing Phone Covers in Pakistan | Nothing Pakistan',
  metaDescription:
    'Browse featured Nothing phone covers in Pakistan with curated styles for Phone 1, Phone 2, Phone 2a, Phone 2a Plus, Phone 3, and Phone 3a Pro.',
}

const PRODUCT_SLUGS = [
  'nothing-phone-1-black-polo-cover',
  'nothing-phone-2-blue-cover',
  'nothing-phone-1-polo-cover',
  'nothing-phone-1-gray-polo-cover',
  'nothing-phone-2a-green-cover',
  'nothing-phone-2a-black-polo-cover',
  'nothing-phone-3-brown-cover',
  'nothing-phone-3a-pro-transparent-cover',
  'nothing-phone-2-transparent-cover',
  'nothing-phone-2a-plus-transparent-cover',
]

function loadEnv() {
  for (const envPath of ['.env.local', 'env']) {
    const fullPath = path.join(ROOT, envPath)
    if (!existsSync(fullPath)) continue

    for (const line of readFileSync(fullPath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
      const separatorIndex = trimmed.indexOf('=')
      const key = trimmed.slice(0, separatorIndex)
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '')
      process.env[key] ||= value
    }
  }
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env value: ${name}`)
  return value
}

async function main() {
  loadEnv()

  const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data: parentCategory, error: parentError } = await supabase
    .from('categories')
    .select('id,slug')
    .eq('slug', CATEGORY.parentSlug)
    .single()

  if (parentError) throw parentError

  const categoryPayload = {
    name: CATEGORY.name,
    slug: CATEGORY.slug,
    meta_title: CATEGORY.metaTitle,
    meta_description: CATEGORY.metaDescription,
    parent_id: parentCategory.id,
    updated_at: new Date().toISOString(),
  }

  const { data: existingCategory, error: existingCategoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', CATEGORY.slug)
    .maybeSingle()

  if (existingCategoryError) throw existingCategoryError

  let categoryId = existingCategory?.id ?? null

  if (categoryId) {
    const { error } = await supabase.from('categories').update(categoryPayload).eq('id', categoryId)
    if (error) throw error
  } else {
    const { data, error } = await supabase.from('categories').insert(categoryPayload).select('id').single()
    if (error) throw error
    categoryId = data.id
  }

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id,slug')
    .in('slug', PRODUCT_SLUGS)

  if (productsError) throw productsError

  const productBySlug = new Map((products || []).map((product) => [product.slug, product]))
  const missingSlugs = PRODUCT_SLUGS.filter((slug) => !productBySlug.has(slug))
  if (missingSlugs.length > 0) {
    throw new Error(`Missing product slugs: ${missingSlugs.join(', ')}`)
  }

  const { error: deleteError } = await supabase.from('category_relations').delete().eq('category_id', categoryId).eq('related_type', 'product')
  if (deleteError) throw deleteError

  const rows = PRODUCT_SLUGS.map((slug) => ({
    category_id: categoryId,
    related_type: 'product',
    related_id: productBySlug.get(slug).id,
    updated_at: new Date().toISOString(),
  }))

  const { error: insertError } = await supabase.from('category_relations').insert(rows)
  if (insertError) throw insertError

  console.log(`Linked ${rows.length} products to category ${CATEGORY.slug}.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
