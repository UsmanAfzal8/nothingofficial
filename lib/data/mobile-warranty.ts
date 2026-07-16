export const MOBILE_WARRANTY_BADGE_URLS = {
  1: 'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto/v1782633247/nothing-official-store-pakistan/warranty/1-year-warranty.avif',
  2: 'https://res.cloudinary.com/dklsubnzb/image/upload/f_auto,q_auto/v1782633248/nothing-official-store-pakistan/warranty/2-year-warranty.avif',
} as const

export type MobileWarrantyYears = keyof typeof MOBILE_WARRANTY_BADGE_URLS

export function getMobileWarrantyBadgeUrl(warrantyYears?: number | null) {
  return MOBILE_WARRANTY_BADGE_URLS[warrantyYears === 2 ? 2 : 1]
}
