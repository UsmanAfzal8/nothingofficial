import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const INPUT_PATH = path.join(ROOT, 'abc')

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

function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function titleCase(value) {
  return String(value)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (/^\d+a?$/i.test(word)) return word.toUpperCase().replace('A', 'a')
      if (word === 'cmf') return 'CMF'
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
    .replace(/\bLite\b/g, 'Lite')
    .replace(/\bPro\b/g, 'Pro')
    .replace(/\bPlus\b/g, 'Plus')
}

function parseInput() {
  const linePattern = /^"([^"]+)"\s+(.+?)\s+(\d+(?:\.\d+)?)\s*$/
  const seenSlugs = new Map()

  return readFileSync(INPUT_PATH, 'utf8')
    .split(/\r?\n/)
    .map((line, index) => ({ line: line.trim(), index }))
    .filter(({ line }) => line)
    .map(({ line, index }) => {
      const match = line.match(linePattern)
      if (!match) throw new Error(`Could not parse abc line ${index + 1}: ${line}`)

      const [, , rawName, rawPrice] = match
      const baseSlug = slugify(rawName)
      const count = (seenSlugs.get(baseSlug) || 0) + 1
      seenSlugs.set(baseSlug, count)

      return {
        name: titleCase(rawName),
        slug: count === 1 ? baseSlug : `${baseSlug}-${count}`,
        price: Number(rawPrice),
      }
    })
}

function detectMobileName(productName) {
  const lowerName = productName.toLowerCase()
  const matches = [
    ['Nothing Phone 3a Lite', 'nothing phone 3a lite'],
    ['Nothing Phone 3a Pro', 'nothing phone 3a pro'],
    ['Nothing Phone 2a Plus', 'nothing phone 2a plus'],
    ['Nothing Phone 2a', 'nothing phone 2a'],
    ['Nothing Phone 3a', 'nothing phone 3a'],
    ['Nothing Phone 3', 'nothing phone 3'],
    ['Nothing Phone 2', 'nothing phone 2'],
    ['Nothing Phone 1', 'nothing phone 1'],
    ['CMF Phone 1', 'cmf phone 1'],
  ]
  const match = matches.find(([, needle]) => lowerName.includes(needle))
  return match?.[0] || 'your Nothing phone'
}

function detectStyle(productName) {
  const lowerName = productName.toLowerCase()
  if (lowerName.includes('polo')) return 'polo-texture'
  if (lowerName.includes('transparent')) return 'transparent'
  if (lowerName.includes('black')) return 'black'
  if (lowerName.includes('brown')) return 'brown'
  if (lowerName.includes('blue')) return 'blue'
  if (lowerName.includes('pink')) return 'pink'
  if (lowerName.includes('purple')) return 'purple'
  if (lowerName.includes('green')) return 'green'
  if (lowerName.includes('gray')) return 'gray'
  return 'cover'
}

function describeStyle(style) {
  const descriptions = {
    'polo-texture': 'a textured polo-style finish for extra grip and a more premium hand feel',
    transparent: 'a clear look that keeps the phone design visible while adding daily protection',
    black: 'a clean black finish for a simple, low-maintenance everyday look',
    brown: 'a warm brown finish for a slightly more classic everyday style',
    blue: 'a blue finish that adds color without making the phone feel too loud',
    pink: 'a pink finish for a softer, brighter accessory look',
    purple: 'a purple finish for a more expressive accessory style',
    green: 'a green finish for a fresh color option',
    gray: 'a gray finish for a neutral, minimal accessory style',
    cover: 'a practical protective finish for daily phone use',
  }
  return descriptions[style] || descriptions.cover
}

function formatPrice(price) {
  return `Rs ${price.toLocaleString('en-PK')}`
}

function buildFaqs(product) {
  const mobileName = detectMobileName(product.name)
  const style = detectStyle(product.name)
  const styleDescription = describeStyle(style)
  const price = formatPrice(product.price)

  return [
    [
      `What is the price of ${product.name} in Pakistan?`,
      `${product.name} price in Pakistan is ${price} on Nothing Official Store Pakistan. Final availability and delivery details can be confirmed before placing the order.`,
    ],
    [
      `Is ${product.name} compatible with ${mobileName}?`,
      `Yes, ${product.name} is listed for ${mobileName}. The product is linked with the matching mobile model so buyers can find the correct cover more easily.`,
    ],
    [
      `What type of cover is ${product.name}?`,
      `${product.name} is a phone cover with ${styleDescription}. It is made for everyday handling, basic back protection, and a cleaner fitted look.`,
    ],
    [
      `Does ${product.name} protect the phone from scratches?`,
      `Yes, ${product.name} helps protect the back and sides of ${mobileName} from common daily scratches, light marks, and table contact. It is still best to avoid heavy drops and sharp impact.`,
    ],
    [
      `Will ${product.name} cover the buttons and ports properly?`,
      `${product.name} is selected for the matching ${mobileName} shape, so the cutouts are intended to keep the charging port, buttons, camera area, and speaker openings usable.`,
    ],
    [
      `Is ${product.name} good for daily use?`,
      `Yes, ${product.name} is suitable for daily use if you want a simple cover for grip, scratch resistance, and easier handling without adding too much bulk.`,
    ],
    [
      `Can I order ${product.name} online in Pakistan?`,
      `Yes, you can order ${product.name} online from Nothing Official Store Pakistan. You can also use WhatsApp support to confirm live stock, current price, and delivery coverage before checkout.`,
    ],
    [
      `Does Nothing Official Store Pakistan deliver ${product.name} across Pakistan?`,
      `Nothing Official Store Pakistan supports delivery queries for ${product.name} across major cities in Pakistan, subject to stock, courier coverage, and order confirmation.`,
    ],
    [
      `How do I know this is the right cover for my phone?`,
      `Check that your phone model is ${mobileName} before ordering ${product.name}. If you are unsure about your exact model, contact support with your phone name and they can help confirm compatibility.`,
    ],
    [
      `Can I pair ${product.name} with a screen protector?`,
      `Yes, ${product.name} can be used with a compatible screen protector for better all-round daily protection. A cover protects the back and edges, while a protector helps with the front glass.`,
    ],
  ].map(([question, answer]) => ({ question, answer }))
}

async function main() {
  loadEnv()

  const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const inputProducts = parseInput()
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id,name,slug,price,product_type')
    .in(
      'slug',
      inputProducts.map((product) => product.slug),
    )

  if (productsError) throw productsError

  const productBySlug = new Map((products || []).map((product) => [product.slug, product]))
  const missingSlugs = inputProducts.map((product) => product.slug).filter((slug) => !productBySlug.has(slug))
  if (missingSlugs.length > 0) {
    throw new Error(`Missing imported cover products: ${missingSlugs.join(', ')}`)
  }

  const productIds = inputProducts.map((product) => productBySlug.get(product.slug).id)
  const { error: deleteError } = await supabase
    .from('faqs')
    .delete()
    .eq('related_type', 'product')
    .in('related_id', productIds)
  if (deleteError) throw deleteError

  const now = new Date().toISOString()
  const rows = inputProducts.flatMap((inputProduct) => {
    const product = productBySlug.get(inputProduct.slug)
    return buildFaqs({ ...inputProduct, ...product, price: Number(product.price || inputProduct.price) }).map((faq) => ({
      related_type: 'product',
      related_id: product.id,
      question: faq.question,
      answer: faq.answer,
      updated_at: now,
    }))
  })

  const { error: insertError } = await supabase.from('faqs').insert(rows)
  if (insertError) throw insertError

  console.log(`Inserted ${rows.length} FAQs for ${inputProducts.length} cover products.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
