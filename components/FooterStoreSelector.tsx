'use client'

import Image from 'next/image'
import { useEffect, useId, useRef, useState } from 'react'
import cancelIcon from '@/assets/icons/cancel_icon.svg'
import storeIcon from '@/assets/icons/store.svg'
import { shippingRegions, type ShippingLocation } from '@/components/shipping-regions'

type FooterStoreSelectorProps = {
  className?: string
  iconClassName?: string
  label?: string
  selectedCountry?: string
  onLocationSelect?: (location: ShippingLocation) => void
}

export function FooterStoreSelector({
  className = 'flex h-[54px] items-center justify-between rounded-[10px] bg-white/[0.06] px-5 transition-colors hover:bg-white/[0.09]',
  iconClassName = 'h-[20px] w-[20px] object-contain',
  label = 'Pakistan',
  selectedCountry = label,
  onLocationSelect,
}: FooterStoreSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCountry, setActiveCountry] = useState(selectedCountry)
  const titleId = useId()
  const dialogRef = useRef<HTMLElement>(null)
  const triggerButtonRef = useRef<HTMLButtonElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const storedCountry = window.localStorage.getItem('nothing-store-country')
    setActiveCountry(storedCountry || selectedCountry)
  }, [selectedCountry])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const openDialog = () => {
    previousActiveElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : triggerButtonRef.current
    setIsOpen(true)
  }

  const closeDialog = () => {
    setIsOpen(false)
    window.requestAnimationFrame(() => {
      previousActiveElementRef.current?.focus()
      previousActiveElementRef.current = null
    })
  }

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const dialog = dialogRef.current
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',')
    const getFocusableElements = () => Array.from(dialog?.querySelectorAll<HTMLElement>(focusableSelector) ?? []).filter((element) => !element.hasAttribute('disabled') && element.offsetParent !== null)

    window.requestAnimationFrame(() => {
      const [firstFocusable] = getFocusableElements()
      ;(firstFocusable ?? dialog)?.focus()
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDialog()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const focusableElements = getFocusableElements()

      if (!focusableElements.length) {
        event.preventDefault()
        dialog?.focus()
        return
      }

      const firstFocusable = focusableElements[0]
      const lastFocusable = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault()
        lastFocusable.focus()
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault()
        firstFocusable.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleLocationSelect = (location: ShippingLocation) => {
    setActiveCountry(location.country)
    window.localStorage.setItem('nothing-store-country', location.country)
    onLocationSelect?.(location)
    closeDialog()
  }

  return (
    <>
      <button ref={triggerButtonRef} type="button" className={className} onClick={openDialog}>
        <span className="text-[inherit]">{activeCountry}</span>
        <Image src={storeIcon} alt="" aria-hidden="true" className={iconClassName} />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] overflow-hidden bg-[#090909] text-black normal-case">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-95 [background-image:radial-gradient(circle,rgba(255,255,255,0.82)_1px,transparent_1.8px)] [background-position:42px_42px] [background-size:164px_164px]"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#101010] to-transparent" />

          <button
            type="button"
            aria-label="Close shipping location selector"
            className="absolute inset-0 cursor-default"
            onClick={closeDialog}
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            ref={dialogRef}
            tabIndex={-1}
            className="relative mx-auto flex h-[min(82dvh,760px)] w-[min(calc(100vw-1.25rem),560px)] flex-col gap-3 px-3 py-5 sm:px-0"
          >
            <div className="grid h-[54px] shrink-0 grid-cols-[44px_minmax(0,1fr)_44px] items-center rounded-[10px] bg-[#d7d7d7] text-[#171717] shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
              <button
                type="button"
                aria-label="Close shipping location selector"
                className="flex h-full items-center justify-center rounded-l-[10px] transition-opacity hover:opacity-60"
                onClick={closeDialog}
              >
                <Image src={cancelIcon} alt="" aria-hidden="true" className="h-[15px] w-[15px] object-contain opacity-70" />
              </button>
              <p className="text-center [font-family:var(--font-ndot57-caps)] text-[0.88rem] uppercase leading-none tracking-[0.18em] text-black/72">
                Ship To
              </p>
              <span aria-hidden="true" />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto rounded-[10px] bg-[#d7d7d7] px-5 pb-7 pt-5 shadow-[0_20px_70px_rgba(0,0,0,0.24)] sm:px-7">
              <h2 id={titleId} className="[font-family:var(--font-ntype82-mono)] text-[1.24rem] leading-tight text-black/48 sm:text-[1.46rem]">
                Shipping Location
              </h2>
              <p className="mt-2 [font-family:var(--font-ntype82)] text-[0.72rem] leading-5 text-black/42">
                {activeCountry} is the active store for this website. Choose a region to update your store preference.
              </p>

              <div className="mt-6 grid gap-6">
                {shippingRegions.map((region) => (
                  <section key={region.name}>
                    <h3 className="[font-family:var(--font-ntype82)] text-[0.86rem] leading-none text-black/45">
                      {region.name}
                    </h3>
                    <div className="mt-3 grid gap-1">
                      {region.locations.map((location) => {
                        const isSelected = location.country === activeCountry

                        return (
                          <button
                            key={`${region.name}-${location.country}`}
                            type="button"
                            aria-pressed={isSelected}
                            className={`grid min-h-[38px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[6px] px-3 text-left transition-colors hover:bg-black/5 ${
                              isSelected ? 'bg-black/8' : ''
                            }`}
                            onClick={() => handleLocationSelect(location)}
                          >
                            <span className="[font-family:var(--font-ntype82)] text-[0.88rem] leading-tight text-black/82 sm:text-[0.98rem]">
                              {location.country}
                            </span>
                            <span className="[font-family:var(--font-ntype82)] text-right text-[0.76rem] leading-tight text-black/42 sm:text-[0.86rem]">
                              {location.locale}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}
