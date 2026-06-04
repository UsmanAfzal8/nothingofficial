import type { Metadata } from 'next'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { CartPageContent } from '@/components/CartPageContent'
import { buildAbsoluteUrl } from '@/lib/utils/seo'

export const metadata: Metadata = {
  title: {
    absolute: 'Cart | Nothing Official Store Pakistan',
  },
  description: 'Review the products you added from the live Nothing Official Store Pakistan catalog before checkout.',
  alternates: {
    canonical: buildAbsoluteUrl('/cart'),
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function CartPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#ececea] text-[#111]">
      <NothingHeader />

      <main className="px-4 pb-16 pt-24 md:pb-24">
        <section className="mx-auto w-full max-w-screen-2xl">
          <CartPageContent />
        </section>
      </main>

      <NothingFooter />
    </div>
  )
}
