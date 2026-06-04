import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <NothingHeader />
      <main className="mx-auto max-w-[1360px] px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-28">
        <div className="mb-5 flex gap-2">
          <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="aspect-[4/5] animate-pulse rounded-3xl bg-slate-100" />
            <div className="space-y-4">
              <div className="h-10 w-3/4 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
              <div className="h-12 w-40 animate-pulse rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </main>
      <NothingFooter />
    </div>
  )
}
