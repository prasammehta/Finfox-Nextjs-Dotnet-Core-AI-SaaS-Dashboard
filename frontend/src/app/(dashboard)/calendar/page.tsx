"use client"

import { Calendar } from "./components/calendar"
import { useCalendarEvents } from "@/hooks/api/useCalendarEvents"

export default function CalendarPage() {
  const { events, eventDates, loading, error } = useCalendarEvents()

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-600 text-lg">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6">
      <Calendar events={events} eventDates={eventDates} loading={loading} />
    </div>
  )
}
