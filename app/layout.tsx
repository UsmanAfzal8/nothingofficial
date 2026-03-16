import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { CartProvider } from '@/components/CartProvider'
import { siteBrandName, siteDescription, siteKeywords, siteSeoTitle } from '@/lib/data/site-content'
import { getSiteOrigin } from '@/lib/utils/seo'
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

const ntype82 = localFont({
  src: [{ path: '../fonts/NType82-Regular.otf', weight: '400', style: 'normal' }],
  variable: '--font-ntype82',
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-PK">
      <body className={`${ndot55.className} ${ndot55.variable} ${ndot55Caps.variable} ${ntype82.variable}`}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
