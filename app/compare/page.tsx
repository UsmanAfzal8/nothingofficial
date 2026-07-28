import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { notFound } from 'next/navigation'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { ProductComparison } from '@/components/catalog/ProductComparison'
import { getProductComparisonData } from '@/lib/data/comparison-repository'

const inter = localFont({
  src: [
    { path: '../../fonts/Inter-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../../fonts/Inter-Medium.otf', weight: '500', style: 'normal' },
  ],
  display: 'swap',
})

type ComparePageProps = {
  searchParams?: {
    family?: string
    left?: string
    right?: string
  }
}

export const metadata: Metadata = {
  title: 'Compare Nothing Phones, Earbuds, Headphones, Watches & Chargers',
  description:
    'Compare Nothing and CMF phones, earbuds, headphones, watches, and chargers side by side with Pakistan prices and detailed specifications.',
  alternates: {
    canonical: '/compare',
  },
}

export const revalidate = 300

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const data = await getProductComparisonData(
    searchParams?.family,
    searchParams?.left,
    searchParams?.right,
  )

  if (!data) notFound()

  return (
    <div className={`comparison-page min-h-screen bg-white text-[#171717] ${inter.className}`}>
      <NothingHeader />
      <main className="mx-auto max-w-[1240px] px-4 pb-20 pt-24 sm:px-6 lg:px-8 lg:pb-28 lg:pt-28">
        <ProductComparison data={data} />
      </main>
      <NothingFooter />
    </div>
  )
}
