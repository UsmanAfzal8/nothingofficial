'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import type { ProductDetailMedia, ProductDetailSpecGroup, ProductFeatureSection, ProductFeatureSlide } from '@/lib/models/product-detail'
import orderIcon from '@/assets/icons/order.svg'
import packageIcon from '@/assets/icons/package.svg'
import deliverIcon from '@/assets/icons/deleiver.svg'
import cancelIcon from '@/assets/icons/cancel_icon.svg'
import folderIcon from '@/assets/icons/folder.svg'
import plusMinusIcon from '@/assets/icons/plus_minus_icon.svg'
import specsIcon from '@/assets/icons/specs.svg'
import specIconLinks from '@/assets/icons/spec-icon-links.json'

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
  specGroups?: ProductDetailSpecGroup[]
  featureSections?: ProductFeatureSection[]
}

type ColorOption = {
  key: string
  label: string
  hex: string
  mediaIndex: number
}

const specIcons = specIconLinks as Record<string, string>
const featureBadgePositions = [
  'right-4 top-32 sm:right-12 sm:top-[38%] lg:right-[17%] lg:top-[52%]',
  'right-4 top-56 sm:right-20 sm:top-[20%] lg:right-[10%] lg:top-[22%]',
  'left-[18%] top-[42%]',
  'right-[10%] bottom-[18%]',
] as const

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

function normalizeSpecIconKey(value: string) {
  return value.trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function getSpecIconUrl(group: ProductDetailSpecGroup) {
  const keys = [group.iconKey, normalizeSpecIconKey(group.title)].filter(Boolean) as string[]

  for (const key of keys) {
    const iconUrl = specIcons[key]

    if (iconUrl) {
      return iconUrl
    }
  }

  return specIcons['other-features'] ?? specsIcon
}

function inferSpecSections(group: ProductDetailSpecGroup) {
  if (group.specs.some((spec) => spec.section)) {
    return group.specs
  }

  if (normalizeSpecIconKey(group.title) !== 'camera') {
    return group.specs
  }

  const cameraSections = ['Main camera', 'Periscope camera', 'Ultra-wide camera', 'Front camera', 'TrueLens Engine 4', 'Video recording']
  let sectionIndex = 0

  return group.specs.map((spec, index) => {
    const labelKey = spec.label.trim().toLowerCase()
    const valueKey = spec.value.trim().toLowerCase()

    if (index > 0 && labelKey === 'resolution' && sectionIndex < 3) {
      sectionIndex += 1
    }

    if (labelKey === 'front camera' && sectionIndex < 3) {
      sectionIndex = 3
    }

    if (labelKey === 'truelens engine 4' || valueKey.includes('ultra xdr')) {
      sectionIndex = Math.max(sectionIndex, 4)
    }

    if (labelKey === 'video recording' || valueKey.includes('fps') || valueKey.includes('time lapse')) {
      sectionIndex = cameraSections.length - 1
    }

    if (!labelKey && sectionIndex < cameraSections.length - 2 && index > 0) {
      sectionIndex = Math.max(sectionIndex, 4)
    }

    return {
      ...spec,
      section: cameraSections[sectionIndex],
    }
  })
}

function SpecsFolderBadge({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      className="group absolute left-4 top-28 z-40 flex cursor-pointer flex-col items-center rounded-[18px] p-2 transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 sm:left-8 sm:top-32 lg:left-14 lg:top-36"
      onClick={onOpen}
      aria-label="Open specs"
    >
      <span className="relative block h-[60px] w-[60px] transition-transform duration-300 ease-out group-hover:scale-110 sm:h-[72px] sm:w-[72px]">
        <Image
          src={folderIcon}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        />
        <Image
          src={specsIcon}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2 object-contain transition-transform duration-300 ease-out group-hover:scale-110 sm:h-[36px] sm:w-[36px]"
        />
      </span>
      <span className="mt-3 text-center font-serif text-[0.9rem] text-black transition-transform duration-300 ease-out group-hover:scale-105 sm:text-[1rem]">Specs</span>
    </button>
  )
}

function SpecsOverlay({
  groups,
  openGroupId,
  onToggleGroup,
  onClose,
}: {
  groups: ProductDetailSpecGroup[]
  openGroupId: string | null
  onToggleGroup: (groupId: string) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-white/25 backdrop-blur-[20px]">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle,#111_1.2px,transparent_1.45px)] [background-position:1.4rem_1.4rem] [background-size:7.5rem_7.5rem] sm:[background-size:9.5rem_7.75rem]" />

      <div className="relative mx-auto min-h-screen w-full max-w-[560px] px-4 pb-10 pt-5">
        <div className="grid h-[54px] grid-cols-[44px_minmax(0,1fr)_44px] items-center rounded-[10px] bg-white/[0.9] px-2 shadow-[0_14px_36px_rgba(17,17,17,0.08)] backdrop-blur-md">
          <button
            type="button"
            aria-label="Close specs"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] transition-opacity hover:opacity-65"
            onClick={onClose}
          >
            <Image src={cancelIcon} alt="" aria-hidden="true" className="h-[18px] w-[18px] object-contain opacity-75" />
          </button>
          <p className="text-center [font-family:var(--font-ndot57)] text-[1.25rem] uppercase leading-none tracking-[0.16em] text-black">
            Specs
          </p>
          <span aria-hidden="true" />
        </div>

        <div className="mt-5 grid gap-1.5">
          {groups.length > 0 ? (
            groups.map((group) => {
              const isOpen = openGroupId === group.id
              const displaySpecs = inferSpecSections(group)
              const groupedSpecs = displaySpecs.reduce<Array<{ section: string | null; specs: typeof displaySpecs }>>((sections, spec) => {
                const section = spec.section ?? null
                const currentSection = sections[sections.length - 1]

                if (currentSection && currentSection.section === section) {
                  currentSection.specs.push(spec)
                } else {
                  sections.push({ section, specs: [spec] })
                }

                return sections
              }, [])

              return (
                <div key={group.id} className="overflow-hidden rounded-[8px] bg-white/[0.9] shadow-[0_10px_26px_rgba(17,17,17,0.06)] backdrop-blur-md">
                  <button
                    type="button"
                    className="grid min-h-[54px] w-full grid-cols-[28px_minmax(0,1fr)_24px] items-center gap-3 px-4 text-left transition-colors hover:bg-white/55"
                    onClick={() => onToggleGroup(group.id)}
                    aria-expanded={isOpen}
                  >
                    <Image src={getSpecIconUrl(group)} alt="" aria-hidden="true" width={18} height={18} className="h-[18px] w-[18px] object-contain opacity-80" />
                    <span className="product-card-name text-[1rem] leading-none text-black sm:text-[1.16rem]">{group.title}</span>
                    <Image
                      src={plusMinusIcon}
                      alt=""
                      aria-hidden="true"
                      className={`h-[14px] w-[14px] object-contain opacity-70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isOpen ? (
                    <div className="product-card-name px-4 py-4 text-[0.82rem] leading-5 text-black/72 sm:text-[0.88rem]">
                      {group.mediaUrl ? (
                        <div className="relative mb-4 overflow-hidden rounded-[8px] bg-white/70">
                          <Image
                            src={group.mediaUrl}
                            alt={group.mediaAlt || group.title}
                            width={900}
                            height={650}
                            loading="lazy"
                            fetchPriority="low"
                            sizes="(max-width: 640px) 100vw, 520px"
                            className="h-auto w-full object-contain"
                          />
                        </div>
                      ) : null}

                      {groupedSpecs.length > 0 ? (
                        <dl>
                          {groupedSpecs.map((section) => (
                            <Fragment key={section.section ?? 'default'}>
                              {section.section ? (
                                <dt className="product-card-name pb-2 pt-4 text-[0.9rem] leading-tight text-[#b2b3b3] first:pt-0 sm:text-[0.98rem]">{section.section}</dt>
                              ) : null}
                              {section.specs.map((spec) => {
                                const hasLabel = spec.label.trim().length > 0

                                return (
                                  <div key={spec.id} className="grid gap-1 py-1.5 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-5">
                                    {hasLabel ? (
                                      <>
                                        <dt className="[font-family:var(--font-lettera-regular)] text-[#010101]">{spec.label}</dt>
                                        <dd className="whitespace-pre-line [font-family:var(--font-lettera-regular)] text-[#010101]">{spec.value}</dd>
                                      </>
                                    ) : (
                                      <dd className="whitespace-pre-line [font-family:var(--font-lettera-regular)] text-[#010101] sm:col-span-2">{spec.value}</dd>
                                    )}
                                  </div>
                                )
                              })}
                            </Fragment>
                          ))}
                        </dl>
                      ) : (
                        <p>No spec details available yet.</p>
                      )}
                    </div>
                  ) : null}
                </div>
              )
            })
          ) : (
            <div className="rounded-[8px] bg-white/84 px-4 py-5 text-center product-card-name text-lg text-black/70">
              No specs available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function isHlsVideo(url?: string | null) {
  return Boolean(url && /\.m3u8(?:$|\?)/i.test(url))
}

function getFeatureThumbnail(section: ProductFeatureSection) {
  const firstSlide = section.slides[0]

  return (
    section.coverThumbnailUrl ||
    section.coverImageUrl ||
    firstSlide?.thumbnailUrl ||
    firstSlide?.imageUrl ||
    null
  )
}

function getFeatureMedia(section: ProductFeatureSection, slide?: ProductFeatureSlide | null) {
  return {
    imageUrl: slide?.imageUrl || slide?.thumbnailUrl || section.coverImageUrl || section.coverThumbnailUrl || null,
    videoUrl: slide?.videoUrl || section.coverVideoUrl || null,
    thumbnailUrl: slide?.thumbnailUrl || slide?.imageUrl || section.coverThumbnailUrl || section.coverImageUrl || null,
  }
}

function HlsFeatureVideo({
  videoUrl,
  posterUrl,
  title,
}: {
  videoUrl: string
  posterUrl?: string | null
  title: string
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const video = videoRef.current
    let hls: { destroy: () => void; loadSource: (source: string) => void; attachMedia: (media: HTMLMediaElement) => void } | null = null
    let cancelled = false

    if (!video) return undefined

    if (!isHlsVideo(videoUrl) || video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl
      video.play().catch(() => undefined)

      return () => {
        video.removeAttribute('src')
        video.load()
      }
    }

    import('hls.js')
      .then(({ default: Hls }) => {
        if (cancelled || !video) return

        if (Hls.isSupported()) {
          hls = new Hls({ enableWorker: true })
          hls.loadSource(videoUrl)
          hls.attachMedia(video)
          video.play().catch(() => undefined)
        }
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
      hls?.destroy()
      video.removeAttribute('src')
      video.load()
    }
  }, [videoUrl])

  return (
    <video
      ref={videoRef}
      poster={posterUrl || undefined}
      aria-label={title}
      className="h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
    />
  )
}

function FeatureVisual({
  media,
  title,
}: {
  media: ReturnType<typeof getFeatureMedia>
  title: string
}) {
  if (media.videoUrl) {
    return <HlsFeatureVideo key={media.videoUrl} videoUrl={media.videoUrl} posterUrl={media.thumbnailUrl || media.imageUrl} title={title} />
  }

  const stillImageUrl = media.imageUrl || media.thumbnailUrl

  if (stillImageUrl) {
    return (
      <Image
        key={stillImageUrl}
        src={stillImageUrl}
        alt={title}
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover object-center"
      />
    )
  }

  return <div className="h-full w-full bg-[#d8dedc]" />
}

function DotArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  const rightPoints = [
    [4, 10],
    [8, 10],
    [12, 10],
    [16, 10],
    [14, 6],
    [16, 8],
    [18, 10],
    [16, 12],
    [14, 14],
  ]
  const points = direction === 'right' ? rightPoints : rightPoints.map(([x, y]) => [22 - x, y])

  return (
    <svg width="22" height="20" viewBox="0 0 22 20" fill="none" aria-hidden="true">
      {points.map(([cx, cy], index) => (
        <circle key={`${cx}-${cy}-${index}`} cx={cx} cy={cy} r="1.25" fill="currentColor" />
      ))}
    </svg>
  )
}

function ProductFeatureBadge({
  section,
  index,
  onOpen,
}: {
  section: ProductFeatureSection
  index: number
  onOpen: () => void
}) {
  const thumbnailUrl = getFeatureThumbnail(section)
  const position = featureBadgePositions[index % featureBadgePositions.length]

  return (
    <button
      type="button"
      className={`group absolute z-40 flex max-w-[142px] cursor-pointer flex-col items-center text-center text-white outline-none transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-105 focus-visible:ring-2 focus-visible:ring-white/70 ${position}`}
      onClick={onOpen}
      aria-label={`Open ${section.title}`}
    >
      <span className="relative block h-[76px] w-[76px] overflow-hidden rounded-[12px] bg-white/85 shadow-[0_18px_44px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-out group-hover:scale-110 sm:h-[92px] sm:w-[92px]">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt=""
            aria-hidden="true"
            fill
            loading="lazy"
            fetchPriority="low"
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center bg-[#f2f2ef] text-black">
            <DotArrowIcon direction="right" />
          </span>
        )}
      </span>
      <span className="mt-3 text-center font-serif text-[0.9rem] leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out group-hover:scale-105 sm:text-[1rem]">
        {section.title}
      </span>
    </button>
  )
}

function ProductFeatureOverlay({
  section,
  activeSlideIndex,
  onSelectSlide,
  onClose,
}: {
  section: ProductFeatureSection
  activeSlideIndex: number
  onSelectSlide: (slideIndex: number) => void
  onClose: () => void
}) {
  const slides = section.slides.length > 0 ? section.slides : []
  const activeSlide = slides[activeSlideIndex] ?? slides[0] ?? null
  const activeMedia = getFeatureMedia(section, activeSlide)
  const slideCount = slides.length
  const goToSlide = (slideIndex: number) => {
    if (slideCount === 0) return

    onSelectSlide((slideIndex + slideCount) % slideCount)
  }

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden bg-[#d9dfdd] text-white">
      <div className="absolute inset-0">
        <FeatureVisual media={activeMedia} title={activeSlide?.title || section.title} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-black/5" />
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle,#fff_1.5px,transparent_1.8px)] [background-position:4rem_4rem] [background-size:8rem_8rem] sm:[background-size:8rem_8rem]" />

      <div className="relative z-10 mx-auto flex h-screen min-h-[620px] w-full max-w-[560px] flex-col px-4 py-5">
        <div className="grid h-[54px] grid-cols-[44px_minmax(0,1fr)_96px] items-center rounded-[8px] bg-[#686854]/80 px-2 shadow-[0_14px_36px_rgba(0,0,0,0.12)] backdrop-blur-md">
          <button
            type="button"
            aria-label={`Close ${section.title}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] transition-opacity hover:opacity-70"
            onClick={onClose}
          >
            <Image src={cancelIcon} alt="" aria-hidden="true" className="h-[16px] w-[16px] object-contain invert" />
          </button>
          <p className="truncate text-center [font-family:var(--font-ndot57)] text-[1.05rem] uppercase leading-none tracking-[0.12em] text-white sm:text-[1.2rem]">
            {section.title}
          </p>
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              aria-label="Previous feature slide"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] text-white transition-opacity hover:opacity-70 disabled:opacity-35"
              disabled={slideCount < 2}
              onClick={() => goToSlide(activeSlideIndex - 1)}
            >
              <DotArrowIcon direction="left" />
            </button>
            <button
              type="button"
              aria-label="Next feature slide"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] text-white transition-opacity hover:opacity-70 disabled:opacity-35"
              disabled={slideCount < 2}
              onClick={() => goToSlide(activeSlideIndex + 1)}
            >
              <DotArrowIcon direction="right" />
            </button>
          </div>
        </div>

        <div className="mt-auto pb-7">
          <article className="mx-auto max-w-[545px] rounded-[8px] bg-[#716b50]/80 px-5 py-5 text-white shadow-[0_18px_54px_rgba(0,0,0,0.16)] backdrop-blur-md sm:px-6 sm:py-6">
            <h2 className="[font-family:var(--font-georgia)] text-[1.45rem] leading-tight text-white sm:text-[1.65rem]">
              {activeSlide?.title || section.title}
            </h2>
            {activeSlide?.body ? (
              <p className="mt-5 [font-family:var(--font-georgia)] text-[0.95rem] leading-6 text-white sm:text-[1.02rem]">
                {activeSlide.body}
              </p>
            ) : null}
          </article>

          {slideCount > 1 ? (
            <div className="mt-5 flex items-center justify-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Show ${slide.title}`}
                  aria-pressed={index === activeSlideIndex}
                  className={`h-2.5 w-2.5 rounded-full transition ${index === activeSlideIndex ? 'bg-white/95' : 'bg-white/50 hover:bg-white/75'}`}
                  onClick={() => onSelectSlide(index)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
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
        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 sm:h-[86px] sm:w-[86px] sm:border-4 lg:h-[74px] lg:w-[74px] ${
          active
            ? 'border-white bg-[#fff7ef] shadow-[0_14px_28px_rgba(244,110,30,0.18)]'
            : 'border-[#f2f2f2] bg-[#f8f8f8] shadow-[0_10px_20px_rgba(15,23,42,0.04)]'
        }`}
      >
        <Image src={icon} alt="" aria-hidden="true" className={`h-3.5 w-3.5 object-contain sm:h-7 sm:w-7 ${active ? '' : 'grayscale opacity-55'}`} />
      </div>
      <p className={`mt-1.5 text-[0.42rem] font-extrabold uppercase tracking-normal sm:mt-3 sm:text-[0.8rem] ${active ? 'text-[#ff7a00]' : 'text-[#4f5a6c]'}`}>
        {label}
      </p>
      <p className={`mt-0.5 text-[0.4rem] font-semibold sm:mt-1 sm:text-[0.78rem] ${active ? 'text-[#71798a]' : 'text-[#9ea6b4]'}`}>
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
    <div className="mt-6 rounded-[1.1rem] border border-[#f7d9b7] bg-[linear-gradient(180deg,#fffdfa_0%,#ffffff_100%)] px-2.5 py-2.5 shadow-[0_18px_42px_rgba(244,110,30,0.08)] sm:rounded-[1.85rem] sm:px-5 sm:py-6">
      <p className="text-[0.48rem] font-black uppercase tracking-normal text-[#8d8d8d] sm:text-[0.95rem]">
        Estimated Delivery
      </p>
      <p className="mt-0.5 font-sans text-[1rem] font-bold leading-none tracking-normal text-[#ff6f00] sm:mt-1 sm:text-[2.35rem]">
        {deliveryTimeline.deliveryRangeLabel}
      </p>

      <div className="mt-2.5 border-t border-dashed border-[#f0c89d] pt-2.5 sm:mt-5 sm:pt-5">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0.6rem,1fr)_minmax(0,1fr)_minmax(0.6rem,1fr)_minmax(0,1fr)] items-start sm:grid-cols-[minmax(0,1fr)_minmax(2.5rem,1fr)_minmax(0,1fr)_minmax(2.5rem,1fr)_minmax(0,1fr)]">
          <DeliveryTimelineStep icon={orderIcon} label="Order" dateLabel="Today" active />
          <div className="mt-4 h-0.5 rounded-full bg-[#ff7a00] sm:mt-[2.55rem] sm:h-1" />
          <DeliveryTimelineStep icon={packageIcon} label="Process" dateLabel={deliveryTimeline.processDateLabel} active />
          <div className="mt-4 h-0.5 rounded-full bg-[#edf0f5] sm:mt-[2.55rem] sm:h-1" />
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
  specGroups = [],
  featureSections = [],
}: ProductDetailHeroProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isSpecsOpen, setIsSpecsOpen] = useState(false)
  const [openSpecGroupId, setOpenSpecGroupId] = useState<string | null>(null)
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null)
  const [activeFeatureSlideIndex, setActiveFeatureSlideIndex] = useState(0)
  const selectedMedia = gallery[selectedIndex] ?? gallery[0] ?? null
  const activeFeature = featureSections.find((section) => section.id === activeFeatureId) ?? null
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
      ? `https://api.whatsapp.com/send?phone=923361070111&text=${encodeURIComponent(`Hi, I want to purchase this phone if available. Kindly tell me the price: ${productName}`)}`
      : 'https://api.whatsapp.com/send?phone=923361070111'
  const buyHref = `/order/${canonicalHandle}`
  const hasSpecGroups = specGroups.some((group) => group.specs.length > 0 || group.mediaUrl)

  useEffect(() => {
    document.body.style.overflow = isSpecsOpen || activeFeature ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [activeFeature, isSpecsOpen])

  if (backgroundImage) {
    return (
      <section className="relative min-h-screen overflow-hidden bg-[#e8e8e6] font-sans">
        <Image
          src={backgroundImage.url}
          alt={backgroundImage.alt || productName}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle,#111_1.2px,transparent_1.45px)] [background-position:1.4rem_1.4rem] [background-size:7.5rem_7.5rem] sm:[background-size:9.5rem_7.75rem]" />
        {hasSpecGroups ? <SpecsFolderBadge onOpen={() => setIsSpecsOpen(true)} /> : null}
        {featureSections.map((section, index) => (
          <ProductFeatureBadge
            key={section.id}
            section={section}
            index={index}
            onOpen={() => {
              setIsSpecsOpen(false)
              setOpenSpecGroupId(null)
              setActiveFeatureId(section.id)
              setActiveFeatureSlideIndex(0)
            }}
          />
        ))}
        {isSpecsOpen ? (
          <SpecsOverlay
            groups={specGroups}
            openGroupId={openSpecGroupId}
            onToggleGroup={(groupId) => setOpenSpecGroupId((current) => (current === groupId ? null : groupId))}
            onClose={() => {
              setIsSpecsOpen(false)
              setOpenSpecGroupId(null)
            }}
          />
        ) : null}
        {activeFeature ? (
          <ProductFeatureOverlay
            section={activeFeature}
            activeSlideIndex={activeFeatureSlideIndex}
            onSelectSlide={setActiveFeatureSlideIndex}
            onClose={() => {
              setActiveFeatureId(null)
              setActiveFeatureSlideIndex(0)
            }}
          />
        ) : null}

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
                      loading="eager"
                      fetchPriority="high"
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
                  fetchPriority="high"
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
                      <Image
                        src={media.url}
                        alt={media.alt || productName}
                        fill
                        loading="lazy"
                        fetchPriority="low"
                        sizes="96px"
                        className="object-contain"
                      />
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
