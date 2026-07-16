/** @type {import('next').NextConfig} */
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
    loader: 'custom',
    loaderFile: './lib/cloudinary-image-loader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
