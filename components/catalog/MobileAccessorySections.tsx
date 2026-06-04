import { CatalogProductTile } from '@/components/CatalogProductTile'
import { getMobileAccessoryGroupsByHandle } from '@/lib/data/catalog-repository'

export function MobileAccessorySectionsSkeleton() {
  return (
    <div className="mt-6 space-y-10">
      <section>
        <div className="mb-4 h-7 w-48 animate-pulse rounded-md bg-slate-200" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:gap-x-6 md:gap-y-12 lg:grid-cols-5 lg:gap-x-7 lg:gap-y-14">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-slate-200" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export async function MobileAccessorySections({ handle }: { handle: string }) {
  const mobileAccessoryGroups = await getMobileAccessoryGroupsByHandle(handle)

  if (mobileAccessoryGroups.length === 0) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:p-7">
        <h2 className="text-[1.35rem] font-medium tracking-[-0.02em] text-slate-900 sm:text-[1.55rem]">Related Accessories</h2>
        <p className="mt-5 text-sm leading-6 text-slate-600">
          No linked covers, protectors, chargers, or earbuds were found for this phone in the mobile-product connection table yet.
        </p>
      </div>
    )
  }

  return (
    <>
      {mobileAccessoryGroups.map((group) => (
        <section key={group.id}>
          <div className="mb-4">
            <h2 className="text-[1.35rem] font-medium tracking-[-0.02em] text-slate-900 sm:text-[1.55rem]">{group.title}</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:gap-x-6 md:gap-y-12 lg:grid-cols-5 lg:gap-x-7 lg:gap-y-14">
            {group.products.map((product, index) => (
              <CatalogProductTile key={product.id} product={product} priority={index < 2} tone="shop-all" />
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
