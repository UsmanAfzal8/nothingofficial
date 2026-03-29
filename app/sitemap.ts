import type { MetadataRoute } from 'next'
import { getCollectionSitemapEntries, getProductSitemapEntries } from '@/lib/data/catalog-repository'
import { allPolicies } from '@/lib/data/policies'
import { buildAbsoluteUrl, getLastModifiedDate, shouldIndexSite } from '@/lib/utils/seo'

function clampPriority(value: number, minimum = 0.2, maximum = 1) {
  return Math.max(minimum, Math.min(maximum, Number(value.toFixed(2))))
}

function buildCollectionPriority(entry: Awaited<ReturnType<typeof getCollectionSitemapEntries>>[number]) {
  if (entry.slug === 'shop-all') {
    return 0.95
  }

  if (entry.slug === 'phones') {
    return 0.93
  }

  if (entry.slug === 'chargers') {
    return 0.9
  }

  const basePriority = entry.depth === 0 ? 0.8 : 0.68
  const sizeBoost = Math.min(entry.itemCount, 24) * 0.008

  return clampPriority(basePriority + sizeBoost, 0.55, 0.92)
}

function buildCollectionChangeFrequency(entry: Awaited<ReturnType<typeof getCollectionSitemapEntries>>[number]): MetadataRoute.Sitemap[number]['changeFrequency'] {
  if (entry.slug === 'shop-all' || entry.slug === 'phones' || entry.itemCount >= 12) {
    return 'daily'
  }

  return entry.depth === 0 ? 'weekly' : 'monthly'
}

function buildProductPriority(entry: Awaited<ReturnType<typeof getProductSitemapEntries>>[number]) {
  let priority = entry.entityType === 'mobile' ? 0.86 : 0.76

  if (entry.productType === 'charger') {
    priority += 0.1
  } else if (entry.productType === 'earbuds') {
    priority += 0.07
  } else if (entry.productType === 'protector') {
    priority += 0.05
  }

  if (typeof entry.stockQuantity === 'number' && entry.stockQuantity <= 0) {
    priority -= 0.08
  }

  if (entry.collectionSlugs.includes('chargers')) {
    priority += 0.02
  }

  priority += Math.min(entry.linkedItemCount, 12) * 0.006

  return clampPriority(priority, 0.6, 0.92)
}

function buildProductChangeFrequency(entry: Awaited<ReturnType<typeof getProductSitemapEntries>>[number]): MetadataRoute.Sitemap[number]['changeFrequency'] {
  if (entry.entityType === 'mobile' || entry.productType === 'charger') {
    return 'weekly'
  }

  return 'monthly'
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!shouldIndexSite()) {
    return []
  }

  const [collectionEntries, productEntries] = await Promise.all([getCollectionSitemapEntries(), getProductSitemapEntries()])
  const catalogLastModified =
    [...collectionEntries, ...productEntries]
      .map((entry) => getLastModifiedDate(entry.updatedAt))
      .filter((entry): entry is Date => Boolean(entry))
      .sort((left, right) => right.getTime() - left.getTime())[0] ?? new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: buildAbsoluteUrl('/'), lastModified: catalogLastModified, changeFrequency: 'daily', priority: 1 },
    { url: buildAbsoluteUrl('/pages/about'), lastModified: catalogLastModified, changeFrequency: 'monthly', priority: 0.72 },
    { url: buildAbsoluteUrl('/pages/contact-us'), lastModified: catalogLastModified, changeFrequency: 'monthly', priority: 0.76 },
    { url: buildAbsoluteUrl('/pages/support-centre'), lastModified: catalogLastModified, changeFrequency: 'weekly', priority: 0.82 },
    { url: buildAbsoluteUrl('/pages/newsletter'), lastModified: catalogLastModified, changeFrequency: 'monthly', priority: 0.64 },
  ]

  const policyRoutes: MetadataRoute.Sitemap = allPolicies.map((policy) => ({
    url: buildAbsoluteUrl(`/pages/policies/${policy.slug}`),
    lastModified: catalogLastModified,
    changeFrequency: 'monthly',
    priority: 0.65,
  }))

  const collectionRoutes: MetadataRoute.Sitemap = collectionEntries.map((entry) => ({
    url: buildAbsoluteUrl(`/collections/${entry.slug}`),
    lastModified: getLastModifiedDate(entry.updatedAt) ?? catalogLastModified,
    changeFrequency: buildCollectionChangeFrequency(entry),
    priority: buildCollectionPriority(entry),
    images: entry.image ? [entry.image] : undefined,
  }))

  const productRoutes: MetadataRoute.Sitemap = productEntries.map((entry) => ({
    url: buildAbsoluteUrl(`/products/${entry.handle}`),
    lastModified: getLastModifiedDate(entry.updatedAt) ?? catalogLastModified,
    changeFrequency: buildProductChangeFrequency(entry),
    priority: buildProductPriority(entry),
    images: entry.image ? [entry.image] : undefined,
  }))

  return [...staticRoutes, ...policyRoutes, ...collectionRoutes, ...productRoutes]
}
