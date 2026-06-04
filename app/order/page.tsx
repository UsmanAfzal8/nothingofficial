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

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
    absolute: 'Place Order | Nothing Official Store Pakistan',
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
    <div className="min-h-screen overflow-x-hidden bg-[#f4f4f0] text-slate-900">
      <NothingHeader />

      <main className="pt-20 lg:pt-24">
        <section className="px-4 pb-16 pt-6 md:px-8 md:pb-24">
          <div className="mx-auto w-full max-w-[1200px]">
            <OrderForm product={null} />
          </div>
        </section>
      </main>

      <NothingFooter />
    </div>
  )
}
