import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'

export default function CollectionLoading() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f4f0] text-[#111]">
      <NothingHeader />
      <main className="px-4 pb-16 pt-24 md:px-8 md:pb-24">
        <section className="mx-auto max-w-[1680px]">
          <div className="border-b border-black/8 pb-8 md:pb-10">
            <div className="h-3 w-24 animate-pulse rounded bg-black/10" />
            <div className="mt-6 h-12 w-2/3 max-w-xl animate-pulse rounded-lg bg-black/10" />
            <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-black/8" />
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-5 lg:gap-x-8 lg:gap-y-14">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <div className="aspect-[4/5] animate-pulse rounded-2xl bg-black/8" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-black/8" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-black/6" />
              </div>
            ))}
          </div>
        </section>
      </main>
      <NothingFooter />
    </div>
  )
}
