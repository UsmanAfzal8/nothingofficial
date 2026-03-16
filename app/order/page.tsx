import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { OrderForm } from '@/components/OrderForm'
import { buildAbsoluteUrl, toSeoHandle } from '@/lib/utils/seo'

type OrderPageProps = {
  searchParams?: {
    handle?: string | string[]
  }
}

function normalizeHandle(value: string | string[] | undefined): string | null {
  if (!value) return null
  if (Array.isArray(value)) {
    return value[0]?.trim() || null
  }
  const normalized = value.trim()
  return normalized || null
}

export const metadata: Metadata = {
  title: {
    absolute: 'Place Order | Nothing Pakistan',
  },
  description: 'Order screen for customer details and live catalog orders.',
  alternates: {
    canonical: buildAbsoluteUrl('/order'),
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default async function OrderPage({ searchParams }: OrderPageProps) {
  const handle = normalizeHandle(searchParams?.handle)

  if (handle) {
    redirect(`/order/${toSeoHandle(handle)}`)
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#ececea] text-[#111]">
      <NothingHeader />

      <main className="pt-20">
        <section className="px-4 pb-16 pt-4 md:px-8 md:pb-24">
          <div className="mx-auto w-full max-w-screen-2xl">
            <OrderForm product={null} backLink={{ href: '/collections/shop-all', label: 'Browse Products' }} />
          </div>
        </section>
      </main>

      <NothingFooter />
    </div>
  )
}
