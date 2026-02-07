"use client"

import { useState, useMemo } from "react"
import { Calendar } from "./components/calendar"
import { useCalendarEvents } from "@/hooks/api/useCalendarEvents"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Calculate the visible range for the calendar grid
  const range = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    return { startDate, endDate }
  }, [currentDate])

  const { events, eventDates, loading, error } = useCalendarEvents(range)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-600 text-lg">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6">
      <Calendar
        events={events}
        eventDates={eventDates}
        loading={loading}
        currentDate={currentDate}
        onCurrentDateChange={setCurrentDate}
      />
    </div>
  )
}
