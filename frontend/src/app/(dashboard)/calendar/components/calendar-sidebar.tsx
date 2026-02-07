"use client"

import { Plus } from "lucide-react"

import { Calendars } from "./calendars"
import { DatePicker } from "./date-picker"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface CalendarSidebarProps {
  currentDate?: Date
  onCurrentDateChange?: (date: Date) => void
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  onNewCalendar?: () => void
  events?: Array<{ date: Date; count: number }>
  className?: string
  onCalendarToggle?: (calendarId: string, visible: boolean) => void
  visibleCalendars?: Record<string, boolean>
}

export function CalendarSidebar({
  currentDate,
  onCurrentDateChange,
  selectedDate,
  onDateSelect,
  onNewCalendar,
  events = [],
  className,
  onCalendarToggle,
  visibleCalendars
}: CalendarSidebarProps) {
  return (
    <div className={`flex flex-col h-full bg-background rounded-lg ${className}`}>
      {/* Date Picker */}
      <DatePicker
        currentDate={currentDate}
        onMonthChange={onCurrentDateChange}
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
        events={events}
      />

      <Separator />

      {/* Calendars */}
      <div className="flex-1 p-4">
        <Calendars
          onNewCalendar={onNewCalendar}
          onCalendarToggle={onCalendarToggle}
          visibleCalendars={visibleCalendars}
          onCalendarEdit={(calendarId) => {
            console.log(`Edit calendar: ${calendarId}`)
          }}
          onCalendarDelete={(calendarId) => {
            console.log(`Delete calendar: ${calendarId}`)
          }}
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full justify-start cursor-pointer"
          onClick={onNewCalendar}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Calendar
        </Button>
      </div>
    </div>
  )
}
