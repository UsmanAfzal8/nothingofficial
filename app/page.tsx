import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { CatalogProductTile } from '@/components/CatalogProductTile'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import { getHomePageData } from '@/lib/data/catalog-repository'
import { buildOrganizationStructuredData, buildWebsiteStructuredData, siteKeywords, siteSeoTitle } from '@/lib/data/site-content'
import type { HomePageSection, Product } from '@/lib/models/catalog'

export const revalidate = 900
export const metadata: Metadata = {
  title: {
    absolute: siteSeoTitle,
  },
  description:
    'Shop Nothing Pakistan for Nothing phones, audio products, CMF devices, and Nothing accessories in Pakistan through category-led live catalog pages.',
  keywords: [
    ...siteKeywords,
    'Nothing Pakistan accessories',
    'Nothing Pakistan phones',
    'Nothing audio Pakistan',
  ],
  alternates: {
    canonical: '/',
  },
}

function ProductShowcaseStage({
  product,
  title,
  eyebrow,
  size = 'large',
}: {
  product: Product | null
  title: string
  eyebrow: string
  size?: 'large' | 'compact'
}) {
  const imageHeightClass = size === 'large' ? 'h-[280px] sm:h-[360px] lg:h-[460px]' : 'h-[220px] sm:h-[280px] lg:h-[340px]'
  const panelPaddingClass = size === 'large' ? 'p-8' : 'p-6'

  return (
    <div className={`relative flex min-h-[360px] items-center justify-center overflow-hidden ${panelPaddingClass}`}>
      <div className="absolute left-2 top-2 text-[10px] uppercase tracking-[0.22em] text-black/62">
        {eyebrow}
      </div>

      {product?.priceLabel ? (
        <div className="absolute bottom-2 left-2 text-[10px] uppercase tracking-[0.22em] text-black/62">
          {product.priceLabel}
        </div>
      ) : null}

      {product?.image ? (
        <div className={`relative ${imageHeightClass} w-full max-w-[720px]`}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 80vw, 40vw"
            className="object-contain"
          />
        </div>
      ) : (
        <div className="relative flex h-full min-h-[280px] w-full items-center justify-center text-center text-xs uppercase tracking-[0.28em] text-black/40">
          {title}
        </div>
      )}
    </div>
  )
}

function CategorySection({
  section,
  index,
}: {
  section: HomePageSection
  index: number
}) {
  const featuredProduct = section.featuredProduct
  const secondaryProducts = section.products.filter((product) => product.id !== featuredProduct?.id).slice(0, 5)

  return (
    <section key={section.slug} className="overflow-hidden border-t border-black/10 px-4 py-12 md:px-8 md:py-16">
      <div className="relative mx-auto max-w-screen-2xl">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:items-center">
          <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.32em] text-black/42">
              {String(index + 1).padStart(2, '0')} / {section.title}
            </p>
            <h2 className="collection-product-name mt-4 text-4xl leading-[0.96] sm:text-5xl">{section.title}</h2>
            <p className="mt-4 max-w-xl font-sans text-[15px] leading-7 tracking-normal text-black/90 sm:text-base">
              {section.description || `Live products loaded from the ${section.title} collection in Supabase.`}
            </p>

            {section.childCollections && section.childCollections.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {section.childCollections.map((child) => (
                  <Link
                    key={child.slug}
                    href={child.href}
                    className="rounded-full border border-black/12 bg-white px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-black/62 transition-colors hover:bg-black hover:text-white"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={section.href}
                className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-[11px] uppercase tracking-[0.24em] text-white transition-opacity hover:opacity-85"
              >
                View Collection
              </Link>
              {featuredProduct ? (
                <Link
                  href={`/order/${featuredProduct.handle}`}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-black/15 px-5 text-[11px] uppercase tracking-[0.24em] text-black transition-colors hover:bg-black hover:text-white"
                >
                  Order Featured
                </Link>
              ) : null}
            </div>
          </div>

          <ProductShowcaseStage
            product={featuredProduct}
            title={section.title}
            eyebrow={featuredProduct?.variant || featuredProduct?.subtitle || section.title}
            size="compact"
          />
        </div>

        {secondaryProducts.length > 0 ? (
          <div className="mt-10 border-t border-black/10 pt-8">
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-5">
              {secondaryProducts.map((product, productIndex) => (
                <CatalogProductTile key={product.id} product={product} priority={index === 0 && productIndex < 2} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default async function Home() {
  const { sections, sectionNavigation, featuredProduct } = await getHomePageData()
  const heroSection = sections[0] ?? null

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-[#111]">
      <SeoStructuredData data={[buildOrganizationStructuredData(), buildWebsiteStructuredData()]} />
      <NothingHeader />

      <main className="pt-20">
        {heroSection && featuredProduct ? (
          <section className="relative overflow-hidden border-b border-black/10 px-4 pb-10 pt-6 md:px-8 md:pb-14 md:pt-10">
            <div className="relative mx-auto grid max-w-screen-2xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,560px)] lg:items-center">
              <div className="max-w-3xl pt-6">
                <p className="text-[11px] uppercase tracking-[0.34em] text-black/56">Nothing Pakistan</p>
                <h1 className="collection-product-name mt-5 text-5xl leading-[0.92] sm:text-6xl lg:text-7xl">
                  Nothing Pakistan phones, audio and accessories
                </h1>
                <p className="mt-5 max-w-2xl font-sans text-[15px] leading-7 tracking-normal text-black/90 sm:text-base">
                  Shop Nothing Pakistan through live category pages for Nothing phones, Nothing accessories, CMF products,
                  and audio devices in Pakistan. The homepage follows your real Supabase structure and keeps only product imagery.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href={heroSection.href}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-[11px] uppercase tracking-[0.24em] text-white transition-opacity hover:opacity-85"
                  >
                    Explore {heroSection.title}
                  </Link>
                  <Link
                    href="/collections/shop-all"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-black/15 px-5 text-[11px] uppercase tracking-[0.24em] text-black transition-colors hover:bg-black hover:text-white"
                  >
                    Shop All
                  </Link>
                  <Link
                    href="/cart"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-black/15 px-5 text-[11px] uppercase tracking-[0.24em] text-black transition-colors hover:bg-black hover:text-white"
                  >
                    Open Cart
                  </Link>
                </div>

                <div className="mt-10 flex flex-wrap gap-3">
                  {sectionNavigation.map((item) => (
                    <Link
                      key={item.slug}
                      href={item.href}
                      className="rounded-full border border-black/14 bg-white px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-black/64 transition-colors hover:bg-black hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pb-2 lg:pb-0">
                <ProductShowcaseStage
                  product={featuredProduct}
                  title={heroSection.title}
                  eyebrow={featuredProduct.variant || featuredProduct.subtitle || heroSection.title}
                  size="large"
                />
              </div>
            </div>
          </section>
        ) : (
          <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 pt-24 text-center">
            <div>
              <p className="text-[11px] uppercase tracking-[0.34em] text-black/45">Supabase Catalog</p>
              <h1 className="collection-product-name mt-4 text-4xl sm:text-5xl">No live items found</h1>
              <p className="mt-4 font-sans text-[15px] leading-7 tracking-normal text-black/90">
                Connect your category relations and product tables and this homepage will populate automatically.
              </p>
            </div>
          </section>
        )}

        {sections.map((section, index) => (
          <CategorySection key={section.slug} section={section} index={index} />
        ))}
      </main>

      <NothingFooter />
    </div>
  )
}
