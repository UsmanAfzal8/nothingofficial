import type { MetadataRoute } from 'next'
import { buildAbsoluteUrl, getSiteOrigin } from '@/lib/utils/seo'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteOrigin()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/Table.csv', '/newupdate.md', '/sitemap_issues.md', '/MIGRATION.md'],
      },
    ],
    sitemap: buildAbsoluteUrl('/sitemap.xml'),
    host: baseUrl,
  }
}
