'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ComparisonCandidate, ComparisonFamily, ProductComparisonData } from '@/lib/models/comparison'

type ProductComparisonProps = {
  data: ProductComparisonData
}

const FAMILY_LABELS: Record<ComparisonFamily, string> = {
  mobile: 'Phones',
  earbuds: 'Earbuds',
  headphones: 'Headphones',
  watch: 'Watches',
  charger: 'Chargers',
}

const FAMILY_DESCRIPTIONS: Record<ComparisonFamily, string> = {
  mobile: 'Compare Nothing and CMF phones only with other phones.',
  earbuds: 'Compare in-ear and open-ear Nothing audio products.',
  headphones: 'Compare over-ear Nothing and CMF headphones.',
  watch: 'Compare CMF smartwatches in one consistent table.',
  charger: 'Compare Nothing and CMF charging power, size, and features.',
}

function buildCompareHref(
  family: ComparisonFamily,
  left: ComparisonCandidate,
  right: ComparisonCandidate,
) {
  const params = new URLSearchParams({
    family,
    left: left.handle,
    right: right.handle,
  })

  return `/compare?${params.toString()}`
}

function getFamilyItems(candidates: ComparisonCandidate[], family: ComparisonFamily) {
  return candidates.filter((item) => item.family === family)
}

function ProductSelector({
  label,
  selected,
  other,
  items,
  onChange,
}: {
  label: string
  selected: ComparisonCandidate
  other: ComparisonCandidate
  items: ComparisonCandidate[]
  onChange: (item: ComparisonCandidate) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#3f3f3f]">{label}</span>
      <select
        value={selected.key}
        onChange={(event) => {
          const item = items.find((candidate) => candidate.key === event.target.value)
          if (item) onChange(item)
        }}
        className="h-12 w-full rounded-lg border border-[#d8d8d8] bg-white px-3 text-sm text-[#171717] outline-none transition hover:border-[#a8a8a8] focus:border-[#171717] focus:ring-2 focus:ring-black/10 sm:px-4"
      >
        {items.map((item) => (
          <option key={item.key} value={item.key} disabled={item.key === other.key}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  )
}

function ProductCard({ product }: { product: ProductComparisonData['left'] }) {
  return (
    <article className="min-w-0 overflow-hidden rounded-xl border border-[#e2e2e2] bg-white">
      <Link href={`/products/${product.handle}`} className="group block">
        <div className="relative aspect-square overflow-hidden bg-[#f5f5f5]">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.imageAlt}
              fill
              priority
              unoptimized
              sizes="(max-width: 768px) 50vw, 460px"
              className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.02] sm:p-8"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-black/35">Image coming soon</div>
          )}
        </div>
        <div className="px-4 pt-4 sm:px-6 sm:pt-6">
          <p className="text-xs font-medium text-[#777]">{FAMILY_LABELS[product.family]}</p>
          <h2 className="mt-1 text-base font-medium leading-snug text-[#171717] sm:text-2xl">{product.name}</h2>
        </div>
      </Link>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 sm:px-6">
        <p className="text-sm font-medium text-[#171717] sm:text-lg">{product.priceLabel ?? 'Contact for price'}</p>
        {product.originalPriceLabel && product.originalPrice !== product.price ? (
          <p className="text-xs text-[#8a8a8a] line-through sm:text-sm">{product.originalPriceLabel}</p>
        ) : null}
      </div>
      {product.summary ? (
        <p className="mt-3 hidden line-clamp-3 px-4 text-sm leading-6 text-[#686868] sm:block sm:px-6">
          {product.summary}
        </p>
      ) : null}
      <Link
        href={`/products/${product.handle}`}
        className="mx-4 mb-4 mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-[#d8d8d8] px-4 text-sm font-medium text-[#171717] transition hover:border-[#171717] sm:mx-6 sm:mb-6 sm:px-5"
      >
        View details
      </Link>
    </article>
  )
}

function normalizeSpecKey(groupTitle: string, section: string | null | undefined, label: string) {
  return [groupTitle, section, label].filter(Boolean).join(' / ').trim().toLowerCase()
}

function buildSpecRows(left: ProductComparisonData['left'], right: ProductComparisonData['right']) {
  const rows = new Map<
    string,
    {
      group: string
      section: string | null
      label: string
      left: string | null
      right: string | null
    }
  >()

  const add = (side: 'left' | 'right', product: ProductComparisonData['left']) => {
    for (const group of product.specGroups) {
      for (const spec of group.specs) {
        const key = normalizeSpecKey(group.title, spec.section, spec.label)
        const existing = rows.get(key) ?? {
          group: group.title,
          section: spec.section ?? null,
          label: spec.label || spec.section || 'Details',
          left: null,
          right: null,
        }
        existing[side] = spec.value
        rows.set(key, existing)
      }
    }
  }

  add('left', left)
  add('right', right)
  return [...rows.values()]
}

export function ProductComparison({ data }: ProductComparisonProps) {
  const router = useRouter()
  const family = data.left.family
  const familyItems = getFamilyItems(data.candidates, family)
  const specRows = buildSpecRows(data.left, data.right)
  const groupedRows = specRows.reduce<Array<{ title: string; rows: typeof specRows }>>((groups, row) => {
    const existing = groups.find((group) => group.title === row.group)
    if (existing) existing.rows.push(row)
    else groups.push({ title: row.group, rows: [row] })
    return groups
  }, [])

  const navigate = (nextFamily: ComparisonFamily, left: ComparisonCandidate, right: ComparisonCandidate) => {
    router.push(buildCompareHref(nextFamily, left, right))
  }

  return (
    <div>
      <section className="border-b border-[#dedede] pb-7 pt-4 sm:pb-9">
        <p className="text-sm font-medium text-[#6b6b6b]">Product comparison</p>
        <h1 className="mt-2 text-4xl font-medium tracking-[-0.04em] text-[#171717] sm:text-5xl">
          Compare products
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#666] sm:text-base">
          Choose a category and two products to compare prices and specifications side by side.
        </p>
      </section>

      <nav aria-label="Comparison categories" className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {Object.entries(FAMILY_LABELS).map(([familyKey, label]) => {
          const nextFamily = familyKey as ComparisonFamily
          const items = getFamilyItems(data.candidates, nextFamily)
          const isActive = nextFamily === family

          return (
            <button
              key={nextFamily}
              type="button"
              disabled={items.length < 2}
              onClick={() => {
                if (items.length >= 2) navigate(nextFamily, items[0], items[1])
              }}
              className={`shrink-0 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'border-[#171717] bg-[#171717] text-white'
                  : 'border-[#d8d8d8] bg-white text-[#3f3f3f] hover:border-[#969696]'
              } disabled:cursor-not-allowed disabled:opacity-35`}
            >
              {label}
            </button>
          )
        })}
      </nav>

      <section className="mt-5 rounded-xl border border-[#e2e2e2] bg-[#fafafa] p-4 sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-medium text-[#171717]">Choose products</h2>
          <p className="mt-1 text-sm leading-6 text-[#6b6b6b]">{FAMILY_DESCRIPTIONS[family]}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          <ProductSelector
            label="First product"
            selected={data.left}
            other={data.right}
            items={familyItems}
            onChange={(left) => {
              const right = left.key === data.right.key
                ? familyItems.find((item) => item.key !== left.key)
                : data.right
              if (right) navigate(family, left, right)
            }}
          />
          <ProductSelector
            label="Second product"
            selected={data.right}
            other={data.left}
            items={familyItems}
            onChange={(right) => navigate(family, data.left, right)}
          />
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3 sm:gap-5">
        <ProductCard product={data.left} />
        <ProductCard product={data.right} />
      </section>

      <section className="mt-10">
        <div>
          <h2 className="text-2xl font-medium tracking-[-0.02em] text-[#171717]">Specifications</h2>
          <p className="mt-2 text-sm leading-6 text-[#6b6b6b]">A clear side-by-side view of the available product details.</p>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-[#e2e2e2] bg-white">
          <div className="min-w-[680px]">
            <div className="grid grid-cols-[minmax(190px,0.72fr)_minmax(220px,1fr)_minmax(220px,1fr)] border-b border-[#e2e2e2] bg-[#f7f7f7] px-5 py-4 text-sm font-medium text-[#555]">
              <span>Specification</span>
              <span className="px-3 text-[#171717]">{data.left.name}</span>
              <span className="px-3 text-[#171717]">{data.right.name}</span>
            </div>

            <div className="grid grid-cols-[minmax(190px,0.72fr)_minmax(220px,1fr)_minmax(220px,1fr)] border-b border-[#e7e7e7] px-5 py-4 text-sm">
              <span className="text-[#6b6b6b]">Price</span>
              <span className="px-3 font-medium">{data.left.priceLabel ?? 'Contact us'}</span>
              <span className="px-3 font-medium">{data.right.priceLabel ?? 'Contact us'}</span>
            </div>

            {family === 'mobile' ? (
              <div className="grid grid-cols-[minmax(190px,0.72fr)_minmax(220px,1fr)_minmax(220px,1fr)] border-b border-[#e7e7e7] px-5 py-4 text-sm">
                <span className="text-[#6b6b6b]">Warranty</span>
                <span className="px-3">{data.left.warrantyYears ? `${data.left.warrantyYears} year` : '—'}</span>
                <span className="px-3">{data.right.warrantyYears ? `${data.right.warrantyYears} year` : '—'}</span>
              </div>
            ) : null}

            {groupedRows.length > 0 ? (
              groupedRows.map((group) => (
                <div key={group.title}>
                  <h3 className="border-b border-[#e2e2e2] bg-[#f7f7f7] px-5 py-3 text-sm font-medium text-[#353535]">
                    {group.title}
                  </h3>
                  {group.rows.map((row) => (
                    <div
                      key={`${group.title}-${row.section}-${row.label}`}
                      className="grid grid-cols-[minmax(190px,0.72fr)_minmax(220px,1fr)_minmax(220px,1fr)] border-b border-[#e7e7e7] px-5 py-4 text-sm last:border-b-0"
                    >
                      <div className="pr-3">
                        {row.section ? <span className="mb-1 block text-xs text-[#999]">{row.section}</span> : null}
                        <span className="text-[#626262]">{row.label}</span>
                      </div>
                      <span className="whitespace-pre-line break-words px-3 leading-6">{row.left ?? '—'}</span>
                      <span className="whitespace-pre-line break-words px-3 leading-6">{row.right ?? '—'}</span>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-sm text-[#777]">
                Detailed specifications are being prepared for this pair.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
