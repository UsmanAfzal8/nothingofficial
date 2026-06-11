import { NextRequest, NextResponse } from 'next/server'
import {
  LEGACY_SHOP_CATEGORY_REDIRECTS,
  LEGACY_STATIC_PATH_REDIRECTS,
  normalizeLegacySlug,
  resolveLegacyProductHandle,
} from '@/lib/legacy-slugs'

const VIRTUAL_COLLECTION_SLUGS = new Set(['shop-all', 'phones', 'chargers', 'protectors', 'earbuds'])

function permanentRedirect(request: NextRequest, pathname: string) {
  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = pathname
  redirectUrl.search = ''

  return NextResponse.redirect(redirectUrl, 301)
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const staticRedirect = LEGACY_STATIC_PATH_REDIRECTS[pathname]

  if (staticRedirect) {
    return permanentRedirect(request, staticRedirect)
  }

  if (pathname === '/shop') {
    const category = searchParams.get('category')?.trim().toLowerCase()
    const destination = category ? LEGACY_SHOP_CATEGORY_REDIRECTS[category] ?? '/collections/shop-all' : '/collections/shop-all'

    return permanentRedirect(request, destination)
  }

  if (pathname === '/phones') {
    return permanentRedirect(request, '/collections/phones')
  }

  const phoneMatch = pathname.match(/^\/phones\/([^/]+)$/)

  if (phoneMatch?.[1]) {
    return permanentRedirect(request, `/products/${resolveLegacyProductHandle(phoneMatch[1])}`)
  }

  const productMatch = pathname.match(/^\/product\/([^/]+)$/)

  if (productMatch?.[1]) {
    return permanentRedirect(request, `/products/${resolveLegacyProductHandle(productMatch[1])}`)
  }

  const productPageMatch = pathname.match(/^\/products\/([^/]+)$/)

  if (productPageMatch?.[1]) {
    const normalizedHandle = normalizeLegacySlug(productPageMatch[1])

    if (normalizedHandle && !normalizedHandle.startsWith('nothing-pakistan-')) {
      return permanentRedirect(request, `/products/${resolveLegacyProductHandle(normalizedHandle)}`)
    }
  }

  const collectionMatch = pathname.match(/^\/collections\/([^/]+)$/)

  if (collectionMatch?.[1]) {
    const normalizedSlug = normalizeLegacySlug(collectionMatch[1])

    if (normalizedSlug && !normalizedSlug.startsWith('nothing-pakistan-') && !VIRTUAL_COLLECTION_SLUGS.has(normalizedSlug)) {
      return permanentRedirect(request, `/collections/nothing-pakistan-${normalizedSlug}`)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/about', '/contact', '/guides', '/privacy', '/Table.csv', '/shop', '/phones/:path*', '/product/:path*', '/products/:path*', '/collections/:path*'],
}
