import Link from 'next/link'
import { getNavigationMenuItems } from '@/lib/data/catalog-repository'
import { storeLocations, supportedLanguages } from '@/lib/data/site-content'

const FOOTER_HEADER_ORDER = ['phones', 'audio', 'watches', 'accessories', 'cmf'] as const

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2.25" y="3.25" width="13.5" height="11.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3 5L9 9.5L15 5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M9 15.2C10.9 12.88 13.2 10.35 13.2 7.75C13.2 5.43 11.32 3.55 9 3.55C6.68 3.55 4.8 5.43 4.8 7.75C4.8 10.35 7.1 12.88 9 15.2Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="9" cy="7.8" r="1.25" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M5 7L9 11L13 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export async function NothingFooter() {
  const [menuItems] = await Promise.all([getNavigationMenuItems()])
  const store = storeLocations[0]
  const language = supportedLanguages[0]

  const headerItems = FOOTER_HEADER_ORDER
    .map((slug) => menuItems.find((item) => item.slug === slug))
    .filter((item): item is NonNullable<(typeof menuItems)[number]> => Boolean(item))

  const supportHref = '/pages/support-centre'
  const newsletterHref = '/pages/newsletter'
  const storeHref = store?.href || '/pages/contact-us#lahore-store'
  const languageHref = language?.href || '/'
  const storeLabel = store?.label || 'Lahore'
  const languageLabel = language?.label || 'EN'

  return (
    <footer className="bg-black px-4 pb-12 pt-9 text-white md:px-8 md:pb-14 md:pt-12">
      <div className="mx-auto max-w-[1680px]">
        <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-black px-4 py-8 sm:px-8 sm:py-12">
          <div aria-hidden="true" className="dot-mesh-background-dark pointer-events-none absolute inset-0 opacity-25" />

          <div className="relative">
            <div className="flex flex-col items-center gap-4 pb-8 sm:gap-6 sm:pb-12">
              {headerItems.map((item) => (
                <Link
                  key={item.slug}
                  href={item.href}
                  className="dot-heading text-center text-[1.9rem] uppercase leading-[0.95] tracking-[0.16em] text-white transition-opacity hover:opacity-75 sm:text-[2.6rem] md:text-[3.1rem]"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mx-auto max-w-4xl space-y-2.5 sm:space-y-3">
              <Link
                href={supportHref}
                className="flex min-h-[66px] items-center justify-between rounded-[14px] border border-white/10 bg-[#0b0d10] px-5 transition-colors hover:bg-[#12161b]"
              >
                <span className="dot-heading text-[1.02rem] uppercase tracking-[0.14em] text-white/92">Support</span>
                <span className="dot-heading text-[1.35rem] text-white/92">?</span>
              </Link>

              <Link
                href={newsletterHref}
                className="flex min-h-[66px] items-center justify-between rounded-[14px] border border-white/10 bg-[#0b0d10] px-5 transition-colors hover:bg-[#12161b]"
              >
                <span className="dot-heading text-[1.02rem] uppercase tracking-[0.14em] text-white/92">Newsletter</span>
                <span className="text-white/92">
                  <MailIcon />
                </span>
              </Link>

              <Link
                href={storeHref}
                className="flex min-h-[66px] items-center justify-between rounded-[14px] border border-white/10 bg-[#0b0d10] px-5 transition-colors hover:bg-[#12161b]"
              >
                <span className="dot-heading text-[1.02rem] uppercase tracking-[0.14em] text-white/92">{`Store: ${storeLabel}`}</span>
                <span className="text-white/92">
                  <PinIcon />
                </span>
              </Link>

              <Link
                href={languageHref}
                className="flex min-h-[66px] items-center justify-between rounded-[14px] border border-white/10 bg-[#0b0d10] px-5 transition-colors hover:bg-[#12161b]"
              >
                <span className="dot-heading text-[1.02rem] uppercase tracking-[0.14em] text-white/92">{`Language: ${languageLabel}`}</span>
                <span className="text-white/92">
                  <ChevronIcon />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
