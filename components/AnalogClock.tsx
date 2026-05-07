'use client'

import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'

type ClockAngles = {
  hour: number
  minute: number
  second: number
}

const INITIAL_ANGLES: ClockAngles = {
  hour: 0,
  minute: 0,
  second: 0,
}

function getPakistanTimeParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(date)

  const getPartValue = (type: 'hour' | 'minute' | 'second') =>
    Number(parts.find((part) => part.type === type)?.value ?? '0')

  return {
    hour: getPartValue('hour'),
    minute: getPartValue('minute'),
    second: getPartValue('second'),
  }
}

function getClockAngles(date: Date): ClockAngles {
  const { hour, minute, second } = getPakistanTimeParts(date)
  const seconds = second
  const minutes = minute
  const hours = hour % 12

  return {
    hour: hours * 30 + minutes * 0.5,
    minute: minutes * 6 + seconds * 0.1,
    second: seconds * 6,
  }
}

export function AnalogClock({ compact = false }: { compact?: boolean }) {
  const [angles, setAngles] = useState<ClockAngles>(INITIAL_ANGLES)
  const ticks = useMemo(() => Array.from({ length: 60 }, (_, index) => index), [])

  useEffect(() => {
    setAngles(getClockAngles(new Date()))

    const interval = window.setInterval(() => {
      setAngles(getClockAngles(new Date()))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="analogClock" aria-label="Current analog time">
      <div className="clockFace">
        {ticks.map((tick) => (
          <span
            key={tick}
            className={`tick ${tick % 5 === 0 ? 'hourTick' : 'minuteTick'}`}
            style={{ '--tick-angle': `${tick * 6}deg` } as CSSProperties}
          />
        ))}

        <span className="hand hourHand" style={{ transform: `translateX(-50%) rotate(${angles.hour}deg)` }} />
        <span className="hand minuteHand" style={{ transform: `translateX(-50%) rotate(${angles.minute}deg)` }} />
        <span className="hand secondHand" style={{ transform: `translateX(-50%) rotate(${angles.second}deg)` }}>
          <span className="secondTip" />
        </span>
        <span className="centerPin" />
      </div>

      <style jsx>{`
        .analogClock {
          display: flex;
          align-items: center;
          justify-content: center;
          --clock-size: ${compact ? 'clamp(52px, 9vw, 72px)' : 'clamp(58px, 5.2vw, 76px)'};
          width: var(--clock-size);
          aspect-ratio: 1;
        }

        .clockFace {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 999px;
          background: #ffffff;
          box-shadow: 0 10px 24px rgba(17, 17, 17, 0.045);
        }

        .tick {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 2px;
          border-radius: 999px;
          background: #050505;
          transform-origin: 50% 50%;
          transform: translate(-50%, -50%) rotate(var(--tick-angle)) translateY(calc(var(--clock-size) * -0.425));
        }

        .minuteTick {
          height: calc(var(--clock-size) * 0.045);
        }

        .hourTick {
          width: 2px;
          height: calc(var(--clock-size) * 0.07);
        }

        .hand {
          position: absolute;
          left: 50%;
          bottom: 50%;
          border-radius: 999px;
          transform-origin: 50% 100%;
          will-change: transform;
        }

        .hourHand {
          width: 4px;
          height: calc(var(--clock-size) * 0.27);
          background: #050505;
        }

        .minuteHand {
          width: 3px;
          height: calc(var(--clock-size) * 0.35);
          background: #050505;
        }

        .secondHand {
          width: 2px;
          height: calc(var(--clock-size) * 0.4);
          background: #d5122f;
        }

        .secondTip {
          position: absolute;
          left: 50%;
          top: -3px;
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #d5122f;
          transform: translateX(-50%);
        }

        .centerPin {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 9px;
          height: 9px;
          border: 2px solid #050505;
          border-radius: 999px;
          background: #d5122f;
          transform: translate(-50%, -50%);
          z-index: 5;
        }

      `}</style>
    </div>
  )
}
