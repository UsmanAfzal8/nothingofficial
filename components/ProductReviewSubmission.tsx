'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useId, useRef, useState } from 'react'

type ProductReviewSubmissionProps = {
  productHandle: string
  productImage?: string | null
  productName: string
}

type SubmissionState = {
  message: string
  status: 'idle' | 'submitting' | 'success' | 'error'
}

const initialSubmissionState: SubmissionState = {
  message: '',
  status: 'idle',
}

export function ProductReviewSubmission({ productHandle, productImage, productName }: ProductReviewSubmissionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [submission, setSubmission] = useState(initialSubmissionState)
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const router = useRouter()

  const closeDialog = () => {
    setIsOpen(false)
    window.requestAnimationFrame(() => triggerRef.current?.focus())
  }

  useEffect(() => {
    if (!isOpen) return

    const dialog = dialogRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusableSelector = 'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const getFocusableElements = () => Array.from(dialog?.querySelectorAll<HTMLElement>(focusableSelector) ?? [])

    window.requestAnimationFrame(() => getFocusableElements()[0]?.focus())

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDialog()
        return
      }

      if (event.key !== 'Tab') return
      const focusable = getFocusableElements()
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const openDialog = () => {
    setRating(0)
    setSubmission(initialSubmissionState)
    setIsOpen(true)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    if (rating < 1 || rating > 5) {
      setSubmission({ message: 'Choose a rating from 1 to 5 stars.', status: 'error' })
      return
    }

    setSubmission({ message: '', status: 'submitting' })

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          orderNumber: formData.get('orderNumber'),
          productHandle,
          rating,
          reviewNote: formData.get('reviewNote'),
          whatsappNumber: formData.get('whatsappNumber'),
        }),
      })
      const payload = (await response.json()) as { error?: string; message?: string }

      if (!response.ok) {
        throw new Error(payload.error || 'Your review could not be saved.')
      }

      form.reset()
      setRating(0)
      setSubmission({ message: payload.message || 'Thank you. Your review has been added.', status: 'success' })
      router.refresh()
    } catch (error) {
      setSubmission({
        message: error instanceof Error ? error.message : 'Your review could not be saved.',
        status: 'error',
      })
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openDialog}
        className="inline-flex min-h-11 items-center justify-center rounded-[5px] bg-black px-6 [font-family:var(--font-lettera-regular)] text-[0.66rem] uppercase tracking-[0.16em] text-white transition hover:opacity-82 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
      >
        Add your review
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[120] flex items-end justify-center overflow-y-auto bg-black/68 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-6 sm:py-8">
          <button type="button" aria-label="Close review form" className="absolute inset-0 cursor-default" onClick={closeDialog} />

          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-[620px] overflow-y-auto rounded-[8px] border border-black bg-[#f1f1ee] p-5 shadow-[0_32px_100px_rgba(0,0,0,0.34)] sm:max-h-[calc(100dvh-4rem)] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[5px] border border-black/12 bg-white">
                  {productImage ? <Image src={productImage} alt={productName} fill sizes="80px" className="object-contain p-2" /> : null}
                </div>
                <div className="min-w-0">
                  <p className="dot-heading text-[0.62rem] uppercase tracking-[0.18em] text-black/48">Reviewing</p>
                  <h2 id={titleId} className="collection-product-name mt-2 text-xl leading-tight text-black sm:text-2xl">
                    {productName}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close review form"
                onClick={closeDialog}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] border border-black/12 bg-white text-xl text-black transition hover:bg-black hover:text-white"
              >
                &times;
              </button>
            </div>

            {submission.status === 'success' ? (
              <div className="mt-7 rounded-[8px] border border-black bg-white p-6 text-center">
                <p className="collection-product-name text-xl text-black">Review submitted</p>
                <p className="mt-2 [font-family:var(--font-ntype82)] text-sm leading-6 text-black/62">{submission.message}</p>
                <button type="button" onClick={closeDialog} className="mt-5 rounded-[5px] bg-black px-6 py-3 [font-family:var(--font-lettera-regular)] text-[0.66rem] uppercase tracking-[0.16em] text-white">
                  Done
                </button>
              </div>
            ) : (
              <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
                <fieldset>
                  <legend className="dot-heading text-[0.68rem] uppercase tracking-[0.16em] text-black/62">Your rating</legend>
                  <div className="mt-2 flex items-center gap-1" role="radiogroup" aria-label="Choose a rating from 1 to 5 stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        aria-label={`${star} star${star === 1 ? '' : 's'}`}
                        role="radio"
                        aria-checked={rating === star}
                        onClick={() => setRating(star)}
                        className={`inline-flex h-11 w-11 items-center justify-center text-4xl leading-none transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-black/30 ${
                          star <= rating ? 'text-black' : 'text-[rgba(0,0,0,0.16)]'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-2 [font-family:var(--font-lettera-regular)] text-[0.62rem] uppercase tracking-[0.12em] text-black/48">
                      {rating > 0 ? `${rating} / 5` : 'Select'}
                    </span>
                  </div>
                </fieldset>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="[font-family:var(--font-ntype82)] text-sm text-black/72">
                    Order number
                    <input
                      name="orderNumber"
                      required
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="Example: 1024"
                      className="mt-2 h-12 w-full rounded-[5px] border border-black/18 bg-white px-4 font-normal text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </label>
                  <label className="[font-family:var(--font-ntype82)] text-sm text-black/72">
                    Name
                    <input
                      name="name"
                      required
                      maxLength={100}
                      autoComplete="name"
                      placeholder="Your name"
                      className="mt-2 h-12 w-full rounded-[5px] border border-black/18 bg-white px-4 font-normal text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </label>
                </div>

                <label className="block [font-family:var(--font-ntype82)] text-sm text-black/72">
                  WhatsApp number
                  <input
                    name="whatsappNumber"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="03XX XXXXXXX"
                    className="mt-2 h-12 w-full rounded-[5px] border border-black/18 bg-white px-4 font-normal text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                  />
                </label>

                <label className="block [font-family:var(--font-ntype82)] text-sm text-black/72">
                  Review note
                  <textarea
                    name="reviewNote"
                    required
                    minLength={10}
                    maxLength={1200}
                    rows={5}
                    placeholder="Tell others what you liked about this product."
                    className="mt-2 w-full resize-y rounded-[5px] border border-black/18 bg-white px-4 py-3 font-normal leading-6 text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                  />
                </label>

                {submission.status === 'error' ? (
                  <p role="alert" className="rounded-[14px] bg-red-50 px-4 py-3 text-sm text-red-700">
                    {submission.message}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={submission.status === 'submitting'}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-[5px] bg-black px-6 [font-family:var(--font-lettera-regular)] text-[0.68rem] uppercase tracking-[0.16em] text-white transition hover:opacity-82 disabled:cursor-wait disabled:opacity-60"
                >
                  {submission.status === 'submitting' ? 'Verifying order...' : 'Submit review'}
                </button>
                <p className="text-center [font-family:var(--font-ntype82)] text-xs leading-5 text-black/42">
                  Your order number and WhatsApp number are used to verify your purchase. Your WhatsApp number is not displayed publicly.
                </p>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
