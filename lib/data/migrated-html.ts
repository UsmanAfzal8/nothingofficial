import { unstable_cache } from 'next/cache'

const MIGRATED_HTML_REVALIDATE_SECONDS = 300

export function isMigratedHtmlSource(value: string | null | undefined) {
  if (!value) return false
  return isCloudinaryRawHtmlUrl(value)
}

function isCloudinaryRawHtmlUrl(value: string) {
  try {
    const url = new URL(value)
    return url.hostname === 'res.cloudinary.com' && url.pathname.includes('/raw/upload/') && /\.html(?:$|[?#])/i.test(url.href)
  } catch {
    return false
  }
}

async function fetchMigratedHtmlCopy(url: string) {
  const response = await fetch(url, {
    next: { revalidate: MIGRATED_HTML_REVALIDATE_SECONDS },
  })

  if (!response.ok) {
    return null
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType && !contentType.includes('text/html') && !contentType.includes('text/plain')) {
    return null
  }

  return await response.text()
}

const readCachedMigratedHtmlCopy = unstable_cache(fetchMigratedHtmlCopy, ['migrated-html-copy-v1'], {
  revalidate: MIGRATED_HTML_REVALIDATE_SECONDS,
})

export function getImmediateProductIntro(summary: string | null | undefined, description: string | null | undefined) {
  if (summary && !isCloudinaryRawHtmlUrl(summary)) {
    return summary
  }

  if (description && !isCloudinaryRawHtmlUrl(description)) {
    return description
  }

  return null
}

export async function resolveMigratedHtmlCopy(value: string | null | undefined) {
  if (!value) {
    return null
  }

  if (!isCloudinaryRawHtmlUrl(value)) {
    return value
  }

  try {
    return await readCachedMigratedHtmlCopy(value)
  } catch {
    return null
  }
}
