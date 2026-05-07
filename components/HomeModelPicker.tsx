'use client'

import Image from 'next/image'
import Link from 'next/link'
import { startTransition, useEffect, useState } from 'react'
import type { Product } from '@/lib/models/catalog'

type HomeModelPickerProps = {
  models: Product[]
}

function chunkProducts(models: Product[], size: number) {
  const pages: Product[][] = []

  for (let index = 0; index < models.length; index += size) {
    pages.push(models.slice(index, index + size))
  }

  return pages
}

function ArrowButton({
  direction,
  onClick,
  disabled,
}: {
  direction: 'previous' | 'next'
  onClick: () => void
  disabled: boolean
}) {
  return (
    <button
      type="button"
      aria-label={direction === 'previous' ? 'Show previous models' : 'Show next models'}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/90 text-black shadow-[0_14px_30px_rgba(17,17,17,0.08)] transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {direction === 'previous' ? (
          <path d="m14 6-6 6 6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="m10 6 6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  )
}

export function HomeModelPicker({ models }: HomeModelPickerProps) {
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [activePage, setActivePage] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)

  useEffect(() => {
    const syncViewport = () => {
      startTransition(() => {
        setItemsPerPage(window.innerWidth >= 1024 ? 10 : 4)
      })
    }

    syncViewport()
    window.addEventListener('resize', syncViewport)

    return () => window.removeEventListener('resize', syncViewport)
  }, [])

  const pages = chunkProducts(models, itemsPerPage)
  const hasPages = pages.length > 0
  const maxPageIndex = Math.max(0, pages.length - 1)

  useEffect(() => {
    if (activePage <= maxPageIndex) {
      return
    }

    startTransition(() => {
      setActivePage(maxPageIndex)
    })
  }, [activePage, maxPageIndex])

  useEffect(() => {
    if (touchStartX === null || touchEndX === null) {
      return
    }

    const distance = touchStartX - touchEndX

    if (Math.abs(distance) < 40) {
      return
    }

    if (distance > 0 && activePage < maxPageIndex) {
      startTransition(() => {
        setActivePage((currentPage) => Math.min(currentPage + 1, maxPageIndex))
      })
    }

    if (distance < 0 && activePage > 0) {
      startTransition(() => {
        setActivePage((currentPage) => Math.max(currentPage - 1, 0))
      })
    }

    setTouchStartX(null)
    setTouchEndX(null)
  }, [activePage, maxPageIndex, touchEndX, touchStartX])

  if (!hasPages) {
    return null
  }

  return (
    <section className="border-b border-black/10 bg-white px-4 py-12 md:px-8 md:py-16">
      <div className="mx-auto max-w-screen-2xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="dot-heading text-[10px] tracking-[0.3em] text-black/42">Phones</p>
          <h2 className="collection-product-name mt-4 text-4xl leading-none text-black sm:text-5xl lg:text-6xl">
            Choose Your Model
          </h2>
          <p className="mt-5 font-sans text-[15px] leading-7 text-black/68 sm:text-base">
            Pick your Nothing or CMF phone and browse accessories that fit right, look clean, and are ready to order across Pakistan.
          </p>
        </div>

        <div className="relative mt-10 px-2 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
          {pages.length > 1 ? (
            <>
              <div className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
                <ArrowButton
                  direction="previous"
                  disabled={activePage === 0}
                  onClick={() =>
                    startTransition(() => {
                      setActivePage((currentPage) => Math.max(currentPage - 1, 0))
                    })
                  }
                />
              </div>
              <div className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
                <ArrowButton
                  direction="next"
                  disabled={activePage === maxPageIndex}
                  onClick={() =>
                    startTransition(() => {
                      setActivePage((currentPage) => Math.min(currentPage + 1, maxPageIndex))
                    })
                  }
                />
              </div>
            </>
          ) : null}

          <div
            className="overflow-hidden"
            onTouchStart={(event) => {
              setTouchStartX(event.changedTouches[0]?.clientX ?? null)
              setTouchEndX(null)
            }}
            onTouchMove={(event) => {
              setTouchEndX(event.changedTouches[0]?.clientX ?? null)
            }}
            onTouchEnd={(event) => {
              setTouchEndX(event.changedTouches[0]?.clientX ?? null)
            }}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activePage * 100}%)` }}
            >
              {pages.map((page, pageIndex) => (
                <div key={`page-${pageIndex}`} className="min-w-full">
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 lg:gap-5">
                    {page.map((model) => (
                      <Link
                        key={model.id}
                        href={model.href}
                        className="group flex min-h-[220px] flex-col items-center justify-between rounded-[28px] bg-transparent p-4 transition duration-300 hover:-translate-y-1 sm:min-h-[270px] lg:min-h-[320px]"
                        aria-label={`Open ${model.name}`}
                      >
                        {model.image ? (
                          <div className="relative h-[160px] w-full max-w-[150px] sm:h-[200px] sm:max-w-[180px] lg:h-[230px] lg:max-w-[190px]">
                            <Image
                              src={model.image}
                              alt={model.name}
                              fill
                              sizes="(max-width: 1024px) 42vw, 18vw"
                              className="object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                            />
                          </div>
                        ) : (
                          <div className="flex h-[160px] w-full items-center justify-center text-center text-[11px] uppercase tracking-[0.24em] text-black/30 sm:h-[200px] lg:h-[230px]">
                            {model.name}
                          </div>
                        )}
                        <p
                          className="mt-4 text-center text-[0.82rem] uppercase tracking-[0.18em] text-black/72 sm:text-[0.88rem]"
                          style={{ fontFamily: 'var(--font-ndot57), sans-serif' }}
                        >
                          {model.name}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {pages.length > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-3">
              <ArrowButton
                direction="previous"
                disabled={activePage === 0}
                onClick={() =>
                  startTransition(() => {
                    setActivePage((currentPage) => Math.max(currentPage - 1, 0))
                  })
                }
              />
              <div className="flex items-center gap-2">
                {pages.map((_, pageIndex) => (
                  <button
                    key={`dot-${pageIndex}`}
                    type="button"
                    aria-label={`Show model page ${pageIndex + 1}`}
                    aria-pressed={activePage === pageIndex}
                    onClick={() =>
                      startTransition(() => {
                        setActivePage(pageIndex)
                      })
                    }
                    className={`h-2.5 rounded-full transition-all ${
                      activePage === pageIndex ? 'w-10 bg-black' : 'w-2.5 bg-black/18 hover:bg-black/30'
                    }`}
                  />
                ))}
              </div>
              <ArrowButton
                direction="next"
                disabled={activePage === maxPageIndex}
                onClick={() =>
                  startTransition(() => {
                    setActivePage((currentPage) => Math.min(currentPage + 1, maxPageIndex))
                  })
                }
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
