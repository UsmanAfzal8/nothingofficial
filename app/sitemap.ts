import { statSync } from 'node:fs'
import { join } from 'node:path'
import type { MetadataRoute } from 'next'
import categories from '@/database/categories.json'
import mobileProducts from '@/database/mobile.json'
import storeProducts from '@/database/prodcuts.json'
import { allPolicies } from '@/lib/data/policies'
import { buildAbsoluteUrl, isPreviewDeployment } from '@/lib/utils/seo'

type SitemapItem = MetadataRoute.Sitemap[number]
type SourceItem = {
  name: string
  slug: string
}

type RouteConfig = {
  slug: string
  priority: number
  changeFrequency: SitemapItem['changeFrequency']
}

const categoriesSource = categories as SourceItem[]
const mobileSource = mobileProducts as SourceItem[]

const collectionSourceFiles = {
  virtual: getFileModifiedTime('categories.json'),
  categories: getFileModifiedTime('categories.json'),
  products: getFileModifiedTime('prodcuts.json'),
  mobiles: getFileModifiedTime('mobile.json'),
}

const fixedCollectionRoutes: RouteConfig[] = [
  { slug: 'shop-all', priority: 1, changeFrequency: 'daily' },
  { slug: 'phones', priority: 0.98, changeFrequency: 'daily' },
  { slug: 'chargers', priority: 0.95, changeFrequency: 'weekly' },
  { slug: 'protectors', priority: 0.92, changeFrequency: 'weekly' },
  { slug: 'earbuds', priority: 0.92, changeFrequency: 'weekly' },
]

const categoryRouteConfigs: Record<string, Omit<RouteConfig, 'slug'>> = {
  offers: { priority: 0.9, changeFrequency: 'daily' },
  audio: { priority: 0.86, changeFrequency: 'weekly' },
  watches: { priority: 0.74, changeFrequency: 'monthly' },
  accessories: { priority: 0.88, changeFrequency: 'weekly' },
  cmf: { priority: 0.87, changeFrequency: 'weekly' },
  chargers: { priority: 0.95, changeFrequency: 'weekly' },
  cables: { priority: 0.8, changeFrequency: 'monthly' },
  'phone-cases': { priority: 0.79, changeFrequency: 'monthly' },
  'phone-protectors': { priority: 0.82, changeFrequency: 'monthly' },
}

function getFileModifiedTime(fileName: string): Date {
  try {
    return statSync(join(process.cwd(), 'database', fileName)).mtime
  } catch {
    return new Date()
  }
}

function buildRoute(slug: string, lastModified: Date, priority: number, changeFrequency: SitemapItem['changeFrequency']): SitemapItem {
  return {
    url: buildAbsoluteUrl(`/collections/${slug}`),
    lastModified,
    priority,
    changeFrequency,
  }
}

function uniqueRoutes(routes: SitemapItem[]): SitemapItem[] {
  const seen = new Set<string>()
  const output: SitemapItem[] = []

  for (const route of routes) {
    if (seen.has(route.url)) {
      continue
    }

    seen.add(route.url)
    output.push(route)
  }

  return output
}

function buildCollectionRoutes(): SitemapItem[] {
  const routes: SitemapItem[] = fixedCollectionRoutes.map((route) =>
    buildRoute(route.slug, collectionSourceFiles.virtual, route.priority, route.changeFrequency),
  )

  for (const category of categoriesSource) {
    const config = categoryRouteConfigs[category.slug] ?? { priority: 0.76, changeFrequency: 'monthly' }

    routes.push(buildRoute(category.slug, collectionSourceFiles.categories, config.priority, config.changeFrequency))
  }

  return uniqueRoutes(routes)
}

function buildProductRoute(slug: string, lastModified: Date, priority: number, changeFrequency: SitemapItem['changeFrequency']): SitemapItem {
  return {
    url: buildAbsoluteUrl(`/products/${slug}`),
    lastModified,
    priority,
    changeFrequency,
  }
}

function buildProductRoutes(): SitemapItem[] {
  const routes: SitemapItem[] = []
  const seen = new Set<string>()

  for (const product of storeProducts) {
    if (seen.has(product.slug)) {
      continue
    }

    seen.add(product.slug)
    routes.push(buildProductRoute(product.slug, collectionSourceFiles.products, 0.74, 'monthly'))
  }

  for (const mobile of mobileSource) {
    if (seen.has(mobile.slug)) {
      continue
    }

    seen.add(mobile.slug)
    routes.push(buildProductRoute(mobile.slug, collectionSourceFiles.mobiles, 0.86, 'weekly'))
  }

  return routes
}

export default function sitemap(): MetadataRoute.Sitemap {
  if (isPreviewDeployment()) {
    return []
  }

  const latestSourceModified = [collectionSourceFiles.virtual, collectionSourceFiles.categories, collectionSourceFiles.products, collectionSourceFiles.mobiles]
    .sort((left, right) => right.getTime() - left.getTime())[0]

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: buildAbsoluteUrl('/'), lastModified: latestSourceModified, changeFrequency: 'daily', priority: 1 },
    { url: buildAbsoluteUrl('/pages/about'), lastModified: latestSourceModified, changeFrequency: 'monthly', priority: 0.72 },
    { url: buildAbsoluteUrl('/pages/contact-us'), lastModified: latestSourceModified, changeFrequency: 'monthly', priority: 0.76 },
    { url: buildAbsoluteUrl('/pages/support-centre'), lastModified: latestSourceModified, changeFrequency: 'weekly', priority: 0.82 },
    { url: buildAbsoluteUrl('/pages/newsletter'), lastModified: latestSourceModified, changeFrequency: 'monthly', priority: 0.64 },
  ]

  const policyRoutes: MetadataRoute.Sitemap = allPolicies.map((policy) => ({
    url: buildAbsoluteUrl(`/pages/policies/${policy.slug}`),
    lastModified: latestSourceModified,
    changeFrequency: 'monthly',
    priority: 0.65,
  }))

  return [
    ...staticRoutes,
    ...policyRoutes,
    ...buildCollectionRoutes(),
    ...buildProductRoutes(),
  ]
}
