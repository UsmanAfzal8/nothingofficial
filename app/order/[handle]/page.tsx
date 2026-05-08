import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { OrderForm } from '@/components/OrderForm'
import { getProductDetailByHandle } from '@/lib/data/catalog-repository'
import { buildAbsoluteUrl, toSeoHandle } from '@/lib/utils/seo'

type OrderByHandlePageProps = {
  params: {
    handle: string
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ params }: OrderByHandlePageProps): Promise<Metadata> {
  const requestedHandle = toSeoHandle(params.handle)
  const productDetail = await getProductDetailByHandle(requestedHandle)

  if (!productDetail) {
    return {
      title: {
        absolute: 'Order Product | Nothing Pakistan',
      },
      alternates: {
        canonical: buildAbsoluteUrl('/order'),
      },
    }
  }

  const canonicalHandle = toSeoHandle(productDetail.handle)

  return {
    title: {
      absolute: `Order ${productDetail.name} | Nothing Pakistan`,
    },
    description: `Place an order for ${productDetail.name}.`,
    alternates: {
      canonical: buildAbsoluteUrl(`/order/${canonicalHandle}`),
    },
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function OrderByHandlePage({ params }: OrderByHandlePageProps) {
  const requestedHandle = toSeoHandle(params.handle)
  const productDetail = await getProductDetailByHandle(requestedHandle)

  if (!productDetail) {
    notFound()
  }

  const canonicalHandle = toSeoHandle(productDetail.handle)

  if (params.handle !== canonicalHandle) {
    redirect(`/order/${canonicalHandle}`)
  }

  const selectedProduct = {
    handle: productDetail.handle,
    name: productDetail.name,
    image: productDetail.primaryImage ?? productDetail.ogImage,
    price: productDetail.price ?? null,
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7fb] text-slate-900">
      <NothingHeader />

      <main className="pt-20 lg:pt-24">
        <section className="px-4 pb-16 pt-6 md:px-8 md:pb-24">
          <div className="mx-auto w-full max-w-[1200px]">
            <OrderForm product={selectedProduct} />
          </div>
        </section>
      </main>

      <NothingFooter />
    </div>
  )
}
