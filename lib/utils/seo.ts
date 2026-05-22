import type { Metadata } from 'next'

export const PRODUCTION_SITE_ORIGIN = 'https://www.nothingshop.pk'

function normalizeSiteOrigin(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }

  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  const valueWithProtocol =
    /^https?:\/\//i.test(trimmedValue) || trimmedValue.startsWith('http://localhost') || trimmedValue.startsWith('http://127.0.0.1')
      ? trimmedValue
      : trimmedValue.startsWith('localhost') || trimmedValue.startsWith('127.0.0.1')
        ? `http://${trimmedValue}`
        : `https://${trimmedValue}`

  try {
    return new URL(valueWithProtocol).origin
  } catch {
    return null
  }
}

export function isPreviewDeployment(): boolean {
  return process.env.VERCEL_ENV?.toLowerCase() === 'preview'
}

export function shouldIndexSite(): boolean {
  if (isPreviewDeployment()) {
    return false
  }

  return process.env.NODE_ENV === 'production'
}

export function getSiteOrigin(): string {
  const siteUrlCandidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
  ]

  for (const candidate of siteUrlCandidates) {
    const normalizedValue = normalizeSiteOrigin(candidate)

    if (normalizedValue) {
      return normalizedValue
    }
  }

  return PRODUCTION_SITE_ORIGIN
}

export function buildRobotsMetadata(options: { index?: boolean; follow?: boolean } = {}): NonNullable<Metadata['robots']> {
  const allowIndexing = shouldIndexSite() && (options.index ?? true)
  const follow = allowIndexing && (options.follow ?? true)

  return {
    index: allowIndexing,
    follow,
    googleBot: {
      index: allowIndexing,
      follow,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  }
}

export function toSeoHandle(rawValue: string): string {
  return rawValue
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function buildAbsoluteUrl(pathname: string): string {
  const appUrl = getSiteOrigin()

  try {
    return new URL(pathname, appUrl).toString()
  } catch {
    return `${appUrl.replace(/\/+$/g, '')}${pathname}`
  }
}

export type SeoBreadcrumbItem = {
  label: string
  href: string
}

export type SeoFaqItem = {
  question: string
  answer: string
}

export function buildSeoKeywords(...groups: Array<ReadonlyArray<string | null | undefined>>): string[] {
  const seen = new Set<string>()
  const values: string[] = []

  for (const group of groups) {
    for (const entry of group) {
      if (!entry) {
        continue
      }

      const normalized = entry.trim()

      if (!normalized) {
        continue
      }

      const dedupeKey = normalized.toLowerCase()

      if (seen.has(dedupeKey)) {
        continue
      }

      seen.add(dedupeKey)
      values.push(normalized)
    }
  }

  return values
}

export function splitSeoKeywords(value: string | null | undefined): string[] {
  if (!value) {
    return []
  }

  return value
    .split(/[,;\n|]+/g)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

export function compactSeoText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

export function trimSeoDescription(value: string, maxLength = 158): string {
  const normalizedValue = compactSeoText(value)

  if (normalizedValue.length <= maxLength) {
    return normalizedValue
  }

  const clippedValue = normalizedValue.slice(0, maxLength - 1)
  const lastSpaceIndex = clippedValue.lastIndexOf(' ')

  return `${clippedValue.slice(0, lastSpaceIndex > 80 ? lastSpaceIndex : clippedValue.length).trim()}.`
}

export function buildBreadcrumbStructuredData(items: SeoBreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: buildAbsoluteUrl(item.href),
    })),
  }
}

export function buildFaqStructuredData(items: ReadonlyArray<SeoFaqItem>) {
  if (items.length === 0) {
    return null
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function getLastModifiedDate(value: string | null | undefined): Date | undefined {
  if (!value) {
    return undefined
  }

  const parsedDate = new Date(value)

  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate
}
