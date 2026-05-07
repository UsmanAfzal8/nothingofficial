'use client'

import { AnalogClock } from '@/components/AnalogClock'
// import { CalendarCard } from '@/components/CalendarCard'

export function HomeTimeCalendarWidget() {
  return (
    <div className="mx-auto mt-9 flex max-w-[520px] flex-col items-center justify-center gap-5 sm:flex-row sm:gap-6">
      <AnalogClock />
      {/* <CalendarCard /> */}
    </div>
  )
}
