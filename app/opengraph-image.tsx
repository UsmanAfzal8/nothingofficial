import { createSocialImage } from '@/lib/social-image'
import { siteDescription, siteBrandName } from '@/lib/data/site-content'

export const runtime = 'edge'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function OpenGraphImage() {
  return createSocialImage({
    eyebrow: siteBrandName,
    title: 'Nothing phones, chargers & CMF accessories',
    subtitle: siteDescription,
    chips: ['Phones', 'Chargers', 'Earbuds', 'Protectors'],
  })
}
