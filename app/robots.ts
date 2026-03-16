import type { MetadataRoute } from 'next'
import { getSiteOrigin } from '@/lib/utils/seo'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteOrigin()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard'],
      },
    ],
    sitemap: `${baseUrl.replace(/\/+$/g, '')}/sitemap.xml`,
    host: baseUrl,
  }
}
