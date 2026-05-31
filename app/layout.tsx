import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { CartProvider } from '@/components/CartProvider'
import { NavigationProgress } from '@/components/NavigationProgress'
import { WhatsAppFloatingButton } from '@/components/WhatsAppFloatingButton'
import { siteBrandName, siteDescription, siteKeywords, siteSeoTitle } from '@/lib/data/site-content'
import { buildRobotsMetadata, getSiteOrigin } from '@/lib/utils/seo'
import './globals.css'

const ndot55 = localFont({
  src: [{ path: '../fonts/Ndot55-Regular.otf', weight: '400', style: 'normal' }],
  variable: '--font-ndot55',
  display: 'swap',
})

const ndot55Caps = localFont({
  src: [{ path: '../fonts/Ndot55Caps-Regular.otf', weight: '400', style: 'normal' }],
  variable: '--font-ndot55-caps',
  display: 'swap',
})

const ndot57 = localFont({
  src: [{ path: '../fonts/Ndot57-Regular.otf', weight: '400', style: 'normal' }],
  variable: '--font-ndot57',
  display: 'swap',
})

const ntype82 = localFont({
  src: [{ path: '../fonts/NType82-Regular.otf', weight: '400', style: 'normal' }],
  variable: '--font-ntype82',
  display: 'swap',
})

const ntype82Headline = localFont({
  src: [{ path: '../fonts/NType82-Headline.otf', weight: '400', style: 'normal' }],
  variable: '--font-ntype82-headline',
  display: 'swap',
})

const georgia = localFont({
  src: [{ path: '../fonts/georgia.ttf', weight: '400', style: 'normal' }],
  variable: '--font-georgia',
  display: 'swap',
})

const letteraRegular = localFont({
  src: [{ path: '../fonts/LetteraMonoLL-Regular.otf', weight: '400', style: 'normal' }],
  variable: '--font-lettera-regular',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  title: {
    default: siteSeoTitle,
    template: `%s | ${siteBrandName}`,
  },
  description: siteDescription,
  applicationName: siteBrandName,
  keywords: siteKeywords,
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon/favicon.ico',
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/favicon/site.webmanifest',
  openGraph: {
    type: 'website',
    title: siteSeoTitle,
    description: siteDescription,
    siteName: siteBrandName,
    url: '/',
    locale: 'en_PK',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteSeoTitle,
    description: siteDescription,
  },
  verification: {
    google: 'aBctbeJ3EWEN3ioFRE7v7Wa-GoTECJ2LCPoCyTSlxhg',
  },
  robots: buildRobotsMetadata(),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-PK">
      <body className={`${ndot57.className} ${ndot57.variable} ${ndot55.variable} ${ndot55Caps.variable} ${ntype82.variable} ${ntype82Headline.variable} ${georgia.variable} ${letteraRegular.variable} isolate overflow-x-hidden antialiased`}>
        <div aria-hidden="true" className="site-dot-overlay" />
        <CartProvider>
          {children}
        </CartProvider>
        <NavigationProgress />
        <WhatsAppFloatingButton />
      </body>
    </html>
  )
}
