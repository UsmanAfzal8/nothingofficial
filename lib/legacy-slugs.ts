type LegacyPhoneModel = {
  legacy: string
  current: string
  coverCurrent?: string
  jellyCurrent?: string
  protectorCurrent?: string
  uvCurrent?: string
}

export const LEGACY_STATIC_PATH_REDIRECTS: Readonly<Record<string, string>> = {
  '/about': '/about-us',
  '/contact': '/contact-us',
  '/guides': '/blog',
  '/privacy': '/pages/privacy-policy',
  '/Table.csv': '/sitemap.xml',
}

export const LEGACY_SHOP_CATEGORY_REDIRECTS: Readonly<Record<string, string>> = {
  accessories: '/collections/nothing-pakistan-accessories',
  audio: '/collections/nothing-pakistan-audio',
  cables: '/collections/nothing-pakistan-cables',
  chargers: '/collections/chargers',
  cmf: '/collections/nothing-pakistan-cmf',
  nothing: '/collections/shop-all',
  offers: '/collections/nothing-pakistan-offers',
  'phone-cases': '/collections/nothing-pakistan-phone-cases',
  'phone-protectors': '/collections/nothing-pakistan-phone-protectors',
  watches: '/collections/nothing-pakistan-watches',
}

const LEGACY_PHONE_MODELS: readonly LegacyPhoneModel[] = [
  {
    legacy: 'nothing-phone-3a-community-edition',
    current: 'phone-3a-community-edition',
  },
  {
    legacy: 'nothing-phone-3a-lite',
    current: 'phone-3a-lite',
    coverCurrent: 'phone-3a-lite-cover',
    jellyCurrent: 'phone-3a-lite-jelly-sheet',
    protectorCurrent: 'phone-3a-lite-9d-protector',
    uvCurrent: 'phone-3a-lite-uv-protector',
  },
  {
    legacy: 'nothing-phone-3a-pro',
    current: 'phone-3a-pro',
    coverCurrent: 'phone-3a-pro-cover',
    jellyCurrent: 'phone-3a-pro-jelly-sheet',
    protectorCurrent: 'phone-3a-pro-9d-protector',
    uvCurrent: 'phone-3a-pro-uv-protector',
  },
  {
    legacy: 'nothing-phone-2a-plus',
    current: 'phone-2a-plus',
    coverCurrent: 'phone-2a-plus-cover',
  },
  {
    legacy: 'nothing-4a-pro',
    current: 'phone-4a-pro',
    coverCurrent: 'nothing-4a-pro-cover',
    jellyCurrent: 'phone-4a-pro-jelly-sheet',
    protectorCurrent: 'phone-4a-pro-9d-protector',
    uvCurrent: 'phone-4a-pro-uv-protector',
  },
  {
    legacy: 'nothing-phone-4a',
    current: 'phone-4a',
    coverCurrent: 'phone-4a-cover',
    jellyCurrent: 'phone-4a-jelly-sheet',
    protectorCurrent: 'phone-4a-9d-protector',
    uvCurrent: 'phone-4a-uv-protector',
  },
  {
    legacy: 'nothing-phone-3a',
    current: 'phone-3a',
    coverCurrent: 'phone-3a-cover',
    jellyCurrent: 'phone-3a-jelly-sheet',
    protectorCurrent: 'phone-3a-9d-protector',
    uvCurrent: 'phone-3a-uv-protector',
  },
  {
    legacy: 'nothing-phone-2a',
    current: 'phone-2a',
    coverCurrent: 'phone-2a-cover',
  },
  {
    legacy: 'nothing-phone-3',
    current: 'phone-3',
    coverCurrent: 'phone-3-cover',
    jellyCurrent: 'phone-3-jelly-sheet',
    protectorCurrent: 'phone-3-9d-protector',
    uvCurrent: 'phone-3-uv-protector',
  },
  {
    legacy: 'nothing-phone-2',
    current: 'phone-2',
    coverCurrent: 'phone-2-cover',
  },
  {
    legacy: 'nothing-phone-1',
    current: 'phone-1',
    coverCurrent: 'phone-1-cover',
  },
  {
    legacy: 'cmf-phone-2-pro',
    current: 'cmf-phone-2-pro',
    protectorCurrent: 'cmf-phone-2-pro-uv-protector',
    uvCurrent: 'cmf-phone-2-pro-uv-protector',
  },
  {
    legacy: 'cmf-phone-1',
    current: 'cmf-phone-1',
    jellyCurrent: 'cmf-phone-1-jelly-sheet',
    protectorCurrent: 'cmf-phone-1-protector',
    uvCurrent: 'cmf-phone-1-uv-protector',
  },
]

const LEGACY_PRODUCT_HANDLE_REDIRECTS: Readonly<Record<string, string>> = {
  'nothing-cable-c-c': 'nothing-pakistan-nothing-usb-c-to-usb-c-cable',
  'nothing-usb-c-to-usb-c-cable': 'nothing-pakistan-nothing-usb-c-to-usb-c-cable',
  'nothing-4a-pro-case': 'nothing-pakistan-nothing-4a-pro-cover',
  'cmf-phone-1-transparent-cover-cover-19': 'nothing-pakistan-cmf-phone-1-protector',
  'cmf-phone-1-transparent-cover-cover-21': 'nothing-pakistan-cmf-phone-1-protector',
}

export function normalizeLegacySlug(value: string): string {
  return decodeURIComponent(value)
    .trim()
    .toLowerCase()
    .replace(/\(([^)]+)\)/g, '$1')
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function addNothingPakistanSlugPrefix(slug: string): string {
  return slug.startsWith('nothing-pakistan-') ? slug : `nothing-pakistan-${slug}`
}

function compactUnique(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>()
  const output: string[] = []

  for (const value of values) {
    if (!value || seen.has(value)) continue
    seen.add(value)
    output.push(value)
  }

  return output
}

function resolveLegacyPhoneAccessoryHandle(normalizedHandle: string): string | null {
  for (const model of LEGACY_PHONE_MODELS) {
    if (normalizedHandle !== model.legacy && !normalizedHandle.startsWith(`${model.legacy}-`)) {
      continue
    }

    const suffix = normalizedHandle.slice(model.legacy.length).replace(/^-/, '')

    if (!suffix) {
      return addNothingPakistanSlugPrefix(model.current)
    }

    if (suffix === 'case' || /(?:^|-)cover(?:-cover-\d+)?$/.test(suffix) || /-cover-cover-\d+$/.test(suffix)) {
      return addNothingPakistanSlugPrefix(model.coverCurrent ?? model.protectorCurrent ?? model.current)
    }

    if (suffix === 'jelly-sheet') {
      return addNothingPakistanSlugPrefix(model.jellyCurrent ?? model.protectorCurrent ?? model.coverCurrent ?? model.current)
    }

    if (suffix === 'privacy-glass' || suffix === 'protector' || suffix === '9d-protector') {
      return addNothingPakistanSlugPrefix(model.protectorCurrent ?? model.coverCurrent ?? model.current)
    }

    if (suffix === 'uv-glass' || suffix === 'uv-protector') {
      return addNothingPakistanSlugPrefix(model.uvCurrent ?? model.protectorCurrent ?? model.coverCurrent ?? model.current)
    }

    return addNothingPakistanSlugPrefix(`${model.current}-${suffix}`)
  }

  return null
}

export function resolveLegacyProductHandle(handle: string): string {
  const normalizedHandle = normalizeLegacySlug(handle)

  if (!normalizedHandle) {
    return normalizedHandle
  }

  if (normalizedHandle.startsWith('nothing-pakistan-')) {
    return normalizedHandle
  }

  const directRedirect = LEGACY_PRODUCT_HANDLE_REDIRECTS[normalizedHandle]

  if (directRedirect) {
    return directRedirect
  }

  const phoneAccessoryHandle = resolveLegacyPhoneAccessoryHandle(normalizedHandle)

  if (phoneAccessoryHandle) {
    return phoneAccessoryHandle
  }

  if (/^nothing-(ear|headphone)(?:-|$)/.test(normalizedHandle)) {
    return addNothingPakistanSlugPrefix(normalizedHandle.replace(/^nothing-/, ''))
  }

  return addNothingPakistanSlugPrefix(normalizedHandle)
}

export function getLegacyProductHandleCandidates(handle: string): string[] {
  const normalizedHandle = normalizeLegacySlug(handle)
  const resolvedHandle = resolveLegacyProductHandle(normalizedHandle)
  const unbrandedNothingHandle = normalizedHandle.replace(/^nothing-/, '')

  return compactUnique([
    normalizedHandle,
    resolvedHandle,
    addNothingPakistanSlugPrefix(normalizedHandle),
    unbrandedNothingHandle !== normalizedHandle ? addNothingPakistanSlugPrefix(unbrandedNothingHandle) : null,
  ])
}
