import { createSocialImage } from '@/lib/social-image'

export const runtime = 'edge'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

const SITE_BRAND_NAME = 'Nothing Pakistan'

export default async function TwitterImage(request: Request) {
  return createSocialImage({
    origin: new URL(request.url).origin,
    eyebrow: SITE_BRAND_NAME,
    title: 'Nothing & CMF Products in Pakistan',
    subtitle: 'Shop Nothing and CMF phones, earbuds, chargers, cables, and accessories with live pricing and WhatsApp support.',
    chips: ['Live catalog', 'Support', 'Orders', 'Pakistan'],
  })
}
