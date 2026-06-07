import type { ProductDetailAggregateRating, ProductDetailReview } from '@/lib/models/product-detail'
import { ProductReviewSubmission } from '@/components/ProductReviewSubmission'

type ProductReviewsSectionProps = {
  aggregateRating?: ProductDetailAggregateRating | null
  productHandle: string
  productImage?: string | null
  productName: string
  reviews: ProductDetailReview[]
  className?: string
}

function StarIcon({ filled = true, className = '' }: { filled?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="m12 2.8 2.73 5.53 6.1.89-4.42 4.3 1.04 6.08L12 16.73 6.55 19.6l1.04-6.08-4.42-4.3 6.1-.89L12 2.8Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  )
}

function StarRow({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-7 w-7' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  const roundedRating = Math.round(rating)

  return (
    <span className="inline-flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon key={star} filled={star <= roundedRating} className={`${sizeClass} text-black`} />
      ))}
    </span>
  )
}

function splitReviewComment(comment?: string | null) {
  const [firstLine, ...rest] = (comment ?? '').split('\n').map((line) => line.trim()).filter(Boolean)
  return {
    title: rest.length > 0 ? firstLine : null,
    body: rest.length > 0 ? rest.join(' ') : firstLine || 'No written review provided.',
  }
}

function RatingSummary({
  aggregateRating,
  reviews,
}: {
  aggregateRating: ProductDetailAggregateRating
  reviews: ProductDetailReview[]
}) {
  const genuineReviews = reviews.filter((review) => !review.userName.endsWith('(Sample review)'))
  const distribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = genuineReviews.filter((review) => review.rating === rating).length
    return {
      rating,
      count,
      percentage: aggregateRating.reviewCount > 0 ? Math.round((count / aggregateRating.reviewCount) * 100) : 0,
    }
  })

  return (
    <div className="grid gap-8 border-y border-black/20 py-6 sm:py-8 lg:grid-cols-[minmax(240px,0.7fr)_minmax(360px,1fr)] lg:items-center lg:gap-14">
      <div>
        <div className="flex items-center gap-3 text-black">
          <StarIcon filled={false} className="h-8 w-8" />
          <h2 className="dot-heading text-[1.25rem] uppercase tracking-[0.08em] sm:text-[1.55rem]">Verified ratings</h2>
        </div>
        <div className="mt-7 flex items-end gap-3">
          <strong className="collection-product-name text-[5rem] font-normal leading-[0.82] tracking-[-0.08em] text-black sm:text-[6rem]">
            {aggregateRating.ratingValue.toFixed(1)}
          </strong>
          <span className="pb-1 [font-family:var(--font-lettera-regular)] text-[0.68rem] uppercase tracking-[0.14em] text-black/48">out of 5</span>
        </div>
        <p className="mt-5 [font-family:var(--font-lettera-regular)] text-[0.72rem] uppercase tracking-[0.14em] text-black/58">
          {aggregateRating.reviewCount} verified review{aggregateRating.reviewCount === 1 ? '' : 's'}
        </p>
        <div className="mt-4">
          <StarRow rating={aggregateRating.ratingValue} size="lg" />
        </div>
      </div>

      <div className="space-y-3.5">
        {distribution.map((item) => (
          <div key={item.rating} className="grid grid-cols-[18px_22px_minmax(0,1fr)_42px] items-center gap-2.5 [font-family:var(--font-lettera-regular)] text-[0.68rem]">
            <span className="text-right text-black/70">{item.rating}</span>
            <StarIcon className="h-5 w-5 text-black" />
            <div className="h-2 overflow-hidden rounded-full bg-black/10">
              <div
                className="h-full rounded-full bg-black"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <span className="text-right text-black/48">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReviewCard({ review }: { review: ProductDetailReview }) {
  const content = splitReviewComment(review.comment)
  const isSampleReview = review.userName.endsWith('(Sample review)')
  const displayName = review.userName.replace(/\s+\(Sample review\)$/, '')

  return (
    <article className="break-inside-avoid border-t border-black/20 py-5 sm:py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="product-card-name text-[1.02rem] text-black">By {displayName}</p>
          {review.createdAt ? <p className="mt-1 [font-family:var(--font-lettera-regular)] text-[0.62rem] uppercase tracking-[0.12em] text-black/40">{review.createdAt}</p> : null}
        </div>
        {isSampleReview ? (
          <span className="rounded-[4px] border border-black/18 px-2.5 py-1 [font-family:var(--font-lettera-regular)] text-[0.56rem] uppercase tracking-[0.14em] text-black/52">
            Example feedback
          </span>
        ) : (
          <span className="rounded-[4px] bg-black px-2.5 py-1 [font-family:var(--font-lettera-regular)] text-[0.56rem] uppercase tracking-[0.14em] text-white">
            Verified order
          </span>
        )}
      </div>
      <div className="mt-5">
        <StarRow rating={review.rating ?? 0} size="lg" />
      </div>
      {content.title ? <h3 className="collection-product-name mt-5 text-xl leading-tight text-black">{content.title}</h3> : null}
      <p className="mt-3 [font-family:var(--font-ntype82)] text-[0.88rem] leading-7 text-black/68 sm:text-[0.95rem]">{content.body}</p>
    </article>
  )
}

export function ProductReviewsSection({
  aggregateRating,
  productHandle,
  productImage,
  productName,
  reviews,
  className = '',
}: ProductReviewsSectionProps) {
  return (
    <section className={`relative overflow-hidden border-y border-black/12 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9 ${className}`}>
      <div className="relative">
      {aggregateRating && reviews.length > 0 ? <RatingSummary aggregateRating={aggregateRating} reviews={reviews} /> : null}
      <div className="mt-5 flex flex-col gap-4 border-y border-black/12 py-5 sm:flex-row sm:items-center sm:justify-between sm:py-6">
        <div>
          <p className="dot-heading text-[0.66rem] uppercase tracking-[0.18em] text-black/42">Customer feedback</p>
          <h2 className="collection-product-name mt-2 text-2xl leading-tight text-black">Purchased {productName}?</h2>
          <p className="mt-2 [font-family:var(--font-ntype82)] text-sm leading-6 text-black/62">Share a genuine experience after verifying your order number and WhatsApp number.</p>
        </div>
        <ProductReviewSubmission productHandle={productHandle} productImage={productImage} productName={productName} />
      </div>
      {reviews.length > 0 ? (
        <div className="mt-5 columns-1 gap-5 space-y-5 lg:columns-2 xl:columns-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="mt-5 border-y border-black/12 py-6 text-center [font-family:var(--font-ntype82)] text-sm text-black/62">Be the first verified buyer to review this product.</div>
      )}
      </div>
    </section>
  )
}
