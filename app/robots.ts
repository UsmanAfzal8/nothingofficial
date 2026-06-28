import type { MetadataRoute } from 'next'
import { buildAbsoluteUrl, getSiteOrigin } from '@/lib/utils/seo'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteOrigin()

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/nothing-pakistan',
          '/nothing-phones-pakistan',
          '/nothing-phone-4b-pakistan',
          '/cmf-by-nothing-pakistan',
          '/llms.txt',
          '/company-verification',
          '/about-us',
          '/authenticity',
          '/support-centre',
          '/contact-us',
          '/ai-products',
        ],
        disallow: ['/Table.csv', '/newupdate.md', '/sitemap_issues.md', '/MIGRATION.md'],
      },
    ],
    sitemap: [buildAbsoluteUrl('/sitemap.xml'), buildAbsoluteUrl('/server-sitemap.xml')],
    host: baseUrl,
  }
}
