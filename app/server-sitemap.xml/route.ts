import sitemap from '@/app/sitemap'

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const entries = await sitemap()
  const urls = entries
    .map((entry) => {
      const lastModified =
        entry.lastModified instanceof Date
          ? entry.lastModified.toISOString()
          : typeof entry.lastModified === 'string'
            ? entry.lastModified
            : null

      return [
        '<url>',
        `<loc>${escapeXml(entry.url)}</loc>`,
        lastModified ? `<lastmod>${escapeXml(lastModified)}</lastmod>` : '',
        entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : '',
        typeof entry.priority === 'number' ? `<priority>${entry.priority.toFixed(1)}</priority>` : '',
        '</url>',
      ].filter(Boolean).join('')
    })
    .join('')

  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
