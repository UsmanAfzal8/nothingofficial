'use client'

import { useState } from 'react'
import Link from 'next/link'
import { newsletterHighlights, socialLinks } from '@/lib/data/site-content'

const newsletterTopics = ['Phones', 'Audio', 'Accessories', 'CMF', 'Support'] as const

export function NewsletterSignupContent() {
  const [email, setEmail] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Phones', 'Accessories'])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const hasSocialLinks = socialLinks.length > 0

  function toggleTopic(topic: string) {
    setSelectedTopics((currentTopics) =>
      currentTopics.includes(topic) ? currentTopics.filter((item) => item !== topic) : [...currentTopics, topic],
    )
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim()) {
      return
    }

    setIsSubmitted(true)
  }

  return (
    <div className="space-y-14">
      <section className="grid gap-10 border-b border-black/8 pb-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:items-end">
        <div className="max-w-3xl">
          <p className="dot-heading text-[10px] tracking-[0.34em] text-black/42">Newsletter</p>
          <h1 className="mt-4 text-[2.8rem] leading-[0.9] tracking-[-0.06em] text-black sm:text-[4.2rem] lg:text-[5.4rem]">
            Stay close to new drops, support updates, and live catalog releases.
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-black/62 md:text-base">
            Sign up to get product launches, accessory restocks, support updates, and Nothing Pakistan store news in one clean feed.
          </p>
        </div>

        <div className="rounded-[30px] border border-black/10 bg-[#f6f6f2] p-6">
          <p className="dot-heading text-[10px] tracking-[0.28em] text-black/42">What you get</p>
          <div className="mt-5 space-y-3">
            {newsletterHighlights.map((item) => (
              <div key={item} className="rounded-[18px] border border-black/8 bg-white px-4 py-3 text-sm text-black/68">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <form onSubmit={handleSubmit} className="rounded-[34px] border border-black/10 bg-white p-6 shadow-[0_20px_55px_rgba(17,17,17,0.04)] md:p-8">
          <p className="dot-heading text-[10px] tracking-[0.28em] text-black/42">Join Updates</p>
          <h2 className="mt-4 text-[2rem] leading-[0.94] tracking-[-0.05em] text-black md:text-[2.8rem]">Enter your email</h2>

          <div className="mt-8 grid gap-4">
            <label className="grid gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-black/46">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setIsSubmitted(false)
                }}
                placeholder="you@example.com"
                className="h-12 rounded-full border border-black/12 bg-[#f7f7f3] px-5 text-sm text-black outline-none transition-colors focus:border-black"
                required
              />
            </label>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/46">Topics</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {newsletterTopics.map((topic) => {
                  const isActive = selectedTopics.includes(topic)

                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={`rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.22em] transition-colors ${
                        isActive ? 'bg-black text-white' : 'border border-black/10 bg-[#f7f7f3] text-black/58 hover:bg-black hover:text-white'
                      }`}
                    >
                      {topic}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-[10px] uppercase tracking-[0.26em] text-white transition-opacity hover:opacity-85"
            >
              Join Newsletter
            </button>

            {isSubmitted ? (
              <p className="text-sm leading-6 text-black/62">
                Thanks. Your email was captured in this screen flow. Connect a newsletter backend any time to turn this into a live subscription endpoint.
              </p>
            ) : (
              <p className="text-sm leading-6 text-black/48">
                This page is designed and ready for your newsletter flow. It currently handles the signup interaction on the client.
              </p>
            )}
          </div>
        </form>

        {hasSocialLinks ? (
          <aside className="rounded-[34px] border border-black/10 bg-[#f6f6f2] p-6 md:p-8">
            <p className="dot-heading text-[10px] tracking-[0.28em] text-black/42">Also Follow</p>
            <h2 className="mt-4 text-[2rem] leading-[0.94] tracking-[-0.05em] text-black md:text-[2.6rem]">Join the wider Nothing conversation.</h2>
            <p className="mt-4 text-sm leading-7 text-black/62">
              Use the newsletter for launches and use our official brand channels for community updates, product videos, and support news.
            </p>

            <div className="mt-8 grid gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-[18px] border border-black/10 bg-white px-4 py-3 text-sm text-black/74 transition-colors hover:bg-black hover:text-white"
                >
                  <span>{item.label}</span>
                  <span className="text-black/30">+</span>
                </a>
              ))}
            </div>

            <div className="mt-8 rounded-[24px] border border-black/10 bg-white px-5 py-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/44">Need help first?</p>
              <p className="mt-3 text-sm leading-6 text-black/66">
                Go to support if you need delivery, returns, or product help before joining the newsletter flow.
              </p>
              <Link
                href="/support-centre"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-black/12 px-5 text-[10px] uppercase tracking-[0.24em] text-black transition-colors hover:bg-black hover:text-white"
              >
                Open Support
              </Link>
            </div>
          </aside>
        ) : null}
      </section>
    </div>
  )
}
