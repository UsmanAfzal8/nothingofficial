import type { MetadataRoute } from 'next'
import { getCollectionSitemapEntries, getProductSitemapEntries } from '@/lib/data/catalog-repository'
import { allPolicies } from '@/lib/data/policies'
import { buildAbsoluteUrl, getLastModifiedDate, isPreviewDeployment } from '@/lib/utils/seo'

type SitemapItem = MetadataRoute.Sitemap[number]

function uniqueRoutes(routes: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  const seen = new Set<string>()
  const output: MetadataRoute.Sitemap = []

  for (const route of routes) {
    if (seen.has(route.url)) {
      continue
    }

    seen.add(route.url)
    output.push(route)
  }

  return output
}

function collectionPriority(entry: Awaited<ReturnType<typeof getCollectionSitemapEntries>>[number]): number {
  if (entry.slug === 'shop-all') return 1
  if (entry.slug === 'phones') return 0.98
  if (entry.slug === 'chargers') return 0.95
  if (entry.slug === 'trending-picks') return 0.94
  if (entry.depth === 0) return Math.max(0.76, Math.min(0.92, 0.78 + entry.itemCount * 0.01))

  return Math.max(0.62, Math.min(0.82, 0.66 + entry.itemCount * 0.01))
}

function collectionFrequency(entry: Awaited<ReturnType<typeof getCollectionSitemapEntries>>[number]): SitemapItem['changeFrequency'] {
  if (['shop-all', 'phones', 'trending-picks'].includes(entry.slug)) return 'daily'
  if (entry.itemCount >= 5) return 'weekly'

  return 'monthly'
}

function productPriority(entry: Awaited<ReturnType<typeof getProductSitemapEntries>>[number]): number {
  if (entry.entityType === 'mobile') return 0.88
  if (entry.collectionSlugs.includes('trending-picks')) return 0.84
  if (entry.productType === 'charger' || entry.productType === 'earbuds') return 0.8
  if (entry.productType === 'protector') return 0.72

  return 0.76
}

function productFrequency(entry: Awaited<ReturnType<typeof getProductSitemapEntries>>[number]): SitemapItem['changeFrequency'] {
  if (entry.entityType === 'mobile' || entry.collectionSlugs.includes('trending-picks')) return 'weekly'
  if (entry.stockQuantity === 0) return 'monthly'

  return 'weekly'
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isPreviewDeployment()) {
    return []
  }

  const [collections, products] = await Promise.all([getCollectionSitemapEntries(), getProductSitemapEntries()])
  const latestCatalogDate =
    [...collections.map((entry) => entry.updatedAt), ...products.map((entry) => entry.updatedAt)]
      .map((value) => getLastModifiedDate(value))
      .filter((value): value is Date => Boolean(value))
      .sort((left, right) => right.getTime() - left.getTime())[0] ?? new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: buildAbsoluteUrl('/'), lastModified: latestCatalogDate, changeFrequency: 'daily', priority: 1 },
    { url: buildAbsoluteUrl('/pages/about'), lastModified: latestCatalogDate, changeFrequency: 'monthly', priority: 0.72 },
    { url: buildAbsoluteUrl('/pages/contact-us'), lastModified: latestCatalogDate, changeFrequency: 'monthly', priority: 0.76 },
    { url: buildAbsoluteUrl('/pages/support-centre'), lastModified: latestCatalogDate, changeFrequency: 'weekly', priority: 0.82 },
    { url: buildAbsoluteUrl('/pages/newsletter'), lastModified: latestCatalogDate, changeFrequency: 'monthly', priority: 0.64 },
  ]

  const policyRoutes: MetadataRoute.Sitemap = allPolicies.map((policy) => ({
    url: buildAbsoluteUrl(`/pages/policies/${policy.slug}`),
    lastModified: latestCatalogDate,
    changeFrequency: 'monthly',
    priority: 0.65,
  }))

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((entry) => ({
    url: buildAbsoluteUrl(`/collections/${entry.slug}`),
    lastModified: getLastModifiedDate(entry.updatedAt) ?? latestCatalogDate,
    changeFrequency: collectionFrequency(entry),
    priority: collectionPriority(entry),
  }))

  const productRoutes: MetadataRoute.Sitemap = products.map((entry) => ({
    url: buildAbsoluteUrl(`/products/${entry.handle}`),
    lastModified: getLastModifiedDate(entry.updatedAt) ?? latestCatalogDate,
    changeFrequency: productFrequency(entry),
    priority: productPriority(entry),
  }))

  return uniqueRoutes([...staticRoutes, ...policyRoutes, ...collectionRoutes, ...productRoutes])
}
