import Image from 'next/image'
import Link from 'next/link'
import { CompanyTrustBadge } from '@/components/CompanyTrustBadge'
import okIcon from '@/assets/icons/ok.svg'
import storeIcon from '@/assets/icons/store.svg'
import supportIcon from '@/assets/icons/support.svg'
import whatsappIcon from '@/assets/icons/whastapp.svg'
import { getNavigationMenuItems } from '@/lib/data/catalog-repository'
import { siteContactWhatsappUrl, storeLocations } from '@/lib/data/site-content'

const footerPanels = [
  { label: 'Contact Us', href: '/contact-us', icon: supportIcon },
  { label: 'Contact on WhatsApp', href: siteContactWhatsappUrl, icon: whatsappIcon },
  { label: 'Support', href: '/support-centre', icon: okIcon },
  { label: 'Newsletter', href: '/pages/newsletter', icon: okIcon },
  { label: 'About Us', href: '/about-us', icon: storeIcon },
  { label: 'Verification', href: '/company-verification', icon: okIcon },
  { label: 'Authenticity', href: '/authenticity', icon: okIcon },
  { label: 'Privacy Policy', href: '/pages/policies/privacy-policy', icon: storeIcon },
] as const

const footerSocialLinks = [
  { label: 'TikTok', href: 'https://www.tiktok.com/@nothingshop.pk?_r=1&_t=ZS-96UU9QJl59R' },
  { label: 'Facebook', href: 'https://www.facebook.com/share/1CDYdBibov/?mibextid=wwXIfr' },
] as const

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M15.82 3c.18 1.53 1.05 3.03 2.31 3.92.86.61 1.86.94 2.87.97v3.16a8.18 8.18 0 0 1-3.88-1.03v6.08c0 3.78-3.03 6.9-6.87 6.9A6.9 6.9 0 0 1 3.36 16.1c0-3.8 3.08-6.9 6.89-6.9.31 0 .62.02.92.07v3.23a3.7 3.7 0 0 0-.92-.12 3.72 3.72 0 0 0-3.71 3.72 3.72 3.72 0 0 0 6.35 2.63c.7-.69 1.11-1.66 1.11-2.7V3h1.82Z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.64 21v-8.03h2.7l.4-3.13h-3.1V7.84c0-.9.25-1.52 1.56-1.52H16.9V3.52c-.3-.04-1.3-.12-2.48-.12-2.45 0-4.13 1.5-4.13 4.25v2.19H7.5v3.13h2.8V21h3.34Z" />
    </svg>
  )
}

export async function NothingFooter() {
  const [menuItems] = await Promise.all([getNavigationMenuItems()])
  const store = storeLocations[0]

  const headerItems = menuItems.filter((item) => item.slug !== 'trending-picks')
  const storeHref = store?.href ?? '/contact-us#lahore-store'

  return (
    <footer className="bg-black text-white" style={{ fontFamily: 'var(--font-ndot57), sans-serif' }}>
      <div className="hidden lg:block">
        <div className="relative overflow-hidden rounded-t-[28px] border-t border-white/10 bg-[#020202]">
          <div className="relative min-h-[920px] px-10 pb-8 pt-10 xl:min-h-[980px] xl:px-12">
            <div className="mx-auto flex max-w-[560px] flex-col items-center text-center">
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
                      <span className="dot-heading text-[11px] uppercase tracking-[0.08em] text-white">{panel.label}</span>
                      <span className="flex h-6 w-6 items-center justify-center">
                        <Image src={panel.icon} alt="" aria-hidden="true" className="h-[20px] w-[20px] object-contain" />
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
                <Link
                  href={storeHref}
                  className="flex h-[54px] items-center justify-between rounded-[10px] bg-white/[0.06] px-5 transition-colors hover:bg-white/[0.09]"
                >
                  <span className="dot-heading text-[11px] uppercase tracking-[0.08em] text-white">{store?.label ?? 'Lahore Store'}</span>
                  <Image src={storeIcon} alt="" aria-hidden="true" className="h-[20px] w-[20px] object-contain" />
                </Link>
              </div>

              <div className="mt-10 flex items-center justify-center gap-4">
                {footerSocialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/16 bg-white/[0.06] text-white transition-colors hover:bg-white/[0.1]"
                  >
                    {item.label === 'TikTok' ? <TikTokIcon /> : <FacebookIcon />}
                  </a>
                ))}
              </div>

              <CompanyTrustBadge tone="dark" compact className="mt-8 w-full max-w-[512px] text-left" />
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
                  <span className="dot-heading text-[10px] uppercase tracking-[0.08em] text-white">{panel.label}</span>
                  <span className="flex h-6 w-6 items-center justify-center">
                    <Image src={panel.icon} alt="" aria-hidden="true" className="h-[20px] w-[20px] object-contain" />
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
            <Link
              href={storeHref}
              className="flex h-[52px] items-center justify-between rounded-[10px] bg-white/[0.06] px-4 transition-colors hover:bg-white/[0.09]"
            >
              <span className="dot-heading text-[10px] uppercase tracking-[0.08em] text-white">{store?.label ?? 'Lahore Store'}</span>
              <Image src={storeIcon} alt="" aria-hidden="true" className="h-[20px] w-[20px] object-contain" />
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            {footerSocialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/16 bg-white/[0.06] text-white transition-colors hover:bg-white/[0.1]"
              >
                {item.label === 'TikTok' ? <TikTokIcon /> : <FacebookIcon />}
              </a>
            ))}
          </div>

          <CompanyTrustBadge tone="dark" compact className="mx-auto mt-7 max-w-[320px] text-left" />
        </div>
      </div>
    </footer>
  )
}
