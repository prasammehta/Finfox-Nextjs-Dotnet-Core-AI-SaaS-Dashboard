"use client"

import { useState, useCallback, useEffect } from "react"
import { type CalendarEvent } from "@/hooks/api/useCalendarEvents"

export interface UseCalendarReturn {
  selectedDate: Date
  showEventForm: boolean
  editingEvent: CalendarEvent | null
  showCalendarSheet: boolean
  events: CalendarEvent[]
  setSelectedDate: (date: Date) => void
  setShowEventForm: (open: boolean) => void
  setEditingEvent: (event: CalendarEvent | null) => void
  setShowCalendarSheet: (open: boolean) => void
  handleDateSelect: (date: Date) => void
  handleNewEvent: () => void
  handleNewCalendar: () => void
  handleSaveEvent: (eventData: Partial<CalendarEvent>) => void
  handleDeleteEvent: (eventId: string | number) => void
  handleEditEvent: (event: CalendarEvent) => void
}

export function useCalendar(initialEvents: CalendarEvent[] = []): UseCalendarReturn {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [showCalendarSheet, setShowCalendarSheet] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)

  // Update events when initialEvents changes
  useEffect(() => {
    setEvents(initialEvents)
  }, [initialEvents])

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date)
    // Auto-close mobile sheet when date is selected
    setShowCalendarSheet(false)
  }, [])

  const handleNewEvent = useCallback(() => {
    setEditingEvent(null)
    setShowEventForm(true)
  }, [])

  const handleNewCalendar = useCallback(() => {
    console.log("Creating new calendar")
    // In a real app, this would open a new calendar form
  }, [])

  const handleSaveEvent = useCallback((eventData: Partial<CalendarEvent>) => {
    console.log("Saving event:", eventData)
    // In a real app, this would save to a backend
    setShowEventForm(false)
    setEditingEvent(null)
  }, [])

  const handleDeleteEvent = useCallback((eventId: string | number) => {
    console.log("Deleting event:", eventId)
    // In a real app, this would delete from backend
    setShowEventForm(false)
    setEditingEvent(null)
  }, [])

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    setEditingEvent(event)
    setShowEventForm(true)
  }, [])

  return {
    // State
    selectedDate,
    showEventForm,
    editingEvent,
    showCalendarSheet,
    events,
    // Setters
    setSelectedDate,
    setShowEventForm,
    setEditingEvent,
    setShowCalendarSheet,
    // Actions
    handleDateSelect,
    handleNewEvent,
    handleNewCalendar,
    handleSaveEvent,
    handleDeleteEvent,
    handleEditEvent,
  }
}
