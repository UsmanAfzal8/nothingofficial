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
          '/llms.txt',
          '/ai-products',
          '/collections/',
          '/products/',
          '/blog/',
          '/company-verification',
          '/about-us',
          '/authenticity',
          '/support-centre',
          '/contact-us',
        ],
        disallow: ['/cart/', '/checkout/', '/account/', '/search', '/dashboard/'],
      },
    ],
    sitemap: buildAbsoluteUrl('/sitemap.xml'),
    host: baseUrl,
  }
}
