import Link from 'next/link'
import Image from 'next/image'
import { getCollectionBySlug } from '@/lib/data/catalog-repository'
import type { Product } from '@/lib/models/catalog'

function buildRecommendedProducts(productGroups: Product[][], currentHandle: string) {
  const seen = new Set<string>()
  const output: Product[] = []

  for (const products of productGroups) {
    for (const product of products) {
      if (product.handle === currentHandle || seen.has(product.handle)) {
        continue
      }

      seen.add(product.handle)
      output.push(product)

      if (output.length === 8) {
        return output
      }
    }
  }

  return output
}

function RecommendationCard({ product }: { product: Product }) {
  return (
    <Link href={product.href} prefetch={false} className="group block text-center">
      <div className="mx-auto w-full max-w-[220px]">
        {product.image ? (
          <div className="relative aspect-square w-full">
            <Image
              src={product.image}
              alt={`${product.name} original product price in Pakistan from Nothing Official Store Pakistan`}
              fill
              loading="lazy"
              fetchPriority="low"
              sizes="(max-width: 768px) 44vw, (max-width: 1200px) 28vw, 18vw"
              className="object-contain object-center transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <div className="flex aspect-square w-full items-center justify-center text-sm text-slate-400">No image</div>
        )}
      </div>

      <div className="mt-5">
        <h3 className="product-card-name text-[1.05rem] leading-[1.15] text-slate-900 sm:text-[1.18rem]">{product.name}</h3>
        {product.priceLabel ? <p className="mt-2 text-sm text-slate-500">{product.priceLabel}</p> : null}
      </div>
    </Link>
  )
}

export function ProductRecommendationsSkeleton({ immersive }: { immersive?: boolean }) {
  return (
    <section className={immersive ? 'mx-auto mt-10 max-w-[1360px] px-4 sm:px-6 lg:px-8' : 'mt-10'}>
      <div className="h-8 w-56 animate-pulse rounded-md bg-slate-200" />
      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-5 lg:gap-x-8 lg:gap-y-12">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="mx-auto w-full max-w-[220px]">
            <div className="aspect-square w-full animate-pulse rounded-2xl bg-slate-200" />
            <div className="mx-auto mt-5 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </section>
  )
}

export async function ProductRecommendations({
  handle,
  primaryCollectionSlug,
  immersive = false,
}: {
  handle: string
  primaryCollectionSlug: string | null
  immersive?: boolean
}) {
  const [primaryCollection, fallbackCollection] = await Promise.all([
    primaryCollectionSlug ? getCollectionBySlug(primaryCollectionSlug) : Promise.resolve(null),
    primaryCollectionSlug === 'shop-all' ? Promise.resolve(null) : getCollectionBySlug('shop-all'),
  ])
  const recommendations = buildRecommendedProducts(
    [primaryCollection?.products ?? [], fallbackCollection?.products ?? []],
    handle,
  )

  if (recommendations.length === 0) {
    return null
  }

  return (
    <section className={immersive ? 'mx-auto mt-10 max-w-[1360px] px-4 sm:px-6 lg:px-8' : 'mt-10'}>
      <h2 className="text-[1.7rem] font-medium tracking-[-0.03em] text-slate-900">You may also like</h2>
      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-5 lg:gap-x-8 lg:gap-y-12">
        {recommendations.map((product) => (
          <RecommendationCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
