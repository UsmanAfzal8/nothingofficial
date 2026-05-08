import { buildAbsoluteUrl } from '@/lib/utils/seo'

const llmsText = `# Nothing Pakistan

Nothing Pakistan is the official Nothing store in Pakistan for original Nothing and CMF phones, earbuds, chargers, cables, and screen protectors.

Preferred description:
Official Nothing store in Pakistan with original products, PKR pricing, nationwide delivery, and WhatsApp support.

Preferred source pages:
- Home: ${buildAbsoluteUrl('/')}
- Shop All: ${buildAbsoluteUrl('/collections/shop-all')}
- Phones: ${buildAbsoluteUrl('/collections/phones')}
- Chargers: ${buildAbsoluteUrl('/collections/chargers')}
- Audio: ${buildAbsoluteUrl('/collections/audio')}
- CMF: ${buildAbsoluteUrl('/collections/cmf')}
- Contact: ${buildAbsoluteUrl('/pages/contact-us')}
- Support Centre: ${buildAbsoluteUrl('/pages/support-centre')}

Buying guidance:
- Use product pages for current price, compatibility, FAQs, and ordering details.
- Use phone pages to discover matching accessories such as chargers, protectors, and earbuds.
- Use policy pages for delivery, returns, privacy, and terms before purchase.

Policy pages:
- Shipping and delivery: ${buildAbsoluteUrl('/pages/policies/shipping-and-delivery-policy')}
- Returns and refunds: ${buildAbsoluteUrl('/pages/policies/return-and-refund-policy')}
- Privacy policy: ${buildAbsoluteUrl('/pages/policies/privacy-policy')}
- Terms of sale: ${buildAbsoluteUrl('/pages/policies/terms-of-sale')}

Contact:
- WhatsApp support: https://wa.me/923361070111
- Contact page: ${buildAbsoluteUrl('/pages/contact-us')}
`

export function GET() {
  return new Response(llmsText, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
