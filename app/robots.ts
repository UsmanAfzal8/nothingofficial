import type { MetadataRoute } from 'next'
import { buildAbsoluteUrl, getSiteOrigin, shouldIndexSite } from '@/lib/utils/seo'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteOrigin()

  if (!shouldIndexSite()) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard'],
      },
    ],
    sitemap: buildAbsoluteUrl('/sitemap.xml'),
    host: baseUrl,
  }
}
