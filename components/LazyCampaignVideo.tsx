'use client'

import { useEffect, useRef, useState } from 'react'

type LazyCampaignVideoProps = {
  src: string
  poster?: string
  label: string
  objectPosition: string
}

export function LazyCampaignVideo({ src, poster, label, objectPosition }: LazyCampaignVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setShouldLoad(true)
        observer.disconnect()
      },
      { rootMargin: '400px 0px' },
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 bg-[#f1f1ef]">
      {shouldLoad ? (
        <video
          className="h-full w-full object-cover"
          style={{ objectPosition }}
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
          preload="none"
          aria-label={label}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : null}
    </div>
  )
}
