"use client"

import { useState, useMemo, useEffect } from "react"
import { CalendarSidebar } from "./calendar-sidebar"
import { CalendarMain } from "./calendar-main"
import { EventForm } from "./event-form"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { type CalendarEvent } from "@/hooks/api/useCalendarEvents"
import { useCalendar } from "../use-calendar"

interface CalendarProps {
  events: CalendarEvent[]
  eventDates: Array<{ date: Date; count: number }>
  loading?: boolean
  currentDate?: Date
  onCurrentDateChange?: (date: Date) => void
}

export function Calendar({
  events,
  eventDates,
  loading = false,
  currentDate: externalDate,
  onCurrentDateChange
}: CalendarProps) {
  const calendar = useCalendar(events)
  const [visibleCalendars, setVisibleCalendars] = useState({
    transactions: true,
    "recurring-transactions": true
  })

  // Use external date if provided, falling back to internal calendar state
  const effectiveCurrentDate = externalDate || calendar.currentDate
  const handleCurrentDateChange = (date: Date) => {
    // If we have an external handler, call it (state will flow back via props)
    // We also update internal state just in case, but prioritize external
    if (onCurrentDateChange) {
      onCurrentDateChange(date)
    }
    calendar.setCurrentDate(date)
  }

  // Filter events based on visible calendars
  const filteredEvents = useMemo(() => {
    return calendar.events.filter(event => {
      // Check if event is from transactions (type: "event" or "task")
      if (event.type === "event" || event.type === "task") {
        return visibleCalendars.transactions
      }
      // Check if event is from recurring transactions (type: "reminder")
      else if (event.type === "reminder") {
        return visibleCalendars["recurring-transactions"]
      }
      // Include any other event types by default
      return true
    })
  }, [calendar.events, visibleCalendars])

  const handleCalendarToggle = (calendarId: string, visible: boolean) => {
    setVisibleCalendars(prev => ({
      ...prev,
      [calendarId]: visible
    }))
  }

  return (
    <>
      <div className="border rounded-lg bg-background relative">
        <div className="flex min-h-200">
          {/* Desktop Sidebar - Hidden on mobile/tablet, shown on extra large screens */}
          <div className="hidden xl:block w-80 shrink-0 border-r">
            <CalendarSidebar
              currentDate={effectiveCurrentDate}
              onCurrentDateChange={handleCurrentDateChange}
              selectedDate={calendar.selectedDate}
              onDateSelect={calendar.handleDateSelect}
              onNewCalendar={calendar.handleNewCalendar}
              events={eventDates}
              className="h-full"
              onCalendarToggle={handleCalendarToggle}
              visibleCalendars={visibleCalendars}
            />
          </div>

          {/* Main Calendar Panel */}
          <div className="flex-1 min-w-0">
            <CalendarMain
              currentDate={effectiveCurrentDate}
              onCurrentDateChange={handleCurrentDateChange}
              selectedDate={calendar.selectedDate}
              onDateSelect={calendar.handleDateSelect}
              onMenuClick={() => calendar.setShowCalendarSheet(true)}
              events={filteredEvents}
              onEventClick={calendar.handleEditEvent}
              loading={loading}
            />
          </div>
        </div>

        {/* Mobile/Tablet Sheet - Positioned relative to calendar container */}
        <Sheet open={calendar.showCalendarSheet} onOpenChange={calendar.setShowCalendarSheet}>
          <SheetContent side="left" className="w-80 p-0" style={{ position: 'absolute' }}>
            <SheetHeader className="p-4 pb-2">
              <SheetTitle>Calendar</SheetTitle>
              <SheetDescription>
                Browse dates and manage your calendar events
              </SheetDescription>
            </SheetHeader>
            <CalendarSidebar
              currentDate={effectiveCurrentDate}
              onCurrentDateChange={handleCurrentDateChange}
              selectedDate={calendar.selectedDate}
              onDateSelect={calendar.handleDateSelect}
              onNewCalendar={calendar.handleNewCalendar}
              events={eventDates}
              className="h-full"
              onCalendarToggle={handleCalendarToggle}
              visibleCalendars={visibleCalendars}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Event Form Dialog */}
      <EventForm
        event={calendar.editingEvent}
        open={calendar.showEventForm}
        onOpenChange={calendar.setShowEventForm}
        onSave={calendar.handleSaveEvent}
        onDelete={calendar.handleDeleteEvent}
      />
    </>
  )
}
