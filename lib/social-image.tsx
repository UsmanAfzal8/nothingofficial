import { ImageResponse } from 'next/og'
import type { ReactNode } from 'react'

const WIDTH = 1200
const HEIGHT = 630

async function loadFont(pathname: string) {
  const response = await fetch(new URL(pathname, import.meta.url))

  if (!response.ok) {
    throw new Error(`Failed to load font asset: ${pathname}`)
  }

  return response.arrayBuffer()
}

function DotPill({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        border: '1px solid rgba(17, 17, 17, 0.14)',
        borderRadius: 9999,
        padding: '12px 18px',
        fontSize: 20,
        lineHeight: 1,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: '#111111',
        background: 'rgba(255, 255, 255, 0.8)',
      }}
    >
      {children}
    </div>
  )
}

type SocialImageProps = {
  title: string
  subtitle: string
  eyebrow: string
  chips: string[]
}

export async function createSocialImage({ title, subtitle, eyebrow, chips }: SocialImageProps) {
  const [headlineFont, bodyFont] = await Promise.all([
    loadFont('../fonts/NType82-Headline.otf'),
    loadFont('../fonts/NType82-Regular.otf'),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          background:
            'radial-gradient(circle at 16% 18%, rgba(255,255,255,0.9) 0%, rgba(240,240,236,0.95) 30%, rgba(214,216,211,1) 100%)',
          color: '#111111',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle, rgba(17,17,17,0.14) 0.8px, transparent 1px), radial-gradient(circle, rgba(17,17,17,0.04) 0.8px, transparent 1px)',
            backgroundSize: '54px 54px, 160px 160px',
            backgroundPosition: '20px 18px, 54px 42px',
            opacity: 0.5,
          }}
        />

        <div
          style={{
            position: 'absolute',
            right: -120,
            top: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(17,17,17,0.11), rgba(17,17,17,0) 70%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: -90,
            bottom: -120,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0) 68%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            width: '100%',
            padding: 64,
            gap: 40,
            alignItems: 'stretch',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '62%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  fontFamily: 'NType82',
                  fontSize: 24,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                }}
              >
                {eyebrow}
              </div>
              <DotPill>Live catalog</DotPill>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 760 }}>
              <div
                style={{
                  fontFamily: 'NType82Headline',
                  fontSize: 84,
                  lineHeight: 0.92,
                  letterSpacing: '-0.05em',
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontFamily: 'NType82',
                  fontSize: 34,
                  lineHeight: 1.22,
                  letterSpacing: '-0.02em',
                  color: 'rgba(17,17,17,0.82)',
                  maxWidth: 720,
                }}
              >
                {subtitle}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', paddingTop: 10 }}>
              {chips.map((chip) => (
                <div
                  key={chip}
                  style={{
                    border: '1px solid rgba(17, 17, 17, 0.14)',
                    borderRadius: 9999,
                    padding: '12px 16px',
                    fontFamily: 'NType82',
                    fontSize: 24,
                    lineHeight: 1,
                    letterSpacing: '0.08em',
                    background: 'rgba(255,255,255,0.8)',
                  }}
                >
                  {chip}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              width: '32%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 18,
            }}
          >
            {[
              'Phones',
              'Chargers',
              'Earbuds',
              'Protectors',
            ].map((item, index) => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '22px 24px',
                  borderRadius: 28,
                  border: '1px solid rgba(17,17,17,0.08)',
                  background: index === 0 ? '#111111' : 'rgba(255,255,255,0.7)',
                  color: index === 0 ? '#ffffff' : '#111111',
                }}
              >
                <div
                  style={{
                    fontFamily: 'NType82Headline',
                    fontSize: 36,
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                  }}
                >
                  {item}
                </div>
                <div
                  style={{
                    fontFamily: 'NType82',
                    fontSize: 20,
                    lineHeight: 1,
                    opacity: 0.72,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                  }}
                >
                  PK
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              position: 'absolute',
              left: 64,
              right: 64,
              bottom: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'NType82',
              fontSize: 20,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(17,17,17,0.72)',
            }}
          >
            <span>Nothing Pakistan</span>
            <span>Phones, chargers, CMF accessories in Pakistan</span>
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: 'NType82', data: bodyFont, style: 'normal', weight: 400 },
        { name: 'NType82Headline', data: headlineFont, style: 'normal', weight: 400 },
      ],
    },
  )
}
