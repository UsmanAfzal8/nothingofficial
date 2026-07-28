import localFont from 'next/font/local'
import Image from 'next/image'
import Link from 'next/link'
import { FooterStoreSelector } from '@/components/FooterStoreSelector'
import aboutUsIcon from '@/assets/icons/about_us.svg'
import supportIcon from '@/assets/icons/support.svg'
import whatsappFooterIcon from '@/assets/icons/whatsapp-footer-white.svg'
import { getNavigationMenuItems } from '@/lib/data/catalog-repository'
import { siteContactWhatsappUrl } from '@/lib/data/site-content'

const spaceMono = localFont({
  src: '../fonts/SpaceMono-Regular.otf',
  display: 'swap',
})

const footerPanels = [
  { label: 'Contact Us', href: '/contact-us', icon: supportIcon },
  { label: 'Contact on WhatsApp', href: siteContactWhatsappUrl, icon: whatsappFooterIcon },
  { label: 'About Us', href: '/about-us', icon: aboutUsIcon },
] as const

const footerUtilityLinks = [
  {
    label: 'Playground',
    href: 'https://playground.nothing.tech/',
    external: true,
  },
  { label: 'Contact', href: '/contact-us', external: false },
  { label: 'Newsletter', href: '/pages/newsletter', external: false },
  { label: 'Nothing Pakistan', href: '/nothing-pakistan', external: false },
  { label: 'Nothing Phones', href: '/nothing-phones-pakistan', external: false },
  { label: 'CMF by Nothing', href: '/cmf-by-nothing-pakistan', external: false },
  { label: 'AI Products', href: '/ai-products', external: false },
  { label: 'Earbuds', href: '/collections/earbuds', external: false },
  { label: 'Trending Picks', href: '/collections/nothing-pakistan-trending-picks', external: false },
  { label: 'Phone 2a', href: '/products/nothing-pakistan-phone-2a', external: false },
  { label: 'Ear Open', href: '/products/nothing-pakistan-ear-open', external: false },
  { label: 'CMF Phone 1', href: '/products/nothing-pakistan-cmf-phone-1', external: false },
  { label: 'CMF Watch Pro', href: '/products/nothing-pakistan-cmf-watch-pro', external: false },
  { label: 'CMF Watch Pro 2', href: '/products/nothing-pakistan-cmf-watch-pro-2', external: false },
  { label: 'Phone 2a Plus', href: '/products/nothing-pakistan-phone-2a-plus', external: false },
  { label: 'Phone 3a Community', href: '/products/nothing-pakistan-phone-3a-community-edition', external: false },
  {
    label: 'Careers',
    href: 'https://careers.nothing.tech/',
    external: true,
  },
  { label: 'Legal', href: '/pages/terms-of-sale', external: false },
] as const

export async function NothingFooter() {
  const [menuItems] = await Promise.all([getNavigationMenuItems()])

  const collectionItems = menuItems.filter((item) => !item.slug.endsWith('trending-picks'))
  const headerItems = [
    ...collectionItems.slice(0, 2),
    {
      label: 'Compare',
      href: '/compare',
      slug: 'compare',
      description: 'Compare Nothing and CMF products side by side.',
    },
    ...collectionItems.slice(2),
  ]
  const storeLabel = 'Pakistan'

  return (
    <footer className="bg-black text-white uppercase" style={{ fontFamily: 'var(--font-ndot57), sans-serif' }}>
      <div className="hidden lg:block">
        <div className="relative overflow-hidden rounded-t-[28px] border-t border-white/10 bg-[#020202]">
          <div className="relative min-h-[920px] px-10 pb-8 pt-10 xl:min-h-[980px] xl:px-12">
            <div className="mx-auto flex w-full max-w-[1220px] flex-col items-center text-center">
              <div className="flex w-full max-w-[560px] flex-col items-center">
                <nav className="flex flex-col items-center gap-7">
                  {headerItems.map((item) => (
                    <Link
                      key={item.slug}
                      href={item.href}
                      className="dot-heading text-[clamp(2.55rem,3.25vw,4.3rem)] uppercase leading-[0.88] tracking-[0.02em] text-white transition-opacity hover:opacity-72"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-24 grid w-full max-w-[512px] gap-2.5 text-left">
                  {footerPanels.map((panel) => {
                    const isExternal = panel.href.startsWith('http')
                    const content = (
                      <>
                        <span className={`${spaceMono.className} text-[11px] uppercase tracking-[0.08em] text-white`}>
                          {panel.label}
                        </span>
                        <span className="flex h-6 w-6 items-center justify-center">
                          <Image src={panel.icon} alt={`${panel.label} icon`} aria-hidden="true" className="h-[20px] w-[20px] object-contain" />
                        </span>
                      </>
                    )

                    return isExternal ? (
                      <a
                        key={panel.label}
                        href={panel.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-[54px] items-center justify-between rounded-[10px] bg-white/[0.06] px-5 transition-colors hover:bg-white/[0.09]"
                      >
                        {content}
                      </a>
                    ) : (
                      <Link
                        key={panel.label}
                        href={panel.href}
                        className="flex h-[54px] items-center justify-between rounded-[10px] bg-white/[0.06] px-5 transition-colors hover:bg-white/[0.09]"
                      >
                        {content}
                      </Link>
                    )
                  })}
                  <FooterStoreSelector
                    label={storeLabel}
                    className={`flex h-[54px] items-center justify-between rounded-[10px] bg-white/[0.06] px-5 ${spaceMono.className} text-[11px] uppercase tracking-[0.08em] text-white transition-colors hover:bg-white/[0.09]`}
                  />
                </div>
              </div>

              <div className="mt-10 flex w-full max-w-[1220px] items-start">
                <div className="flex flex-wrap items-center gap-x-10 gap-y-3 text-left">
                  {footerUtilityLinks.map((item) =>
                    item.external ? (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className={`${spaceMono.className} text-[11px] tracking-[0.14em] text-white/72 transition-colors hover:text-white`}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`${spaceMono.className} text-[11px] tracking-[0.14em] text-white/72 transition-colors hover:text-white`}
                      >
                        {item.label}
                      </Link>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden">
        <div className="relative overflow-hidden rounded-t-[24px] border-t border-white/10 bg-[#020202] px-6 pb-7 pt-14 text-center">
          <nav className="flex flex-col items-center gap-3">
            {headerItems.map((item) => (
              <Link
                key={item.slug}
                href={item.href}
                className="dot-heading text-[28px] uppercase leading-[0.92] tracking-[0.02em] text-white transition-opacity hover:opacity-72"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mx-auto mt-10 grid max-w-[320px] gap-2 text-left">
            {footerPanels.map((panel) => {
              const isExternal = panel.href.startsWith('http')
              const content = (
                <>
                  <span className={`${spaceMono.className} text-[10px] uppercase tracking-[0.08em] text-white`}>
                    {panel.label}
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center">
                    <Image src={panel.icon} alt={`${panel.label} icon`} aria-hidden="true" className="h-[20px] w-[20px] object-contain" />
                  </span>
                </>
              )

              return isExternal ? (
                <a
                  key={panel.label}
                  href={panel.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-[52px] items-center justify-between rounded-[10px] bg-white/[0.06] px-4 transition-colors hover:bg-white/[0.09]"
                >
                  {content}
                </a>
              ) : (
                <Link
                  key={panel.label}
                  href={panel.href}
                  className="flex h-[52px] items-center justify-between rounded-[10px] bg-white/[0.06] px-4 transition-colors hover:bg-white/[0.09]"
                >
                  {content}
                </Link>
              )
            })}
            <FooterStoreSelector
              label={storeLabel}
              className={`flex h-[52px] items-center justify-between rounded-[10px] bg-white/[0.06] px-4 ${spaceMono.className} text-[10px] uppercase tracking-[0.08em] text-white transition-colors hover:bg-white/[0.09]`}
            />
          </div>

          <div className="mx-auto mt-8 grid w-full max-w-[320px] gap-y-3">
            <div className="flex flex-col items-start gap-3 text-left">
              {footerUtilityLinks.map((item) =>
                item.external ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`${spaceMono.className} text-[10px] tracking-[0.14em] text-white/72 transition-colors hover:text-white`}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`${spaceMono.className} text-[10px] tracking-[0.14em] text-white/72 transition-colors hover:text-white`}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
