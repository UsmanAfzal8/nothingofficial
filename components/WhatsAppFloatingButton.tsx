'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import whatsappIcon from '@/assets/icons/whastapp.svg'
import { siteContactWhatsappUrl } from '@/lib/data/site-content'

export function WhatsAppFloatingButton() {
  const pathname = usePathname()

  if (pathname === '/' || pathname.startsWith('/order') || pathname.startsWith('/products') || pathname.startsWith('/support-centre') || pathname.startsWith('/pages/support-centre')) {
    return null
  }

  return (
    <a
      href={siteContactWhatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Nothing Pakistan on WhatsApp"
      className="fixed bottom-5 right-4 z-50 inline-flex items-center justify-center bg-transparent p-0 transition-transform duration-200 hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6"
    >
      <Image src={whatsappIcon} alt="WhatsApp icon" aria-hidden="true" className="h-14 w-14 sm:h-16 sm:w-16" />
      <span className="sr-only">Open WhatsApp chat for Nothing Pakistan</span>
    </a>
  )
}
