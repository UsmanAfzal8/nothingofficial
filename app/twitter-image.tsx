import { createSocialImage } from '@/lib/social-image'
import { getSiteOrigin } from '@/lib/utils/seo'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

const SITE_BRAND_NAME = 'Nothing Pakistan'

export default async function TwitterImage() {
  return createSocialImage({
    origin: getSiteOrigin(),
    eyebrow: SITE_BRAND_NAME,
    title: 'Nothing & CMF Products in Pakistan',
    subtitle: 'Shop Nothing and CMF phones, earbuds, chargers, cables, and accessories with live pricing and WhatsApp support.',
    chips: ['Live catalog', 'Support', 'Orders', 'Pakistan'],
  })
}
