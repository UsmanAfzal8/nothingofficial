import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { OrderForm } from '@/components/OrderForm'
import { getProductDetailByHandle } from '@/lib/data/catalog-repository'
import { buildAbsoluteUrl, buildRobotsMetadata, toSeoHandle } from '@/lib/utils/seo'

type OrderByHandlePageProps = {
  params: {
    handle: string
  }
  searchParams?: {
    color?: string | string[]
    media?: string | string[]
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

function normalizeSearchParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0]?.trim() || null
  return value?.trim() || null
}

function normalizeColor(value: string | null) {
  return value?.trim().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').toLowerCase() ?? null
}

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
    description: `Confirm your ${productDetail.name} order with shipping or pickup, COD or bank transfer, and WhatsApp support from Nothing Pakistan.`,
    alternates: {
      canonical: buildAbsoluteUrl(`/order/${canonicalHandle}`),
    },
    robots: buildRobotsMetadata({ index: false, follow: true }),
  }
}

export default async function OrderByHandlePage({ params, searchParams }: OrderByHandlePageProps) {
  const requestedHandle = toSeoHandle(params.handle)
  const productDetail = await getProductDetailByHandle(requestedHandle)

  if (!productDetail) {
    notFound()
  }

  const canonicalHandle = toSeoHandle(productDetail.handle)

  if (params.handle !== canonicalHandle) {
    const selectionParams = new URLSearchParams()
    const requestedColor = normalizeSearchParam(searchParams?.color)
    const requestedMediaId = normalizeSearchParam(searchParams?.media)
    if (requestedColor) selectionParams.set('color', requestedColor)
    if (requestedMediaId) selectionParams.set('media', requestedMediaId)
    const query = selectionParams.toString()
    redirect(`/order/${canonicalHandle}${query ? `?${query}` : ''}`)
  }

  const requestedColor = normalizeSearchParam(searchParams?.color)
  const requestedMediaId = normalizeSearchParam(searchParams?.media)
  const normalizedRequestedColor = normalizeColor(requestedColor)
  const selectedMedia =
    productDetail.gallery.find((media) => media.id === requestedMediaId) ??
    productDetail.gallery.find((media) => normalizeColor(media.colorName ?? null) === normalizedRequestedColor) ??
    productDetail.gallery[0] ??
    null
  const selectedProduct = {
    handle: productDetail.handle,
    name: productDetail.name,
    image: selectedMedia?.url ?? productDetail.primaryImage ?? productDetail.ogImage,
    colorName: selectedMedia?.colorName ?? requestedColor,
    price: productDetail.price ?? null,
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f4f0] text-slate-900">
      <NothingHeader />

      <main className="pt-20 lg:pt-24">
        <section className="px-4 pb-16 pt-6 md:px-8 md:pb-24">
          <div className="mx-auto w-full max-w-[1200px]">
            <h1 className="sr-only">Order {productDetail.name} from Nothing Pakistan</h1>
            <OrderForm product={selectedProduct} />
          </div>
        </section>
      </main>

      <NothingFooter />
    </div>
  )
}
