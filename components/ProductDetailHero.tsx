'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import type { ProductDetailMedia, ProductDetailSpecGroup, ProductFeatureSection, ProductFeatureSlide } from '@/lib/models/product-detail'
import cancelIcon from '@/assets/icons/cancel_icon.svg'
import folderIcon from '@/assets/icons/folder.svg'
import plusMinusIcon from '@/assets/icons/plus_minus_icon.svg'
import specsIcon from '@/assets/icons/specs.svg'
import specIconLinks from '@/assets/icons/spec-icon-links.json'
import { buildCloudinaryVideoUrl } from '@/lib/cloudinary-image-loader'
import { getMobileWarrantyBadgeUrl } from '@/lib/data/mobile-warranty'

type ProductDetailHeroProps = {
  productName: string
  seoHeading: string
  brandLabel: string
  entityType: 'product' | 'mobile'
  gallery: ProductDetailMedia[]
  backgroundImage?: ProductDetailMedia | null
  backgroundImages?: ProductDetailMedia[]
  intro: string | null
  priceLabel?: string | null
  originalPriceLabel?: string | null
  warrantyYears?: number | null
  warrantyMonths?: number | null
  warrantyPriceLabel?: string | null
  canonicalHandle: string
  initialColor?: string | null
  initialMediaId?: string | null
  labels?: string[]
  deliveryTimeline?: {
    processDateLabel: string
    deliveryRangeLabel: string
  }
  hasSpecs?: boolean
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
const firstBackgroundBadgePositions = [
  'right-[8%] top-[243px] sm:left-[8%] sm:top-[11%] lg:left-[10%] lg:top-[63%]',
  'left-[38%] top-[443px] sm:right-[6%] sm:left-auto sm:top-[36%] lg:right-[2%] lg:top-[38%]',
  'left-[38%] top-[764px] sm:right-[11%] sm:left-auto sm:top-[11%] lg:right-[18%] lg:top-[13%]',
  'right-[8%] top-[764px] sm:right-[11%] sm:top-auto sm:bottom-[17%] lg:right-[18%] lg:top-[76%] lg:bottom-auto',
  'left-[8%] top-[243px] sm:left-[13%] sm:top-[34%] lg:left-[18%] lg:top-[38%]',
] as const
const secondBackgroundBadgePositions = [
  'right-[6%] top-[31%] sm:right-[12%] sm:top-[36%] lg:right-[18%] lg:top-[45%]',
  'left-[8%] top-[11%] sm:left-[13%] sm:top-[13%] lg:left-[18%] lg:top-[20%]',
  'left-[28%] top-[12%] sm:left-[30%] sm:top-[13%] lg:left-[34%] lg:top-[20%]',
  'right-[8%] top-[12%] sm:right-[12%] sm:top-[13%] lg:right-[18%] lg:top-[20%]',
  'left-[12%] bottom-[18%] sm:left-[18%] sm:bottom-[18%] lg:left-[26%] lg:top-[62%]',
  'left-[48%] bottom-[10%] sm:left-[50%] sm:bottom-[10%] lg:left-[50%] lg:top-[75%]',
  'right-[7%] bottom-[12%] sm:right-[13%] sm:bottom-[12%] lg:right-[8%] lg:top-[61%]',
] as const
const largeFeatureKeys = new Set(['official-its-metal-now', 'official-zooooom', 'official-nothing-os', 'official-playground'])
const mobileLargeFeatureKeys = new Set(['official-zooooom', 'official-nothing-os', 'official-playground'])

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

function resolveInitialMediaIndex(
  gallery: ProductDetailMedia[],
  initialColor?: string | null,
  initialMediaId?: string | null,
) {
  if (initialMediaId) {
    const mediaIndex = gallery.findIndex((media) => media.id === initialMediaId)
    if (mediaIndex >= 0) return mediaIndex
  }

  if (initialColor) {
    const colorKey = normalizeColorName(initialColor)
    const colorIndex = gallery.findIndex((media) => {
      const mediaColor = inferColorName(media)
      return mediaColor ? normalizeColorName(mediaColor) === colorKey : false
    })
    if (colorIndex >= 0) return colorIndex
  }

  return 0
}

function buildOrderHref(canonicalHandle: string, selectedMedia: ProductDetailMedia | null) {
  const searchParams = new URLSearchParams()
  const colorName = selectedMedia ? inferColorName(selectedMedia) : null

  if (colorName) searchParams.set('color', colorName)
  if (selectedMedia?.id) searchParams.set('media', selectedMedia.id)

  const query = searchParams.toString()
  return `/order/${canonicalHandle}${query ? `?${query}` : ''}`
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
      className="group absolute left-8 top-24 z-40 flex cursor-pointer flex-col items-center rounded-[18px] p-2 transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 sm:left-8 sm:top-32 lg:left-14 lg:top-36"
      onClick={onOpen}
      aria-label="Open specs"
    >
      <span className="relative block h-[60px] w-[60px] transition-transform duration-300 ease-out group-hover:scale-110 sm:h-[72px] sm:w-[72px]">
        <Image
          src={folderIcon}
          alt="Specs folder icon"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        />
        <Image
          src={specsIcon}
          alt="Specs icon"
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2 object-contain transition-transform duration-300 ease-out group-hover:scale-110 sm:h-[36px] sm:w-[36px]"
        />
      </span>
      <span className="mt-3 text-center [font-family:var(--font-lettera-regular)] text-[0.72rem] leading-tight text-[#8f918a] [text-shadow:0_1px_8px_rgba(255,255,255,0.42),0_1px_8px_rgba(0,0,0,0.32)] transition-transform duration-300 ease-out group-hover:scale-105 sm:text-[0.86rem]">
        Specs
      </span>
    </button>
  )
}

function SpecsOverlay({
  groups,
  isLoading,
  openGroupId,
  onToggleGroup,
  onClose,
}: {
  groups: ProductDetailSpecGroup[]
  isLoading: boolean
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
            <Image src={cancelIcon} alt="Close specs icon" aria-hidden="true" className="h-[18px] w-[18px] object-contain opacity-75" />
          </button>
          <p className="text-center [font-family:var(--font-ndot57)] text-[1.25rem] uppercase leading-none tracking-[0.16em] text-black">
            Specs
          </p>
          <span aria-hidden="true" />
        </div>

        <div className="mt-5 grid gap-1.5">
          {isLoading ? (
            <div className="rounded-[8px] bg-white/[0.9] px-4 py-5 text-center product-card-name text-lg text-black/70 shadow-[0_10px_26px_rgba(17,17,17,0.06)] backdrop-blur-md">
              Loading specs...
            </div>
          ) : groups.length > 0 ? (
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
                    <Image
                      src={getSpecIconUrl(group)}
                      alt={`${group.title} specs icon`}
                      aria-hidden="true"
                      width={18}
                      height={18}
                      className="h-[18px] w-[18px] object-contain opacity-80"
                    />
                    <span className="product-card-name text-[1rem] leading-none text-black sm:text-[1.16rem]">{group.title}</span>
                    <Image
                      src={plusMinusIcon}
                      alt={isOpen ? 'Collapse specs icon' : 'Expand specs icon'}
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
  const optimizedVideoUrl = buildCloudinaryVideoUrl(videoUrl)

  useEffect(() => {
    const video = videoRef.current
    let hls: { destroy: () => void; loadSource: (source: string) => void; attachMedia: (media: HTMLMediaElement) => void } | null = null
    let cancelled = false

    if (!video) return undefined

    if (!isHlsVideo(optimizedVideoUrl) || video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = optimizedVideoUrl
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
        hls.loadSource(optimizedVideoUrl)
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
  }, [optimizedVideoUrl])

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
      preload="none"
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
  position,
  onOpen,
  isInline = false,
}: {
  section: ProductFeatureSection
  position: string
  onOpen: () => void
  isInline?: boolean
}) {
  const thumbnailUrl = getFeatureThumbnail(section)
  const isDesktopLarge = largeFeatureKeys.has(section.featureKey)
  const isMobileLarge = mobileLargeFeatureKeys.has(section.featureKey)
  const widthClass = isMobileLarge
    ? 'w-[215px] sm:w-[172px] lg:w-[276px]'
    : isDesktopLarge
      ? 'w-[96px] sm:w-[112px] lg:w-[276px]'
      : 'w-[96px] sm:w-[112px] lg:w-[130px]'
  const mediaClass = isMobileLarge
    ? 'h-[215px] w-full sm:h-[116px] lg:h-[156px]'
    : isDesktopLarge
      ? 'h-[76px] w-[76px] sm:h-[92px] sm:w-[92px] lg:h-[156px] lg:w-full'
      : 'h-[76px] w-[76px] sm:h-[92px] sm:w-[92px] lg:h-[108px] lg:w-[108px]'

  return (
    <button
      type="button"
      className={`group z-40 flex cursor-pointer flex-col items-center text-center text-black outline-none transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-105 focus-visible:ring-2 focus-visible:ring-black/40 ${
        isInline ? 'relative' : 'absolute'
      } ${widthClass} ${position}`}
      onClick={onOpen}
      aria-label={`Open ${section.title}`}
    >
      <span
        className={`relative block overflow-hidden rounded-[7px] bg-white/90 shadow-[0_18px_44px_rgba(0,0,0,0.16)] transition-transform duration-300 ease-out group-hover:scale-105 ${mediaClass}`}
      >
        {section.coverVideoUrl ? (
          <HlsFeatureVideo videoUrl={section.coverVideoUrl} posterUrl={thumbnailUrl} title={section.title} />
        ) : thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={`${section.featureTitle || section.title} feature image for ${section.title}`}
            fill
            loading="lazy"
            fetchPriority="low"
            sizes={isDesktopLarge || isMobileLarge ? '(max-width: 640px) 215px, (max-width: 1024px) 180px, 276px' : '130px'}
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center bg-[#f2f2ef] text-black">
            <DotArrowIcon direction="right" />
          </span>
        )}
      </span>
      <span className="mt-2 text-center [font-family:var(--font-lettera-regular)] text-[0.58rem] leading-tight text-[#8f918a] [text-shadow:0_1px_8px_rgba(255,255,255,0.42),0_1px_8px_rgba(0,0,0,0.32)] transition-transform duration-300 ease-out group-hover:scale-105 sm:mt-3 sm:text-[0.75rem]">
        {section.featureTitle}
      </span>
    </button>
  )
}

function ProductFeatureOverlay({
  section,
  activeSlideIndex,
  isLoading,
  onSelectSlide,
  onClose,
}: {
  section: ProductFeatureSection
  activeSlideIndex: number
  isLoading: boolean
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
            <Image src={cancelIcon} alt={`Close ${section.title} icon`} aria-hidden="true" className="h-[16px] w-[16px] object-contain invert" />
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
            {isLoading && slideCount === 0 ? (
              <p className="mt-5 [font-family:var(--font-georgia)] text-[0.95rem] leading-6 text-white sm:text-[1.02rem]">
                Loading feature details...
              </p>
            ) : activeSlide?.body ? (
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

function isHtmlSnippet(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

function IntroContent({ intro, compact = false }: { intro: string | null; compact?: boolean }) {
  if (!intro) return null

  const className = compact
    ? 'mt-2 max-h-[4.4rem] overflow-hidden text-left text-[0.56rem] uppercase leading-[1.45] tracking-[0.08em] text-black/66 sm:max-h-[5.2rem] sm:text-[0.62rem] [&_.np-feature-list]:space-y-1.5 [&_.np-feature]:flex [&_.np-feature]:items-center [&_.np-feature]:gap-1.5 [&_.np-feature_img]:h-2.5 [&_.np-feature_img]:w-2.5 [&_.np-feature_img]:shrink-0'
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

function PriceDisplay({
  priceLabel,
  originalPriceLabel,
  className,
}: {
  priceLabel?: string | null
  originalPriceLabel?: string | null
  className?: string
}) {
  return (
    <span className={className}>
      {originalPriceLabel ? (
        <span className="mr-2 text-current opacity-45 line-through">{formatHeroPrice(originalPriceLabel)}</span>
      ) : null}
      <span>{formatHeroPrice(priceLabel)}</span>
    </span>
  )
}

function formatOfficialProductName(productName: string) {
  const normalized = productName.trim()

  if (/^phone\s*\(/i.test(normalized)) {
    return normalized.replace(/\(([^)]+)\)/, '( $1 )')
  }

  const nothingMatch = normalized.match(/^Nothing\s+(.+)$/i)
  if (!nothingMatch) return normalized

  const model = nothingMatch[1].trim()
  if (!/^(?:phone\s*)?\(?\d/i.test(model)) {
    return normalized
  }

  const suffixMatch = model.match(/^(.+?)\s+(Pro|Lite|Plus)$/i)

  if (suffixMatch) {
    return `Phone ( ${suffixMatch[1]} ) ${suffixMatch[2]}`
  }

  return `Phone ( ${model} )`
}

function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className={className}>
      <path d="M3.5 5.25 7 8.75 10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ColorNameSelector({
  colorOptions,
  selectedIndex,
  onSelectColor,
  className = '',
  menuPlacement = 'top',
  compact = false,
}: {
  colorOptions: ColorOption[]
  selectedIndex: number
  onSelectColor: (mediaIndex: number) => void
  className?: string
  menuPlacement?: 'top' | 'bottom'
  compact?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedColor = colorOptions.find((option) => option.mediaIndex === selectedIndex) ?? colorOptions[0]

  if (!selectedColor) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`grid w-full grid-cols-[minmax(0,1fr)_14px] items-center gap-3 rounded-[8px] border-[0.5px] border-solid border-black bg-white px-4 text-black transition hover:bg-[#f7f7f4] ${
          compact ? 'h-8 text-[0.58rem]' : 'h-10 text-[0.72rem]'
        }`}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="truncate text-left [font-family:var(--font-ntype82)] uppercase tracking-[0.18em]">
          {selectedColor.label}
        </span>
        <ChevronDownIcon className={`shrink-0 text-black/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen ? (
        <div
          role="listbox"
          aria-label="Select color"
          className={`absolute left-0 z-[90] w-full overflow-hidden rounded-[18px] border border-white/15 bg-black py-1.5 text-white shadow-[0_18px_42px_rgba(0,0,0,0.42)] ${
            menuPlacement === 'top' ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]'
          }`}
        >
          {colorOptions.map((option) => {
            const isSelected = option.mediaIndex === selectedIndex

            return (
              <button
                key={option.key}
                type="button"
                role="option"
                aria-selected={isSelected}
                className="grid min-h-[36px] w-full grid-cols-[22px_minmax(0,1fr)] items-center gap-2 px-3 text-left [font-family:var(--font-ntype82)] text-[0.88rem] leading-none text-white transition hover:bg-white/10"
                onClick={() => {
                  onSelectColor(option.mediaIndex)
                  setIsOpen(false)
                }}
              >
                <span className="text-[1rem] leading-none">{isSelected ? '\u2713' : ''}</span>
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function StickyPurchaseCard({
  productName,
  selectedMedia,
  selectedIndex,
  colorOptions,
  onSelectColor,
  priceLabel,
  originalPriceLabel,
  warrantyMonths,
  warrantyPriceLabel,
  buyHref,
  whatsappHref,
  intro,
  isCompact,
  isVisible,
}: {
  productName: string
  selectedMedia: ProductDetailMedia | null
  selectedIndex: number
  colorOptions: ColorOption[]
  onSelectColor: (mediaIndex: number) => void
  priceLabel?: string | null
  originalPriceLabel?: string | null
  warrantyMonths?: number | null
  warrantyPriceLabel?: string | null
  buyHref: string
  whatsappHref: string
  intro: string | null
  isCompact: boolean
  isVisible: boolean
}) {
  const officialName = formatOfficialProductName(productName)
  return (
    <aside
      className={`fixed bottom-3 left-1/2 z-50 w-[min(640px,calc(100vw-16px))] -translate-x-1/2 transition-all duration-300 ease-out sm:bottom-4 ${
        isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-8 opacity-0'
      }`}
      aria-label={`${productName} purchase options`}
    >
      <div
        className={`rounded-[8px] border border-black/18 bg-white text-black opacity-90 shadow-[0_18px_70px_rgba(17,17,17,0.17)] transition-all duration-300 ${
          isCompact ? 'px-3 py-2.5' : 'px-3 py-3 sm:px-4 sm:py-4'
        }`}
      >
        {isCompact ? (
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <div className="min-w-0">
              <p className="truncate [font-family:var(--font-ndot57)] text-[0.74rem] uppercase leading-none tracking-[0.08em] text-black sm:text-[0.86rem]">
                {officialName}
              </p>
              <PriceDisplay
                priceLabel={priceLabel}
                originalPriceLabel={originalPriceLabel}
                className="mt-1 block truncate [font-family:var(--font-lettera-regular)] text-[0.62rem] uppercase tracking-[0.08em] text-black/58"
              />
              {colorOptions.length > 0 ? (
                <ColorNameSelector
                  colorOptions={colorOptions}
                  selectedIndex={selectedIndex}
                  onSelectColor={onSelectColor}
                  compact
                  className="mt-1.5 max-w-[132px]"
                />
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Link
                href={buyHref}
                className="inline-flex h-9 items-center justify-center rounded-[4px] bg-black px-3 [font-family:var(--font-ndot57)] text-[0.62rem] uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#1b1b1b] sm:px-4 sm:text-[0.68rem]"
              >
                Buy
              </Link>
              <Link
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[4px] bg-[#25D366] px-3 [font-family:var(--font-ndot57)] text-[0.62rem] uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#20bd5a] sm:px-4 sm:text-[0.68rem]"
              >
                <WhatsAppIcon />
                <span>Chat</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-5">
              <div className="flex min-w-0 flex-col justify-center">
                <div className="relative h-[112px] sm:h-[142px]">
                  {selectedMedia ? (
                    <Image
                      key={selectedMedia.url}
                      src={selectedMedia.url}
                      alt={selectedMedia.alt || productName}
                      fill
                      priority
                      fetchPriority="high"
                      sizes="150px"
                      className="object-contain object-center"
                    />
                  ) : null}
                </div>
                <PriceDisplay
                  priceLabel={priceLabel}
                  originalPriceLabel={originalPriceLabel}
                  className="mt-2 block text-center [font-family:var(--font-ndot57)] text-[0.9rem] uppercase tracking-[0.08em] text-black sm:mt-3 sm:text-[1.02rem]"
                />
                {warrantyMonths && warrantyPriceLabel ? (
                  <p className="mt-2 text-center [font-family:var(--font-lettera-regular)] text-[0.6rem] uppercase tracking-[0.08em] text-black/58">
                    {warrantyMonths}-month warranty: {formatHeroPrice(warrantyPriceLabel)}
                  </p>
                ) : null}
              </div>

              <div className="flex min-w-0 flex-col justify-center">
                <h2 className="w-full text-left [font-family:var(--font-ndot57)] text-[0.94rem] uppercase leading-none tracking-[0.08em] text-black sm:text-[1.18rem]">
                  {officialName}
                </h2>
                <IntroContent intro={intro} compact />
                {colorOptions.length > 0 ? (
                  <ColorNameSelector
                    colorOptions={colorOptions}
                    selectedIndex={selectedIndex}
                    onSelectColor={onSelectColor}
                    className="mt-3 w-full max-w-[210px] self-start"
                  />
                ) : null}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4">
              <Link
                href={buyHref}
                className="inline-flex h-10 items-center justify-center rounded-[4px] bg-black px-4 [font-family:var(--font-ndot57)] text-[0.68rem] uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#1b1b1b] sm:h-11 sm:text-[0.76rem]"
              >
                Buy Now
              </Link>
              <Link
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[4px] bg-[#25D366] px-4 [font-family:var(--font-ndot57)] text-[0.62rem] uppercase tracking-[0.07em] text-white transition-colors hover:bg-[#20bd5a] sm:h-11 sm:text-[0.72rem]"
              >
                <WhatsAppIcon />
                <span>Contact WhatsApp</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}

export function ProductDetailHero({
  productName,
  seoHeading,
  brandLabel,
  entityType,
  gallery,
  backgroundImage,
  backgroundImages = [],
  intro,
  priceLabel,
  originalPriceLabel,
  warrantyYears,
  warrantyMonths,
  warrantyPriceLabel,
  canonicalHandle,
  initialColor,
  initialMediaId,
  labels = [],
  hasSpecs,
  specGroups = [],
  featureSections = [],
}: ProductDetailHeroProps) {
  const immersiveRef = useRef<HTMLElement | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(() =>
    resolveInitialMediaIndex(gallery, initialColor, initialMediaId),
  )
  const [isSpecsOpen, setIsSpecsOpen] = useState(false)
  const [loadedSpecGroups, setLoadedSpecGroups] = useState(specGroups)
  const [isSpecsLoading, setIsSpecsLoading] = useState(false)
  const [openSpecGroupId, setOpenSpecGroupId] = useState<string | null>(null)
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null)
  const [activeFeatureSlideIndex, setActiveFeatureSlideIndex] = useState(0)
  const [featureSectionsById, setFeatureSectionsById] = useState<Record<string, ProductFeatureSection>>({})
  const [isPurchaseCardVisible, setIsPurchaseCardVisible] = useState(true)
  const [isPurchaseCardCompact, setIsPurchaseCardCompact] = useState(false)
  const selectedMedia = gallery[selectedIndex] ?? gallery[0] ?? null
  const initialDisplayedFeatureSections = useMemo(() => {
    const officialSections = featureSections.filter((section) => section.featureKey.startsWith('official-'))

    return officialSections.length > 0 ? officialSections : featureSections
  }, [featureSections])
  const displayedFeatureSections = useMemo(
    () => initialDisplayedFeatureSections.map((section) => featureSectionsById[section.id] ?? section),
    [featureSectionsById, initialDisplayedFeatureSections],
  )
  const activeFeature = activeFeatureId ? displayedFeatureSections.find((section) => section.id === activeFeatureId) ?? null : null
  const colorOptions = useMemo(() => buildColorOptions(gallery), [gallery])
  const colorKeys = useMemo(() => new Set(colorOptions.map((color) => color.key)), [colorOptions])
  const uniqueLabels = useMemo(
    () => [...new Set(labels.filter((label) => label && !colorKeys.has(normalizeColorName(label))))].slice(0, 4),
    [colorKeys, labels],
  )
  const whatsappHref =
    entityType === 'mobile'
      ? `https://api.whatsapp.com/send?phone=923110066648&text=${encodeURIComponent(`Hi, I want to purchase this phone if available. Kindly tell me the price: ${productName}`)}`
      : 'https://api.whatsapp.com/send?phone=923110066648'
  const buyHref = buildOrderHref(canonicalHandle, selectedMedia)
  const hasSpecGroups = hasSpecs ?? loadedSpecGroups.length > 0
  const immersiveBackgroundImages = backgroundImages.length > 0 ? backgroundImages : backgroundImage ? [backgroundImage] : []
  const firstHeroFeatureSections = immersiveBackgroundImages.length > 1 ? displayedFeatureSections.slice(0, 5) : displayedFeatureSections
  const secondHeroFeatureSections = immersiveBackgroundImages.length > 1 ? displayedFeatureSections.slice(5) : []

  useEffect(() => {
    setSelectedIndex(resolveInitialMediaIndex(gallery, initialColor, initialMediaId))
  }, [canonicalHandle, gallery, initialColor, initialMediaId])

  useEffect(() => {
    setLoadedSpecGroups(specGroups)
    setFeatureSectionsById({})
    setIsSpecsLoading(false)
    setOpenSpecGroupId(null)
    setActiveFeatureId(null)
    setActiveFeatureSlideIndex(0)
  }, [canonicalHandle, featureSections, specGroups])

  const loadSpecGroups = async () => {
    if (loadedSpecGroups.some((group) => group.specs.length > 0)) return

    setIsSpecsLoading(true)

    try {
      const response = await fetch(`/api/products/${encodeURIComponent(canonicalHandle)}/spec-groups`, {
        cache: 'no-store',
      })

      if (!response.ok) return

      const payload = (await response.json()) as { specGroups?: ProductDetailSpecGroup[] }

      if (Array.isArray(payload.specGroups)) {
        setLoadedSpecGroups(payload.specGroups)
      }
    } catch {
      return
    } finally {
      setIsSpecsLoading(false)
    }
  }

  const openSpecs = () => {
    setIsSpecsOpen(true)
    void loadSpecGroups()
  }

  const loadFeatureSection = async (section: ProductFeatureSection) => {
    const hydratedSection = featureSectionsById[section.id]

    if (section.slides.length > 0 || hydratedSection?.slides.length) return

    try {
      const response = await fetch(
        `/api/products/${encodeURIComponent(canonicalHandle)}/feature-sections/${encodeURIComponent(section.id)}`,
        {
          cache: 'no-store',
        },
      )

      if (!response.ok) return

      const payload = (await response.json()) as { section?: ProductFeatureSection }

      if (payload.section) {
        setFeatureSectionsById((current) => ({
          ...current,
          [section.id]: payload.section as ProductFeatureSection,
        }))
      }
    } catch {
      return
    }
  }

  const openFeature = (section: ProductFeatureSection) => {
    setIsSpecsOpen(false)
    setOpenSpecGroupId(null)
    setActiveFeatureId(section.id)
    setActiveFeatureSlideIndex(0)
    void loadFeatureSection(section)
  }

  useEffect(() => {
    document.body.style.overflow = isSpecsOpen || activeFeature ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [activeFeature, isSpecsOpen])

  useEffect(() => {
    if (immersiveBackgroundImages.length === 0) return undefined

    const updatePurchaseCardState = () => {
      const rect = immersiveRef.current?.getBoundingClientRect()

      if (!rect) return

      setIsPurchaseCardVisible(rect.top < window.innerHeight - 90 && rect.bottom > 90)
      setIsPurchaseCardCompact(Math.abs(rect.top) > 520)
    }

    updatePurchaseCardState()
    window.addEventListener('scroll', updatePurchaseCardState, { passive: true })
    window.addEventListener('resize', updatePurchaseCardState)

    return () => {
      window.removeEventListener('scroll', updatePurchaseCardState)
      window.removeEventListener('resize', updatePurchaseCardState)
    }
  }, [immersiveBackgroundImages.length])

  if (immersiveBackgroundImages.length > 0) {
    return (
      <section ref={immersiveRef} className="relative overflow-hidden bg-[#f3f4f4] font-sans text-black">
        <h1 className="sr-only">{seoHeading}</h1>
        {isSpecsOpen ? (
          <SpecsOverlay
            groups={loadedSpecGroups}
            isLoading={isSpecsLoading}
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
            isLoading={false}
            onSelectSlide={setActiveFeatureSlideIndex}
            onClose={() => {
              setActiveFeatureId(null)
              setActiveFeatureSlideIndex(0)
            }}
          />
        ) : null}

        {immersiveBackgroundImages.map((image, index) => {
          const isFirst = index === 0
          const isSecond = index === 1

          const renderFirstFeatureBadges = () =>
            firstHeroFeatureSections.map((section, featureIndex) => (
              <ProductFeatureBadge
                key={section.id}
                section={section}
                position={firstBackgroundBadgePositions[featureIndex % firstBackgroundBadgePositions.length]}
                onOpen={() => openFeature(section)}
              />
            ))

          const renderMobileFeatureBadges = (sections: ProductFeatureSection[], className: string) =>
            sections.length > 0 ? (
              <div className={`absolute inset-x-4 z-40 flex flex-wrap items-start justify-center gap-x-5 gap-y-7 sm:hidden ${className}`}>
                {sections.map((section) => (
                  <ProductFeatureBadge key={section.id} section={section} position="" isInline onOpen={() => openFeature(section)} />
                ))}
              </div>
            ) : null

          if (isFirst) {
            return (
              <Fragment key={image.id}>
                <section className="relative min-h-[1280px] overflow-hidden bg-[#f3f4f4] sm:hidden">
                  <Image
                    src={image.url}
                    alt={image.alt || productName}
                    fill
                    priority
                    fetchPriority="high"
                    loading="eager"
                    sizes="100vw"
                    className="object-cover object-center"
                  />
                  {entityType === 'mobile' ? (
                    <Image
                      src={getMobileWarrantyBadgeUrl(warrantyYears)}
                      alt={`${warrantyYears === 2 ? 2 : 1} year warranty`}
                      width={144}
                      height={144}
                      className="absolute right-6 top-24 z-40 h-20 w-20 object-contain"
                    />
                  ) : null}

                  {hasSpecGroups ? <SpecsFolderBadge onOpen={openSpecs} /> : null}
                  {renderMobileFeatureBadges(firstHeroFeatureSections, 'bottom-28')}
                </section>

                <section className="relative hidden min-h-screen overflow-hidden bg-[#f3f4f4] sm:block">
                  <Image
                    src={image.url}
                    alt={image.alt || productName}
                    fill
                    priority
                    fetchPriority="high"
                    loading="eager"
                    sizes="100vw"
                    className="object-cover object-center"
                  />
                  {entityType === 'mobile' ? (
                    <Image
                      src={getMobileWarrantyBadgeUrl(warrantyYears)}
                      alt={`${warrantyYears === 2 ? 2 : 1} year warranty`}
                      width={160}
                      height={160}
                      className="absolute right-6 top-6 z-30 h-28 w-28 object-contain lg:right-10 lg:top-10 lg:h-32 lg:w-32"
                    />
                  ) : null}

                  {hasSpecGroups ? <SpecsFolderBadge onOpen={openSpecs} /> : null}
                  {renderFirstFeatureBadges()}
                </section>
              </Fragment>
            )
          }

          return (
            <section key={image.id} className="relative min-h-[520px] overflow-hidden bg-[#f3f4f4] sm:min-h-[720px] lg:min-h-[820px]">
              <Image
                src={image.url}
                alt={image.alt || productName}
                fill
                fetchPriority="low"
                loading="lazy"
                sizes="100vw"
                className="object-cover object-center"
              />
              

              {isSecond ? (
                <>
                  {renderMobileFeatureBadges(secondHeroFeatureSections, 'top-12')}
                  <div className="hidden sm:block">
                    {secondHeroFeatureSections.map((section, featureIndex) => (
                      <ProductFeatureBadge
                        key={section.id}
                        section={section}
                        position={secondBackgroundBadgePositions[featureIndex % secondBackgroundBadgePositions.length]}
                        onOpen={() => openFeature(section)}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </section>
          )
        })}
        <StickyPurchaseCard
          productName={productName}
          selectedMedia={selectedMedia}
          selectedIndex={selectedIndex}
          colorOptions={colorOptions}
          onSelectColor={setSelectedIndex}
          priceLabel={priceLabel}
          originalPriceLabel={originalPriceLabel}
          warrantyMonths={warrantyMonths}
          warrantyPriceLabel={warrantyPriceLabel}
          buyHref={buyHref}
          whatsappHref={whatsappHref}
          intro={intro}
          isCompact={isPurchaseCardCompact}
          isVisible={isPurchaseCardVisible && !isSpecsOpen && !activeFeature}
        />
      </section>
    )
  }

  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-4 font-sans shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:p-6 lg:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start">
        <div className="min-w-0">
          <div className="rounded-[26px] border border-slate-200 bg-white p-5 sm:p-7">
            {selectedMedia ? (
              <div className="relative mx-auto h-[min(80svh,380px)] w-full max-w-[min(78vw,420px)] sm:h-[min(80svh,500px)] sm:max-w-[480px] lg:h-[min(80svh,620px)] lg:max-w-[520px]">
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
                {entityType === 'mobile' ? (
                  <Image
                    src={getMobileWarrantyBadgeUrl(warrantyYears)}
                    alt={`${warrantyYears === 2 ? 2 : 1} year warranty`}
                    width={144}
                    height={144}
                    className="absolute right-0 top-0 z-10 h-20 w-20 object-contain sm:h-28 sm:w-28"
                  />
                ) : null}
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
            {seoHeading}
          </h1>

          {entityType === 'mobile' ? (
            <p className="mt-4 rounded-[22px] border border-sky-100 bg-sky-50 px-4 py-4 text-sm leading-6 text-sky-900">
              We also sell this phone. For availability, latest price, and ordering, please contact us on WhatsApp. This page also shows the chargers, protectors, earbuds, and other accessories linked to it.
            </p>
          ) : null}

          <IntroContent intro={intro} />

          {colorOptions.length > 0 ? (
            <ColorNameSelector
              colorOptions={colorOptions}
              selectedIndex={selectedIndex}
              onSelectColor={setSelectedIndex}
              menuPlacement="bottom"
              className="mt-6 max-w-[320px]"
            />
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
              <PriceDisplay
                priceLabel={priceLabel}
                originalPriceLabel={originalPriceLabel}
                className="font-sans text-[1.9rem] font-medium leading-none tracking-normal text-slate-900"
              />
              {warrantyMonths && warrantyPriceLabel ? (
                <p className="mt-3 text-sm font-medium text-slate-700">
                  {warrantyMonths}-month warranty price: {warrantyPriceLabel}
                </p>
              ) : null}
            </div>
          </div>

          {entityType === 'product' ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href={buyHref}
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
