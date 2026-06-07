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
        <div className="fixed inset-0 z-[100] overflow-hidden bg-[#0d0d0d] text-black normal-case">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-95 [background-image:radial-gradient(circle,rgba(255,255,255,1)_1px,transparent_1.8px)] [background-position:-35px_-35px] [background-size:116px_116px]"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#111111] to-transparent" />

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
            className="relative mx-auto flex h-dvh w-[min(calc(100vw-1rem),384px)] flex-col gap-[13px] pb-3 pt-[11px]"
          >
            <div className="grid h-[38px] shrink-0 grid-cols-[38px_minmax(0,1fr)_38px] items-center rounded-[6px] bg-[#d3d3d3] text-black shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
              <button
                type="button"
                aria-label="Close shipping location selector"
                className="flex h-full items-center justify-center rounded-l-[6px] transition-opacity hover:opacity-60"
                onClick={closeDialog}
              >
                <Image src={cancelIcon} alt="" aria-hidden="true" className="h-[13px] w-[13px] object-contain opacity-60" />
              </button>
              <p className="text-center [font-family:var(--font-ndot57-caps)] text-[0.88rem] uppercase leading-none tracking-[0.08em] text-black">
                Ship To
              </p>
              <span aria-hidden="true" />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto rounded-[6px] bg-[#d3d3d3] px-[19px] pb-0 pt-3 shadow-[0_20px_70px_rgba(0,0,0,0.24)]">
              <h2 id={titleId} className="ml-4 -translate-y-[3px] [font-family:var(--font-georgia)] text-[1.46rem] leading-tight text-[#595959]">
                Select Your Shipping Location
              </h2>

              <div className="mt-[18px] grid gap-6">
                {shippingRegions.map((region) => (
                  <section key={region.name}>
                    <h3 className="[font-family:var(--font-ntype82)] text-[0.8rem] leading-none text-[#595959]">
                      {region.name}
                    </h3>
                    <div className="mt-[7px] grid gap-[2px]">
                      {region.locations.map((location) => {
                        const isSelected = location.country === activeCountry

                        return (
                          <button
                            key={`${region.name}-${location.country}`}
                            type="button"
                            aria-pressed={isSelected}
                            className={`grid min-h-[38px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[4px] px-[6px] text-left transition-colors hover:bg-black/5 ${
                              isSelected ? 'bg-black/8' : ''
                            }`}
                            onClick={() => handleLocationSelect(location)}
                          >
                            <span className="[font-family:var(--font-ntype82)] text-[0.8rem] leading-tight text-black">
                              {location.country}
                            </span>
                            <span className="[font-family:var(--font-ntype82)] text-right text-[0.8rem] leading-tight text-[#595959]">
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
