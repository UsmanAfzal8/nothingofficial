import Image from 'next/image'
import Link from 'next/link'
import okIcon from '@/assets/icons/ok.svg'
import storeIcon from '@/assets/icons/store.svg'
import supportIcon from '@/assets/icons/support.svg'
import whatsappIcon from '@/assets/icons/whastapp.svg'
import { getNavigationMenuItems } from '@/lib/data/catalog-repository'
import { siteContactWhatsappUrl, storeLocations } from '@/lib/data/site-content'

const footerPanels = [
  { label: 'Contact Us', href: '/pages/contact-us', icon: supportIcon },
  { label: 'Contact on WhatsApp', href: siteContactWhatsappUrl, icon: whatsappIcon },
  { label: 'Support', href: '/pages/support-centre', icon: okIcon },
  { label: 'Newsletter', href: '/pages/newsletter', icon: okIcon },
  { label: 'About Us', href: '/pages/about', icon: storeIcon },
  { label: 'Privacy Policy', href: '/pages/policies/privacy-policy', icon: storeIcon },
] as const

export async function NothingFooter() {
  const [menuItems] = await Promise.all([getNavigationMenuItems()])
  const store = storeLocations[0]

  const headerItems = menuItems.filter((item) => item.slug !== 'trending-picks')
  const storeHref = store?.href ?? '/pages/contact-us#lahore-store'

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
        </div>
      </div>
    </footer>
  )
}
