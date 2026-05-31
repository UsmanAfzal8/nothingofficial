/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
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
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'nothingshop.pk',
          },
        ],
        destination: 'https://www.nothingshop.pk/:path*',
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
    const noindexFollowHeaders = [
      {
        key: 'X-Robots-Tag',
        value: 'noindex, follow, noarchive',
      },
    ];

    return [
      {
        source: '/order/:path*',
        headers: noindexFollowHeaders,
      },
      {
        source: '/order',
        headers: noindexFollowHeaders,
      },
      {
        source: '/cart',
        headers: noindexHeaders,
      },
      {
        source: '/dashboard/:path*',
        headers: noindexHeaders,
      },
      {
        source: '/api/:path*',
        headers: noindexHeaders,
      },
      {
        source: '/opengraph-image',
        headers: noindexHeaders,
      },
      {
        source: '/twitter-image',
        headers: noindexHeaders,
      },
      {
        source: '/_next/static/:path*',
        headers: noindexHeaders,
      },
    ];
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
