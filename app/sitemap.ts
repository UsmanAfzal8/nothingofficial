import type { MetadataRoute } from 'next'
import { getCollectionSitemapEntries, getProductSitemapEntries } from '@/lib/data/catalog-repository'
import { allPolicies } from '@/lib/data/policies'
import { buildAbsoluteUrl, getLastModifiedDate } from '@/lib/utils/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [collectionEntries, productEntries] = await Promise.all([getCollectionSitemapEntries(), getProductSitemapEntries()])
  const now = new Date()
  const catalogLastModified =
    [...collectionEntries, ...productEntries]
      .map((entry) => getLastModifiedDate(entry.updatedAt))
      .filter((entry): entry is Date => Boolean(entry))
      .sort((left, right) => right.getTime() - left.getTime())[0] ?? now

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: buildAbsoluteUrl('/'), lastModified: catalogLastModified, changeFrequency: 'daily', priority: 1 },
    { url: buildAbsoluteUrl('/pages/about'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: buildAbsoluteUrl('/pages/contact-us'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: buildAbsoluteUrl('/pages/support-centre'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: buildAbsoluteUrl('/pages/newsletter'), lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ]

  const policyRoutes: MetadataRoute.Sitemap = allPolicies.map((policy) => ({
    url: buildAbsoluteUrl(`/pages/policies/${policy.slug}`),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.65,
  }))

  const collectionRoutes: MetadataRoute.Sitemap = collectionEntries.map((entry) => ({
    url: buildAbsoluteUrl(`/collections/${entry.slug}`),
    lastModified: getLastModifiedDate(entry.updatedAt) ?? now,
    changeFrequency: 'daily',
    priority: entry.slug === 'phones' || entry.slug === 'shop-all' ? 0.9 : 0.8,
    images: entry.image ? [entry.image] : undefined,
  }))

  const productRoutes: MetadataRoute.Sitemap = productEntries.map((entry) => ({
    url: buildAbsoluteUrl(`/products/${entry.handle}`),
    lastModified: getLastModifiedDate(entry.updatedAt) ?? now,
    changeFrequency: 'weekly',
    priority: 0.85,
    images: entry.image ? [entry.image] : undefined,
  }))

  return [...staticRoutes, ...policyRoutes, ...collectionRoutes, ...productRoutes]
}
