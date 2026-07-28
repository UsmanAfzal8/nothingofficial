/** @type {import('next').NextConfig} */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://analytics.ahrefs.com https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: wss:",
  "media-src 'self' blob: https:",
  "frame-src 'self' https://www.google.com",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: '/mobiles',
        destination: '/collections/phones',
        permanent: true,
      },
      {
        source: '/mobiles/:handle',
        destination: '/products/:handle',
        permanent: true,
      },
      {
        source: '/pages/about',
        destination: '/about-us',
        permanent: true,
      },
      {
        source: '/pages/about-us',
        destination: '/about-us',
        permanent: true,
      },
      {
        source: '/pages/contact-us',
        destination: '/contact-us',
        permanent: true,
      },
      {
        source: '/pages/support-centre',
        destination: '/support-centre',
        permanent: true,
      },
      {
        source: '/pages/policies/:slug',
        destination: '/pages/:slug',
        permanent: true,
      },
      {
        source: '/collections/nothing-pakistan-shop-all',
        destination: '/collections/shop-all',
        permanent: true,
      },
      {
        source: '/collections/nothing-pakistan-phones',
        destination: '/collections/phones',
        permanent: true,
      },
      {
        source: '/collections/nothing-pakistan-chargers',
        destination: '/collections/chargers',
        permanent: true,
      },
      {
        source: '/collections/nothing-pakistan-protectors',
        destination: '/collections/protectors',
        permanent: true,
      },
      {
        source: '/collections/nothing-pakistan-earbuds',
        destination: '/collections/earbuds',
        permanent: true,
      },
      {
        source: '/collections/nothing-pakistan-audio',
        destination: '/collections/audio',
        permanent: true,
      },
      {
        source: '/collections/nothing-pakistan-cases',
        destination: '/collections/cases',
        permanent: true,
      },
      {
        source: '/collections/nothing-pakistan-power',
        destination: '/collections/power',
        permanent: true,
      },
      {
        source: '/collections/nothing-pakistan-watches',
        destination: '/collections/watches',
        permanent: true,
      },
      {
        source: '/collections/nothing-pakistan-apparel',
        destination: '/collections/apparel',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'nothingpakistan.pk',
          },
        ],
        destination: 'https://www.nothingpakistan.pk/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    const noindexHeaders = [
      {
        key: 'X-Robots-Tag',
        value: 'noindex, nofollow, noarchive',
      },
    ];
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/dashboard/:path*',
        headers: noindexHeaders,
      },
      {
        source: '/api/:path*',
        headers: noindexHeaders,
      },
    ];
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
