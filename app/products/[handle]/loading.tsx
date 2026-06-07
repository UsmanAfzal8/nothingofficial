import { NothingHeader } from '@/components/NothingHeader'

export default function ProductDetailLoading() {
  return (
    <div className="fixed inset-0 z-40 min-h-screen overflow-hidden bg-[#f5f7fb] text-slate-900">
      <NothingHeader />
      <main className="h-full overflow-hidden px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-28">
        <div className="mx-auto max-w-[1360px]">
          <div className="mb-5 flex gap-2">
            <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="rounded-[8px] border border-slate-200 bg-white p-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="aspect-[4/5] max-h-[68vh] animate-pulse rounded-[8px] bg-slate-100" />
              <div className="space-y-4 pt-2">
                <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
                <div className="h-12 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                <div className="mt-8 h-14 w-full animate-pulse rounded-[5px] bg-slate-200" />
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="aspect-square animate-pulse rounded-[8px] bg-slate-200" />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
