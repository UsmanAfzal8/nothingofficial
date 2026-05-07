'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { ProductDetailMedia } from '@/lib/models/product-detail'
import orderIcon from '@/assets/icons/order.svg'
import packageIcon from '@/assets/icons/package.svg'
import deliverIcon from '@/assets/icons/deleiver.svg'

type ProductDetailHeroProps = {
  productName: string
  brandLabel: string
  entityType: 'product' | 'mobile'
  gallery: ProductDetailMedia[]
  backgroundImage?: ProductDetailMedia | null
  intro: string | null
  priceLabel?: string | null
  canonicalHandle: string
  labels?: string[]
  deliveryTimeline?: {
    processDateLabel: string
    deliveryRangeLabel: string
  }
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
  green: '#8fb57e',
  'light green': '#b7c9a6',
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

function DeliveryTimelineStep({
  icon,
  label,
  dateLabel,
  active = false,
}: {
  icon: typeof orderIcon
  label: string
  dateLabel: string
  active?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full border-4 sm:h-[86px] sm:w-[86px] lg:h-[74px] lg:w-[74px] ${
          active
            ? 'border-white bg-[#fff7ef] shadow-[0_14px_28px_rgba(244,110,30,0.18)]'
            : 'border-[#f2f2f2] bg-[#f8f8f8] shadow-[0_10px_20px_rgba(15,23,42,0.04)]'
        }`}
      >
        <Image src={icon} alt="" aria-hidden="true" className={`h-7 w-7 object-contain ${active ? '' : 'grayscale opacity-55'}`} />
      </div>
      <p className={`mt-3 text-[0.8rem] font-extrabold uppercase tracking-normal ${active ? 'text-[#ff7a00]' : 'text-[#4f5a6c]'}`}>
        {label}
      </p>
      <p className={`mt-1 text-[0.78rem] font-semibold ${active ? 'text-[#71798a]' : 'text-[#9ea6b4]'}`}>
        {dateLabel}
      </p>
    </div>
  )
}

function DeliveryTimelineCard({
  deliveryTimeline,
}: {
  deliveryTimeline: NonNullable<ProductDetailHeroProps['deliveryTimeline']>
}) {
  return (
    <div className="mt-6 rounded-[1.85rem] border border-[#f7d9b7] bg-[linear-gradient(180deg,#fffdfa_0%,#ffffff_100%)] px-4 py-5 shadow-[0_18px_42px_rgba(244,110,30,0.08)] sm:px-5 sm:py-6">
      <p className="text-[0.95rem] font-black uppercase tracking-normal text-[#8d8d8d]">
        Estimated Delivery
      </p>
      <p className="mt-1 font-sans text-[2rem] font-bold leading-none tracking-normal text-[#ff6f00] sm:text-[2.35rem]">
        {deliveryTimeline.deliveryRangeLabel}
      </p>

      <div className="mt-5 border-t border-dashed border-[#f0c89d] pt-5">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(1.2rem,1fr)_minmax(0,1fr)_minmax(1.2rem,1fr)_minmax(0,1fr)] items-start sm:grid-cols-[minmax(0,1fr)_minmax(2.5rem,1fr)_minmax(0,1fr)_minmax(2.5rem,1fr)_minmax(0,1fr)]">
          <DeliveryTimelineStep icon={orderIcon} label="Order" dateLabel="Today" active />
          <div className="mt-8 h-1 rounded-full bg-[#ff7a00] sm:mt-[2.55rem]" />
          <DeliveryTimelineStep icon={packageIcon} label="Process" dateLabel={deliveryTimeline.processDateLabel} active />
          <div className="mt-8 h-1 rounded-full bg-[#edf0f5] sm:mt-[2.55rem]" />
          <DeliveryTimelineStep icon={deliverIcon} label="Deliver" dateLabel={deliveryTimeline.deliveryRangeLabel} />
        </div>
      </div>
    </div>
  )
}

function isHtmlSnippet(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

function IntroContent({ intro, compact = false }: { intro: string | null; compact?: boolean }) {
  if (!intro) return null

  const className = compact
    ? 'mt-3 text-[0.5rem] uppercase leading-[1.35] tracking-[0.1em] text-black sm:text-[0.56rem] [&_.np-feature-list]:space-y-1.5 [&_.np-feature]:flex [&_.np-feature]:items-center [&_.np-feature]:gap-1.5 [&_.np-feature_img]:h-2.5 [&_.np-feature_img]:w-2.5 [&_.np-feature_img]:shrink-0'
    : 'mt-5 text-base leading-7 text-slate-600 [&_.np-feature-list]:space-y-3 [&_.np-feature]:flex [&_.np-feature]:items-center [&_.np-feature]:gap-3 [&_.np-feature_img]:h-4 [&_.np-feature_img]:w-4 [&_.np-feature_img]:shrink-0'

  if (isHtmlSnippet(intro)) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: intro }} />
  }

  return <p className={className}>{intro}</p>
}

function formatHeroPrice(priceLabel?: string | null) {
  if (!priceLabel) return 'Contact for price'

  return priceLabel.replace(/^Rs\s*/i, 'PKR ')
}

export function ProductDetailHero({
  productName,
  brandLabel,
  entityType,
  gallery,
  backgroundImage,
  intro,
  priceLabel,
  canonicalHandle,
  labels = [],
  deliveryTimeline,
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
  const buyHref = `/order/${canonicalHandle}`

  if (backgroundImage) {
    return (
      <section className="relative min-h-screen overflow-hidden bg-[#e8e8e6] font-sans">
        <Image
          src={backgroundImage.url}
          alt={backgroundImage.alt || productName}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle,#111_1.2px,transparent_1.45px)] [background-position:1.4rem_1.4rem] [background-size:7.5rem_7.5rem] sm:[background-size:9.5rem_7.75rem]" />

        <div className="relative z-10 flex min-h-screen items-end justify-center px-4 pb-6 pt-24 sm:px-8 sm:pb-10">
          <div className="w-full max-w-[470px] rounded-[14px] border border-white/80 bg-[#fbf7ef] p-4 text-black shadow-[0_24px_80px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.88)] sm:p-5">
            <div className="grid grid-cols-[104px_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[124px_minmax(0,1fr)]">
              {selectedMedia ? (
                <div className="w-full max-w-[104px] sm:max-w-[124px]">
                  <div className="relative mx-auto aspect-square w-[82px] sm:w-full">
                    <Image
                      src={selectedMedia.url}
                      alt={selectedMedia.alt || productName}
                      fill
                      priority
                      sizes="210px"
                      className="object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.16)]"
                    />
                  </div>

                  {colorOptions.length > 0 ? (
                    <div className="mt-2 flex flex-wrap justify-center gap-1.5">
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
                            className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                              isActive ? 'border-black shadow-[0_0_0_3px_rgba(0,0,0,0.10)]' : 'border-black/20 hover:border-black/55'
                            }`}
                          >
                            <span
                              className={`block h-3 w-3 rounded-full ${isLight ? 'border border-black/20' : ''}`}
                              style={{ backgroundColor: color.hex }}
                            />
                          </button>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="min-w-0">
                <h1 className="[font-family:var(--font-ndot57)] text-[0.86rem] lowercase leading-none tracking-[0.13em] sm:text-[1rem]">
                  {productName}
                </h1>
                <IntroContent intro={intro} compact />
                <p className="mt-3 [font-family:var(--font-ndot57)] text-[0.6rem] uppercase tracking-[0.16em] text-black sm:text-[0.68rem]">
                  {formatHeroPrice(priceLabel)}
                </p>
              </div>
            </div>

            {entityType === 'product' ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Link
                  href={buyHref}
                  className="inline-flex h-10 items-center justify-center rounded-[8px] bg-black px-3 [font-family:var(--font-ndot57)] text-[0.95rem] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#1b1b1b] sm:h-10 sm:text-[1rem] sm:tracking-[0.08em]"
                >
                  Buy Now
                </Link>
                <Link
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[8px] bg-[#20c65a] px-3 [font-family:var(--font-ndot57)] text-[0.86rem] font-bold uppercase tracking-[0.03em] text-white transition-colors hover:bg-[#18ad4d] sm:h-10 sm:text-[0.92rem] sm:tracking-[0.04em]"
                >
                  <WhatsAppIcon />
                  <span>Contact on WhatsApp</span>
                </Link>
              </div>
            ) : (
              <div className="mt-3">
                <Link
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-[8px] bg-[#20c65a] px-3 [font-family:var(--font-ndot57)] text-[0.86rem] font-bold uppercase tracking-[0.03em] text-white transition-colors hover:bg-[#18ad4d] sm:h-10 sm:text-[0.92rem] sm:tracking-[0.04em]"
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

  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-4 font-sans shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:p-6 lg:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start">
        <div className="min-w-0">
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
            <div className="mt-4 flex max-w-full gap-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
              {gallery.map((media, index) => {
                const isActive = index === selectedIndex

                return (
                  <button
                    key={media.id}
                    type="button"
                    aria-label={`Show ${media.colorName || media.title || `${productName} image ${index + 1}`}`}
                    aria-pressed={isActive}
                    onClick={() => setSelectedIndex(index)}
                    className={`shrink-0 rounded-[18px] border p-2 transition sm:p-3 ${
                      isActive ? 'border-slate-900 bg-slate-50 shadow-[0_12px_28px_rgba(15,23,42,0.08)]' : 'border-slate-200 bg-white hover:border-slate-400'
                    }`}
                  >
                    <span className="relative block h-[72px] w-[72px] sm:h-24 sm:w-24">
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

          <IntroContent intro={intro} />

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

          {deliveryTimeline ? <DeliveryTimelineCard deliveryTimeline={deliveryTimeline} /> : null}

          {entityType === 'product' ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href={`/order/${canonicalHandle}`}
                className="inline-flex h-12 items-center justify-center rounded-[16px] bg-slate-900 px-5 font-sans text-base font-bold text-white transition-colors hover:bg-slate-800 sm:text-lg"
              >
                Buy Now
              </Link>
              <Link
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] border border-[#b7f0cb] bg-[#e9fff1] px-5 font-sans text-base font-bold text-[#118a45] transition-colors hover:bg-[#dcffea] sm:text-lg"
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
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[16px] border border-[#b7f0cb] bg-[#e9fff1] px-5 font-sans text-base font-bold text-[#118a45] transition-colors hover:bg-[#dcffea] sm:w-auto sm:min-w-[240px] sm:text-lg"
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
