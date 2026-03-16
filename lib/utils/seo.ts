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

export function getSiteOrigin(): string {
  const siteUrlCandidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ]

  for (const candidate of siteUrlCandidates) {
    const normalizedValue = normalizeSiteOrigin(candidate)

    if (normalizedValue) {
      return normalizedValue
    }
  }

  return 'http://localhost:3000'
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

export function buildSeoKeywords(...groups: Array<Array<string | null | undefined>>): string[] {
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

export function getLastModifiedDate(value: string | null | undefined): Date | undefined {
  if (!value) {
    return undefined
  }

  const parsedDate = new Date(value)

  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate
}
