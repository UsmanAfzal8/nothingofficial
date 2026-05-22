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
          '/company-verification',
          '/about-us',
          '/authenticity',
          '/support-centre',
          '/contact-us',
        ],
      },
    ],
    sitemap: [buildAbsoluteUrl('/sitemap.xml'), buildAbsoluteUrl('/server-sitemap.xml')],
    host: baseUrl,
  }
}
