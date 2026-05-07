'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

function isModifiedClick(event: MouseEvent): boolean {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0
}

function shouldShowProgress(anchor: HTMLAnchorElement): boolean {
  if (anchor.target && anchor.target !== '_self') {
    return false
  }

  if (anchor.hasAttribute('download')) {
    return false
  }

  const href = anchor.getAttribute('href')

  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('whatsapp:')) {
    return false
  }

  const url = new URL(anchor.href, window.location.href)

  if (url.origin !== window.location.origin) {
    return false
  }

  return url.pathname !== window.location.pathname || url.search !== window.location.search
}

export function NavigationProgress() {
  const pathname = usePathname()
  const [isPending, setIsPending] = useState(false)
  const hideTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current)
    }

    hideTimerRef.current = window.setTimeout(() => setIsPending(false), 180)

    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current)
      }
    }
  }, [pathname])

  useEffect(() => {
    const showThenFallbackHide = () => {
      setIsPending(true)

      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current)
      }

      hideTimerRef.current = window.setTimeout(() => setIsPending(false), 7000)
    }

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedClick(event)) {
        return
      }

      const target = event.target

      if (!(target instanceof Element)) {
        return
      }

      const anchor = target.closest<HTMLAnchorElement>('a[href]')

      if (!anchor || !shouldShowProgress(anchor)) {
        return
      }

      showThenFallbackHide()
    }

    const handlePageShow = () => setIsPending(false)

    document.addEventListener('click', handleClick, true)
    window.addEventListener('popstate', showThenFallbackHide)
    window.addEventListener('pageshow', handlePageShow)

    return () => {
      document.removeEventListener('click', handleClick, true)
      window.removeEventListener('popstate', showThenFallbackHide)
      window.removeEventListener('pageshow', handlePageShow)

      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current)
      }
    }
  }, [])

  if (!isPending) {
    return null
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[3px] overflow-hidden bg-black/8" role="status" aria-live="polite">
        <div className="np-navigation-progress h-full bg-black" />
      </div>
      <div className="pointer-events-none fixed left-3 top-3 z-[80] rounded-full border border-black/10 bg-[#fbf7ef] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-black shadow-[0_12px_38px_rgba(0,0,0,0.16)] sm:left-4 sm:top-4">
        Loading...
      </div>
      <style jsx>{`
        .np-navigation-progress {
          width: 42%;
          animation: np-navigation-slide 1.05s ease-in-out infinite;
          transform-origin: left center;
        }

        @keyframes np-navigation-slide {
          0% {
            transform: translateX(-110%) scaleX(0.72);
          }

          45% {
            transform: translateX(88%) scaleX(1);
          }

          100% {
            transform: translateX(245%) scaleX(0.82);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .np-navigation-progress {
            animation: none;
            width: 100%;
          }
        }
      `}</style>
    </>
  )
}
