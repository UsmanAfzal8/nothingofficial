import Image from 'next/image'
import Link from 'next/link'
import { getMobileWarrantyBadgeUrl } from '@/lib/data/mobile-warranty'
import type { Product } from '@/lib/models/catalog'

type CatalogProductTileProps = {
  product: Product
  priority?: boolean
  tone?: 'default' | 'shop-all'
}

export function CatalogProductTile({ product, priority = false, tone = 'default' }: CatalogProductTileProps) {
  const isShopAll = tone === 'shop-all'
  const imageAlt = [
    product.name,
    product.colorName,
    product.priceLabel,
    'Nothing Pakistan Official Store',
  ].filter(Boolean).join(' - ')
  const productHref = product.colorName
    ? `${product.href}${product.href.includes('?') ? '&' : '?'}color=${encodeURIComponent(product.colorName)}`
    : product.href

  return (
    <Link href={productHref} prefetch={false} className="group block">
      <article className="flex h-full flex-col">
        <div className={`relative overflow-hidden ${isShopAll ? 'aspect-[4/5]' : 'aspect-[4/5]'}`}>
          {product.image ? (
            <Image
              src={product.image}
              alt={imageAlt}
              fill
              priority={priority}
              loading={priority ? undefined : 'lazy'}
              fetchPriority={priority ? 'high' : 'low'}
              sizes="(max-width: 768px) 48vw, (max-width: 1280px) 31vw, 19vw"
              className="object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.22em] text-black/24">
              No image
            </div>
          )}
          {product.kind === 'mobile' ? (
            <Image
              src={getMobileWarrantyBadgeUrl(product.warrantyYears)}
              alt={`${product.warrantyYears === 2 ? 2 : 1} year warranty`}
              width={96}
              height={96}
              className="absolute right-2 top-2 z-10 h-16 w-16 object-contain sm:h-20 sm:w-20"
            />
          ) : null}
        </div>

        <div className={isShopAll ? 'mt-3 text-center' : 'mt-4 border-t border-black/8 pt-4'}>
          <h3
            className={
              isShopAll
                ? 'product-card-name text-[0.98rem] leading-[1.12] text-black sm:text-[1.04rem]'
                : 'product-card-name text-[1.08rem] leading-[1.14] text-black sm:text-[1.18rem]'
            }
          >
            {product.name}
          </h3>
          {product.priceLabel ? (
            <p className={isShopAll ? 'mt-1 text-[11px] text-black/52' : 'mt-2 text-[12px] text-black/52'}>
              {product.originalPriceLabel ? (
                <span className="mr-2 text-black/36 line-through">{product.originalPriceLabel}</span>
              ) : null}
              <span>{product.priceLabel}</span>
            </p>
          ) : null}
        </div>
      </article>
    </Link>
  )
}
