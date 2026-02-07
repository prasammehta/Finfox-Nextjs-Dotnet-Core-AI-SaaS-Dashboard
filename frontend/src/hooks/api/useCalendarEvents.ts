"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTransactions } from "./useTransactions"
import { useRecurringTransactions } from "./useRecurringTransactions"

export interface CalendarEvent {
  id: string | number
  title: string
  date: Date
  time: string
  duration: string
  type: "meeting" | "event" | "personal" | "task" | "reminder"
  attendees: string[]
  location: string
  color: string
  description?: string
}

interface UseCalendarEventsReturn {
  events: CalendarEvent[]
  eventDates: Array<{ date: Date; count: number }>
  loading: boolean
  error: string | null
}

function generateRecurringTransactionDates(
  recurringTransaction: any,
  startDateRange?: Date,
  endDateRange?: Date
): Date[] {
  const dates: Date[] = []
  const today = new Date()
  const startDate = new Date(recurringTransaction.startDate)
  const endDate = recurringTransaction.endDate ? new Date(recurringTransaction.endDate) : null

  const currentDate = new Date(startDate)
  const maxDate = endDateRange || new Date(today.getFullYear(), today.getMonth() + 12, 0)
  const minDate = startDateRange || startDate

  while (currentDate <= maxDate && (!endDate || currentDate <= endDate)) {
    if (currentDate >= minDate && currentDate >= startDate) {
      dates.push(new Date(currentDate))
    }

    // Increment based on frequency
    switch (recurringTransaction.frequency) {
      case "DAILY":
        currentDate.setDate(currentDate.getDate() + 1)
        break
      case "WEEKLY":
        currentDate.setDate(currentDate.getDate() + 7)
        break
      case "MONTHLY":
        currentDate.setMonth(currentDate.getMonth() + 1)
        break
      case "YEARLY":
        currentDate.setFullYear(currentDate.getFullYear() + 1)
        break
      default:
        currentDate.setMonth(currentDate.getMonth() + 1)
        break
    }

    // Safety break for invalid frequencies or infinite loops
    if (dates.length > 1000) break
  }

  return dates
}

function convertTransactionToCalendarEvent(transaction: any): CalendarEvent {
  // Use transaction date instead of createdAt for the calendar
  // If it's a date-only string like "YYYY-MM-DD", parse it correctly
  const date = new Date(transaction.date || transaction.createdAt)

  return {
    id: transaction.transactionId,
    title: transaction.description || `${transaction.type} - ₹${transaction.amount}`,
    date: date,
    time: `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`,
    duration: "30 mins",
    type: transaction.type?.toLowerCase() === "income" ? "event" : "task",
    attendees: [],
    location: "",
    color: transaction.type?.toLowerCase() === "income" ? "bg-green-500" : "bg-red-500",
    description: `${transaction.category} - ₹${transaction.amount}`,
  }
}

function convertRecurringTransactionToCalendarEvent(
  recurringTransaction: any,
  occurrenceDate: Date
): CalendarEvent {
  return {
    id: `recurring-${recurringTransaction.recurringTransactionId}-${occurrenceDate.getTime()}`,
    title: recurringTransaction.description || `${recurringTransaction.type} - ₹${recurringTransaction.amount}`,
    date: occurrenceDate,
    time: "00:00",
    duration: "1 day",
    type: "reminder",
    attendees: [],
    location: "",
    color: recurringTransaction.type?.toLowerCase() === "income" ? "bg-green-500" : "bg-blue-500",
    description: `[Recurring] ${recurringTransaction.category} - ₹${recurringTransaction.amount}`,
  }
}

export function useCalendarEvents(
  range?: { startDate?: Date; endDate?: Date }
): UseCalendarEventsReturn {
  const {
    data: transactions,
    loading: transactionsLoading,
    error: transactionsError,
    setFilters: setTransactionFilters
  } = useTransactions(
    range ? {
      startDate: range.startDate?.toLocaleDateString('en-CA'),
      endDate: range.endDate?.toLocaleDateString('en-CA')
    } : undefined,
    1000 // Calendar needs more data
  )

  const {
    data: recurringTransactions,
    loading: recurringLoading,
    error: recurringError,
    setFilters: setRecurringFilters
  } = useRecurringTransactions(
    undefined, // We filter recurring transactions differently (generate occurrences)
    1000
  )

  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [eventDates, setEventDates] = useState<Array<{ date: Date; count: number }>>([])

  // Update filters when range changes
  useEffect(() => {
    if (range) {
      setTransactionFilters({
        startDate: range.startDate?.toLocaleDateString('en-CA'),
        endDate: range.endDate?.toLocaleDateString('en-CA')
      })
    }
  }, [range, setTransactionFilters])

  useEffect(() => {
    if (transactionsLoading || recurringLoading) return

    try {
      const allEvents: CalendarEvent[] = []
      const dateMap = new Map<string, number>()

      // Add transaction events
      if (Array.isArray(transactions)) {
        transactions.forEach((transaction) => {
          const event = convertTransactionToCalendarEvent(transaction)
          allEvents.push(event)

          // Track event dates
          const dateKey = event.date.toDateString()
          dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1)
        })
      }

      // Add recurring transaction occurrences
      if (Array.isArray(recurringTransactions)) {
        recurringTransactions.forEach((recurringTransaction) => {
          const occurrenceDates = generateRecurringTransactionDates(
            recurringTransaction,
            range?.startDate,
            range?.endDate
          )
          occurrenceDates.forEach((date) => {
            const event = convertRecurringTransactionToCalendarEvent(recurringTransaction, date)
            allEvents.push(event)

            // Track event dates
            const dateKey = date.toDateString()
            dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1)
          })
        })
      }

      setEvents(allEvents)

      // Convert date map to array format
      const eventDatesArray = Array.from(dateMap).map(([dateStr, count]) => ({
        date: new Date(dateStr),
        count,
      }))

      setEventDates(eventDatesArray)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process calendar events"
      console.error(errorMessage, err)
      toast.error(errorMessage)
    }
  }, [transactions, recurringTransactions, transactionsLoading, recurringLoading, range?.startDate, range?.endDate])

  return {
    events,
    eventDates,
    loading: transactionsLoading || recurringLoading,
    error: transactionsError || recurringError,
  }
}
