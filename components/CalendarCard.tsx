'use client'

import { useEffect, useState } from 'react'

type CalendarParts = {
  weekday: string
  day: string
}

const INITIAL_CALENDAR_PARTS: CalendarParts = {
  weekday: '---',
  day: '--',
}

function getCalendarParts(date: Date): CalendarParts {
  return {
    weekday: new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Karachi',
      weekday: 'short',
    }).format(date),
    day: new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Karachi',
      day: 'numeric',
    }).format(date),
  }
}

export function CalendarCard({ compact = false }: { compact?: boolean }) {
  const [calendarParts, setCalendarParts] = useState<CalendarParts>(INITIAL_CALENDAR_PARTS)

  useEffect(() => {
    const updateCalendar = () => setCalendarParts(getCalendarParts(new Date()))

    updateCalendar()
    const interval = window.setInterval(updateCalendar, 60_000)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="calendarCard" aria-label="Current date">
      <span className="statusDot" aria-hidden="true" />
      <span className="weekday">{calendarParts.weekday}</span>
      <span className="day">{calendarParts.day}</span>

      <style jsx>{`
        .calendarCard {
          position: relative;
          display: flex;
          --card-size: ${compact ? 'clamp(52px, 9vw, 72px)' : 'clamp(58px, 5.2vw, 76px)'};
          width: var(--card-size);
          aspect-ratio: 1;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 10px 24px rgba(17, 17, 17, 0.045);
        }

        .statusDot {
          position: absolute;
          left: 7px;
          top: 7px;
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: #d5122f;
        }

        .weekday {
          position: absolute;
          right: 8px;
          top: 7px;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: ${compact ? '9px' : '10px'};
          line-height: 1;
          color: #d5122f;
        }

        .day {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: ${compact ? 'clamp(2rem, 6vw, 2.7rem)' : 'clamp(2.45rem, 4vw, 3.3rem)'};
          line-height: 0.86;
          color: #050505;
          transform: translateY(3px);
        }
      `}</style>
    </div>
  )
}
