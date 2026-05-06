'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { ProductDetailMedia } from '@/lib/models/product-detail'

type ProductDetailHeroProps = {
  productName: string
  brandLabel: string
  entityType: 'product' | 'mobile'
  gallery: ProductDetailMedia[]
  intro: string | null
  priceLabel?: string | null
  canonicalHandle: string
  labels?: string[]
}

type ColorOption = {
  key: string
  label: string
  hex: string
  mediaIndex: number
}

const COLOR_HEX_BY_NAME: Record<string, string> = {
  black: '#111111',
  'dark grey': '#3f4144',
  grey: '#9a9a94',
  gray: '#9a9a94',
  silver: '#c7c7c1',
  white: '#f6f6ef',
  milk: '#f5f0e4',
  orange: '#ff6a00',
  blue: '#4a7fd8',
  yellow: '#f4d64f',
  green: '#7fbf72',
  'light green': '#b8d7a0',
  pink: '#e7a6b6',
}

const COLOR_PATTERN = /\b(black|dark grey|grey|gray|silver|white|milk|orange|blue|yellow|light green|green|pink)\b/i

function normalizeColorName(value: string) {
  return value.trim().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').toLowerCase()
}

function inferColorName(media: ProductDetailMedia) {
  const explicit = media.colorName?.trim()
  if (explicit) return explicit

  const source = [media.slug, media.title, media.alt, media.caption].filter(Boolean).join(' ')
  const match = source.match(COLOR_PATTERN)

  return match?.[1] ?? null
}

function resolveColorHex(label: string, explicitHex?: string | null) {
  if (explicitHex && /^#[0-9a-f]{3,8}$/i.test(explicitHex)) {
    return explicitHex
  }

  return COLOR_HEX_BY_NAME[normalizeColorName(label)] ?? '#d7d7d2'
}

function buildColorOptions(gallery: ProductDetailMedia[]) {
  const seen = new Set<string>()
  const options: ColorOption[] = []

  gallery.forEach((media, mediaIndex) => {
    const label = inferColorName(media)
    if (!label) return

    const key = normalizeColorName(label)
    if (seen.has(key)) return

    seen.add(key)
    options.push({
      key,
      label,
      hex: resolveColorHex(label, media.colorHex),
      mediaIndex,
    })
  })

  return options
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.2C7.14 3.2 3.2 7.14 3.2 12C3.2 13.73 3.7 15.41 4.65 16.86L3.6 20.4L7.24 19.38C8.63 20.26 10.23 20.8 12 20.8C16.86 20.8 20.8 16.86 20.8 12C20.8 7.14 16.86 3.2 12 3.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.08 8.82C8.78 8.82 8.52 8.97 8.37 9.23C8.05 9.76 7.94 10.4 8.1 10.99C8.42 12.15 9.21 13.29 10.28 14.35C11.35 15.42 12.49 16.21 13.65 16.53C14.24 16.69 14.88 16.58 15.41 16.27C15.68 16.11 15.83 15.85 15.83 15.54V14.72C15.83 14.48 15.67 14.27 15.44 14.2L13.7 13.68C13.5 13.62 13.28 13.68 13.13 13.84L12.61 14.39C12.53 14.47 12.41 14.5 12.3 14.47C11.64 14.24 10.56 13.38 10.18 12.69C10.12 12.59 10.14 12.46 10.22 12.38L10.77 11.87C10.93 11.71 10.99 11.49 10.93 11.29L10.41 9.55C10.34 9.31 10.13 9.15 9.89 9.15H9.08V8.82Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function ProductDetailHero({
  productName,
  brandLabel,
  entityType,
  gallery,
  intro,
  priceLabel,
  canonicalHandle,
  labels = [],
}: ProductDetailHeroProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedMedia = gallery[selectedIndex] ?? gallery[0] ?? null
  const colorOptions = useMemo(() => buildColorOptions(gallery), [gallery])
  const colorKeys = useMemo(() => new Set(colorOptions.map((color) => color.key)), [colorOptions])
  const uniqueLabels = useMemo(
    () => [...new Set(labels.filter((label) => label && !colorKeys.has(normalizeColorName(label))))].slice(0, 4),
    [colorKeys, labels],
  )
  const priceTitle = entityType === 'mobile' ? 'Listed phone price' : 'Price'
  const displayedPriceLabel = entityType === 'mobile' && priceLabel ? `≈ ${priceLabel}` : (priceLabel ?? 'Contact for price')
  const whatsappHref =
    entityType === 'mobile'
      ? `https://wa.me/923361070111?text=${encodeURIComponent(`Hi, I want to purchase this phone if available. Kindly tell me the price: ${productName}`)}`
      : 'https://wa.me/923361070111'

  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-4 font-sans shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:p-6 lg:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start">
        <div>
          <div className="rounded-[26px] border border-slate-200 bg-[#f8fafc] p-5 sm:p-7">
            {selectedMedia ? (
              <div className="relative h-[300px] w-full sm:h-[420px] lg:h-[540px]">
                <Image
                  key={selectedMedia.url}
                  src={selectedMedia.url}
                  alt={selectedMedia.alt || productName}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 56vw"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center rounded-[18px] border border-dashed border-slate-300 text-sm text-slate-400 sm:h-[420px] lg:h-[540px]">
                No image available
              </div>
            )}
          </div>

          {gallery.length > 1 ? (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {gallery.map((media, index) => {
                const isActive = index === selectedIndex

                return (
                  <button
                    key={media.id}
                    type="button"
                    aria-label={`Show ${media.colorName || media.title || `${productName} image ${index + 1}`}`}
                    aria-pressed={isActive}
                    onClick={() => setSelectedIndex(index)}
                    className={`rounded-[18px] border p-3 transition ${
                      isActive ? 'border-slate-900 bg-slate-50 shadow-[0_12px_28px_rgba(15,23,42,0.08)]' : 'border-slate-200 bg-white hover:border-slate-400'
                    }`}
                  >
                    <span className="relative block h-20 w-20 sm:h-24 sm:w-24">
                      <Image src={media.url} alt={media.alt || productName} fill sizes="96px" className="object-contain" />
                    </span>
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>

        <div className="lg:sticky lg:top-28">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">{brandLabel}</p>
          <h1 className="mt-3 font-sans text-[2rem] font-medium leading-tight tracking-normal text-slate-900 sm:text-[2.6rem]">
            {productName}
          </h1>

          {entityType === 'mobile' ? (
            <p className="mt-4 rounded-[22px] border border-sky-100 bg-sky-50 px-4 py-4 text-sm leading-6 text-sky-900">
              We also sell this phone. For availability, latest price, and ordering, please contact us on WhatsApp. This page also shows the chargers, protectors, earbuds, and other accessories linked to it.
            </p>
          ) : null}

          {intro ? <p className="mt-5 text-base leading-7 text-slate-600">{intro}</p> : null}

          {colorOptions.length > 0 ? (
            <div className="mt-6">
              <p className="text-sm text-slate-500">Colors</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {colorOptions.map((color) => {
                  const isActive = color.mediaIndex === selectedIndex
                  const isLight = ['white', 'milk', 'silver', 'yellow'].includes(color.key)

                  return (
                    <button
                      key={color.key}
                      type="button"
                      aria-label={`Show ${color.label}`}
                      title={color.label}
                      aria-pressed={isActive}
                      onClick={() => setSelectedIndex(color.mediaIndex)}
                      className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                        isActive ? 'border-slate-950 shadow-[0_0_0_4px_rgba(15,23,42,0.08)]' : 'border-slate-200 hover:border-slate-500'
                      }`}
                    >
                      <span
                        className={`block h-8 w-8 rounded-full ${isLight ? 'border border-slate-300' : ''}`}
                        style={{ backgroundColor: color.hex }}
                      />
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          {uniqueLabels.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {uniqueLabels.map((label) => (
                <span key={label} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
                  {label}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div>
              <p className="text-sm text-slate-500">{priceTitle}</p>
              <p className="mt-2 font-sans text-[1.9rem] font-medium leading-none tracking-normal text-slate-900">
                {displayedPriceLabel}
              </p>
            </div>
          </div>

          {entityType === 'product' ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href={`/order/${canonicalHandle}`}
                className="inline-flex h-12 items-center justify-center rounded-[16px] bg-slate-900 px-5 font-sans text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                Buy Now
              </Link>
              <Link
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] border border-[#b7f0cb] bg-[#e9fff1] px-5 font-sans text-sm font-medium text-[#118a45] transition-colors hover:bg-[#dcffea]"
              >
                <WhatsAppIcon />
                <span>Contact on WhatsApp</span>
              </Link>
            </div>
          ) : (
            <div className="mt-6">
              <Link
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[16px] border border-[#b7f0cb] bg-[#e9fff1] px-5 font-sans text-sm font-medium text-[#118a45] transition-colors hover:bg-[#dcffea] sm:w-auto sm:min-w-[240px]"
              >
                <WhatsAppIcon />
                <span>Contact on WhatsApp</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
