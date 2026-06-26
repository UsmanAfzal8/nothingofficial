import type { MetadataRoute } from 'next'
import { getCollectionSitemapEntries, getProductSitemapEntries } from '@/lib/data/catalog-repository'
import { getPublishedBlogs } from '@/lib/data/blog-repository'
import { allPolicies } from '@/lib/data/policies'
import { supportPageSlugs } from '@/lib/data/support-pages'
import { buildAbsoluteUrl, getLastModifiedDate, stripNothingPakistanSlugPrefix } from '@/lib/utils/seo'

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
  const slug = stripNothingPakistanSlugPrefix(entry.slug)

  if (['shop-all', 'phones', 'audio', 'chargers', 'protectors', 'accessories', 'cmf'].includes(slug)) return 0.8

  return entry.depth === 0 ? 0.72 : 0.62
}

function collectionFrequency(entry: Awaited<ReturnType<typeof getCollectionSitemapEntries>>[number]): SitemapItem['changeFrequency'] {
  return entry.itemCount > 0 ? 'weekly' : 'monthly'
}

function productPriority(entry: Awaited<ReturnType<typeof getProductSitemapEntries>>[number]): number {
  return entry.stockQuantity === 0 ? 0.7 : 0.8
}

function productFrequency(entry: Awaited<ReturnType<typeof getProductSitemapEntries>>[number]): SitemapItem['changeFrequency'] {
  return entry.stockQuantity === 0 ? 'weekly' : 'daily'
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [collections, products, blogPosts] = await Promise.all([getCollectionSitemapEntries(), getProductSitemapEntries(), getPublishedBlogs()])
  const latestCatalogDate =
    [...collections.map((entry) => entry.updatedAt), ...products.map((entry) => entry.updatedAt)]
      .map((value) => getLastModifiedDate(value))
      .filter((value): value is Date => Boolean(value))
      .sort((left, right) => right.getTime() - left.getTime())[0] ?? new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: buildAbsoluteUrl('/'), lastModified: latestCatalogDate, changeFrequency: 'daily', priority: 1 },
    { url: buildAbsoluteUrl('/nothing-official-store-pakistan'), lastModified: latestCatalogDate, changeFrequency: 'weekly', priority: 0.95 },
    { url: buildAbsoluteUrl('/nothing-pakistan'), lastModified: latestCatalogDate, changeFrequency: 'weekly', priority: 0.92 },
    { url: buildAbsoluteUrl('/nothing-phones-pakistan'), lastModified: latestCatalogDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: buildAbsoluteUrl('/cmf-by-nothing-pakistan'), lastModified: latestCatalogDate, changeFrequency: 'weekly', priority: 0.88 },
    { url: buildAbsoluteUrl('/company-verification'), lastModified: latestCatalogDate, changeFrequency: 'monthly', priority: 0.9 },
    { url: buildAbsoluteUrl('/ai-products'), lastModified: latestCatalogDate, changeFrequency: 'weekly', priority: 0.84 },
    { url: buildAbsoluteUrl('/about-us'), lastModified: latestCatalogDate, changeFrequency: 'monthly', priority: 0.8 },
    { url: buildAbsoluteUrl('/authenticity'), lastModified: latestCatalogDate, changeFrequency: 'monthly', priority: 0.8 },
    { url: buildAbsoluteUrl('/contact-us'), lastModified: latestCatalogDate, changeFrequency: 'monthly', priority: 0.72 },
    { url: buildAbsoluteUrl('/support-centre'), lastModified: latestCatalogDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: buildAbsoluteUrl('/pages/newsletter'), lastModified: latestCatalogDate, changeFrequency: 'monthly', priority: 0.64 },
    { url: buildAbsoluteUrl('/blog'), lastModified: latestCatalogDate, changeFrequency: 'weekly', priority: 0.7 },
    { url: buildAbsoluteUrl('/llms.txt'), lastModified: latestCatalogDate, changeFrequency: 'monthly', priority: 0.3 },
  ]

  const supportRoutes: MetadataRoute.Sitemap = supportPageSlugs.map((slug) => ({
    url: buildAbsoluteUrl(`/support-centre/${slug}`),
    lastModified: latestCatalogDate,
    changeFrequency: 'monthly',
    priority: 0.66,
  }))

  const policyRoutes: MetadataRoute.Sitemap = allPolicies.map((policy) => ({
    url: buildAbsoluteUrl(`/pages/${policy.slug}`),
    lastModified: latestCatalogDate,
    changeFrequency: 'yearly',
    priority: 0.4,
  }))

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: buildAbsoluteUrl(`/blog/${post.slug}`),
    lastModified: getLastModifiedDate(post.updatedAt) ?? latestCatalogDate,
    changeFrequency: 'weekly',
    priority: 0.7,
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

  return uniqueRoutes([...staticRoutes, ...supportRoutes, ...policyRoutes, ...collectionRoutes, ...productRoutes, ...blogRoutes])
}
