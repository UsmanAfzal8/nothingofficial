/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og'
import type { ReactNode } from 'react'

const WIDTH = 1200
const HEIGHT = 630
const HOME_HERO_IMAGE_PATH = '/social/nothing-pakistan-og.jpg'

function DotPill({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        border: '1px solid rgba(255, 255, 255, 0.34)',
        borderRadius: 9999,
        padding: '10px 16px',
        fontSize: 18,
        lineHeight: 1,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: '#ffffff',
        background: 'rgba(0, 0, 0, 0.26)',
      }}
    >
      {children}
    </div>
  )
}

type SocialImageProps = {
  origin: string
  title: string
  subtitle: string
  eyebrow: string
  chips?: string[]
}

export async function createSocialImage({ origin, title, subtitle, eyebrow }: SocialImageProps) {
  const heroImageUrl = new URL(HOME_HERO_IMAGE_PATH, origin)
  const heroImageData = await fetch(heroImageUrl).then((response) => response.arrayBuffer())

  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          background: '#111111',
          color: '#ffffff',
        }}
      >
        <img
          src={heroImageData as unknown as string}
          alt=""
          width={WIDTH}
          height={HEIGHT}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.72) 42%, rgba(0,0,0,0.28) 68%, rgba(0,0,0,0.08) 100%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.08) 38%, rgba(0,0,0,0.78) 100%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            width: '100%',
            height: '100%',
            padding: '58px 64px 136px',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              width: '50%',
              gap: 24,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}>
              <div
                style={{
                  fontSize: 66,
                  lineHeight: 1,
                  letterSpacing: 0,
                  textShadow: '0 3px 28px rgba(0,0,0,0.9)',
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: 28,
                  lineHeight: 1.3,
                  letterSpacing: 0,
                  color: 'rgba(255,255,255,0.94)',
                  maxWidth: 540,
                  textShadow: '0 2px 22px rgba(0,0,0,0.92)',
                }}
              >
                {subtitle}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <DotPill>Live catalog</DotPill>
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              left: 64,
              right: 64,
              top: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              fontSize: 18,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.72)',
            }}
          >
            <span>{eyebrow} / nothingshop.pk</span>
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
    },
  )
}
