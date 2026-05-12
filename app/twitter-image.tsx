import { createSocialImage } from '@/lib/social-image'
import { siteBrandName } from '@/lib/data/site-content'

export const runtime = 'edge'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function TwitterImage() {
  return createSocialImage({
    eyebrow: siteBrandName,
    title: 'Nothing & CMF Products in Pakistan',
    subtitle: 'Shop Nothing and CMF phones, earbuds, chargers, cables, and accessories with live pricing and WhatsApp support.',
    chips: ['Live catalog', 'Support', 'Orders', 'Pakistan'],
  })
}
