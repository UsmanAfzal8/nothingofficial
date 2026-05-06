import Image from 'next/image'
import Link from 'next/link'
import languageIcon from '@/assets/icons/more.svg'
import newsletterIcon from '@/assets/icons/newsletter.svg'
import storeIcon from '@/assets/icons/store.svg'
import supportIcon from '@/assets/icons/support.svg'
import whatsappIcon from '@/assets/icons/whastapp.svg'
import { getNavigationMenuItems } from '@/lib/data/catalog-repository'
import { siteContactWhatsappUrl, storeLocations, supportedLanguages } from '@/lib/data/site-content'

const FOOTER_HEADER_ORDER = ['phones', 'audio', 'watches', 'accessories', 'cmf'] as const

export async function NothingFooter() {
  const [menuItems] = await Promise.all([getNavigationMenuItems()])
  const store = storeLocations[0]
  const language = supportedLanguages[0]

  const headerItems = FOOTER_HEADER_ORDER
    .map((slug) => menuItems.find((item) => item.slug === slug))
    .filter((item): item is NonNullable<(typeof menuItems)[number]> => Boolean(item))

  const supportHref = '/pages/support-centre'
  const whatsappHref = siteContactWhatsappUrl
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
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[66px] items-center justify-between rounded-[14px] border border-white/10 bg-[#0b0d10] px-5 transition-colors hover:bg-[#12161b]"
              >
                <span className="dot-heading text-[1.02rem] uppercase tracking-[0.14em] text-white/92">WhatsApp</span>
                <Image src={whatsappIcon} alt="" aria-hidden="true" className="h-[22px] w-[22px]" />
              </Link>

              <Link
                href={supportHref}
                className="flex min-h-[66px] items-center justify-between rounded-[14px] border border-white/10 bg-[#0b0d10] px-5 transition-colors hover:bg-[#12161b]"
              >
                <span className="dot-heading text-[1.02rem] uppercase tracking-[0.14em] text-white/92">Support</span>
                <Image src={supportIcon} alt="" aria-hidden="true" className="h-[22px] w-[22px]" />
              </Link>

              <Link
                href={newsletterHref}
                className="flex min-h-[66px] items-center justify-between rounded-[14px] border border-white/10 bg-[#0b0d10] px-5 transition-colors hover:bg-[#12161b]"
              >
                <span className="dot-heading text-[1.02rem] uppercase tracking-[0.14em] text-white/92">Newsletter</span>
                <Image src={newsletterIcon} alt="" aria-hidden="true" className="h-[22px] w-[22px]" />
              </Link>

              <Link
                href={storeHref}
                className="flex min-h-[66px] items-center justify-between rounded-[14px] border border-white/10 bg-[#0b0d10] px-5 transition-colors hover:bg-[#12161b]"
              >
                <span className="dot-heading text-[1.02rem] uppercase tracking-[0.14em] text-white/92">{`Store: ${storeLabel}`}</span>
                <Image src={storeIcon} alt="" aria-hidden="true" className="h-[22px] w-[22px]" />
              </Link>

              <Link
                href={languageHref}
                className="flex min-h-[66px] items-center justify-between rounded-[14px] border border-white/10 bg-[#0b0d10] px-5 transition-colors hover:bg-[#12161b]"
              >
                <span className="dot-heading text-[1.02rem] uppercase tracking-[0.14em] text-white/92">{`Language: ${languageLabel}`}</span>
                <Image src={languageIcon} alt="" aria-hidden="true" className="h-[22px] w-[22px]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
