'use client'

import { useEffect, useState } from 'react'

const storeOptions = [
  {
    region: 'Pakistan',
    country: 'Pakistan',
    domains: ['nothingshop.pk', 'nothingofficial.pk', 'cmfbynothing.pk'],
    primary: true,
  },
  {
    region: 'United Kingdom',
    country: 'United Kingdom',
    domains: ['nothing.tech'],
    primary: false,
  },
] as const

export function FooterStoreSelector() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      <button
        type="button"
        className="footer-minimal-link text-left"
        onClick={() => setIsOpen(true)}
      >
        Store: Pakistan
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-4 text-black normal-case backdrop-blur-[18px] sm:items-center">
          <button
            type="button"
            aria-label="Close ship to selector"
            className="absolute inset-0 cursor-default"
            onClick={() => setIsOpen(false)}
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="ship-to-title"
            className="relative mt-12 w-full max-w-[480px] overflow-hidden rounded-[8px] bg-[#f4f4f2] shadow-[0_32px_90px_rgba(0,0,0,0.26)] sm:mt-0"
          >
            <div className="grid h-12 grid-cols-[44px_minmax(0,1fr)_44px] items-center border-b border-black/10 bg-white/80 px-1">
              <button
                type="button"
                aria-label="Close ship to selector"
                className="flex h-10 w-10 items-center justify-center text-xl leading-none text-black/65 transition-opacity hover:opacity-60"
                onClick={() => setIsOpen(false)}
              >
                x
              </button>
              <h2 id="ship-to-title" className="text-center text-[1.05rem] tracking-[0.12em] [font-family:var(--font-ndot57),sans-serif]">
                Ship To
              </h2>
              <span aria-hidden="true" />
            </div>

            <div className="px-5 py-12 text-center sm:px-8 sm:py-14">
              <p className="text-[0.72rem] uppercase tracking-[0.18em] text-black/58">Looks like you&apos;re in:</p>
              <p className="mt-3 [font-family:var(--font-georgia)] text-3xl leading-none text-black">Pakistan</p>

              <p className="mt-10 text-[0.72rem] uppercase tracking-[0.18em] text-black/58">Choose your official store:</p>

              <div className="mt-6 grid gap-3 text-left">
                {storeOptions.map((store) => (
                  <button
                    key={store.region}
                    type="button"
                    className={`rounded-[6px] border px-4 py-4 transition ${
                      store.primary
                        ? 'border-black bg-black text-white'
                        : 'border-black/12 bg-white/70 text-black hover:border-black/35'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="block text-[0.7rem] uppercase tracking-[0.18em] opacity-70">{store.country}</span>
                    <span className="mt-1 block [font-family:var(--font-georgia)] text-2xl leading-none">{store.region}</span>
                    <span className="mt-3 block whitespace-pre-line text-[0.68rem] leading-5 tracking-[0.12em] opacity-80">
                      {store.domains.join('\n')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}
