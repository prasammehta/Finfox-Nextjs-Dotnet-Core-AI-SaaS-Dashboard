"use client"

import { useState, useMemo } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  MoreHorizontal,
  Search,
  Grid3X3,
  List,
  ChevronDown,
  Menu
} from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { type CalendarEvent } from "@/hooks/api/useCalendarEvents"
import { Skeleton } from "@/components/ui/skeleton"

interface CalendarMainProps {
  currentDate: Date
  onCurrentDateChange: (date: Date) => void
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  onMenuClick?: () => void
  events?: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  loading?: boolean
}

export function CalendarMain({
  currentDate,
  onCurrentDateChange,
  selectedDate,
  onDateSelect,
  onMenuClick,
  events,
  onEventClick,
  loading = false
}: CalendarMainProps) {
  // Use real events data, fallback to empty array
  const [searchQuery, setSearchQuery] = useState("")

  const allEvents = useMemo(() => {
    const baseEvents = events || []
    if (!searchQuery.trim()) return baseEvents

    const query = searchQuery.toLowerCase()
    return baseEvents.filter(event =>
      event.title.toLowerCase().includes(query) ||
      (event.description && event.description.toLowerCase().includes(query))
    )
  }, [events, searchQuery])

  const [viewMode, setViewMode] = useState<"month" | "week" | "day" | "list">("month")
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showDayEventsDialog, setShowDayEventsDialog] = useState(false)
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([])
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null)

  const { monthStart, monthEnd, calendarStart, calendarEnd, calendarDays } = useMemo(() => {
    const mStart = startOfMonth(currentDate)
    const mEnd = endOfMonth(currentDate)

    const cStart = new Date(mStart)
    cStart.setDate(cStart.getDate() - mStart.getDay())

    const cEnd = new Date(mEnd)
    cEnd.setDate(cEnd.getDate() + (6 - mEnd.getDay()))

    const cDays = eachDayOfInterval({ start: cStart, end: cEnd })

    return {
      monthStart: mStart,
      monthEnd: mEnd,
      calendarStart: cStart,
      calendarEnd: cEnd,
      calendarDays: cDays
    }
  }, [currentDate])

  // Group events by date string for O(1) lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    allEvents.forEach(event => {
      const dateKey = format(new Date(event.date), 'yyyy-MM-dd')
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(event)
    })
    return map
  }, [allEvents])

  const navigateMonth = (direction: "prev" | "next") => {
    onCurrentDateChange(direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
  }

  const goToToday = () => {
    onCurrentDateChange(new Date())
  }

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event)
    } else {
      setSelectedEvent(event)
      setShowEventDialog(true)
    }
  }

  const renderCalendarGrid = () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
      <div className="flex-1 bg-background">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 border-b">
          {weekDays.map(day => (
            <div key={day} className="p-4 text-center font-medium text-sm text-muted-foreground border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="grid grid-cols-7 flex-1">
          {calendarDays.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const dayEvents = eventsByDate.get(dateKey) || []
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isDayToday = isToday(day)
            const isSelected = selectedDate && isSameDay(day, selectedDate)

            return (
              <div
                key={day.getTime()}
                className={cn(
                  "min-h-30 border-r border-b last:border-r-0 p-2 cursor-pointer transition-colors",
                  isCurrentMonth ? "bg-background hover:bg-accent/50" : "bg-muted/30 text-muted-foreground",
                  isDayToday && "bg-blue-50 dark:bg-blue-950/20",
                  isSelected && "bg-blue-100 dark:bg-blue-900/30"
                )}
                onClick={() => {
                  onDateSelect?.(day)
                  setSelectedDayDate(day)
                  setSelectedDayEvents(dayEvents)
                  setShowDayEventsDialog(true)
                }}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isDayToday && "text-blue-600 dark:text-blue-400",
                  !isCurrentMonth && "text-muted-foreground"
                )}>
                  {day.getDate()}
                </div>

                {/* Events Display */}
                <div className="space-y-1 max-h-[80px] overflow-y-auto">
                  {dayEvents.length > 0 ? (
                    <>
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={`${event.id}-${event.date.getTime()}`}
                          className={cn(
                            "text-xs p-1 rounded-sm text-white cursor-pointer truncate",
                            event.color || "bg-blue-500"
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEventClick(event)
                          }}
                          title={event.title}
                        >
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{event.title}</span>
                          </div>
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div
                          className="text-xs text-muted-foreground px-2 font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedDayEvents(dayEvents)
                            setShowDayEventsDialog(true)
                          }}
                        >
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const upcomingEvents = useMemo(() => {
    return allEvents
      .filter(event => event.date >= new Date())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [allEvents])

  const renderListView = () => {
    return (
      <div className="flex-1 p-6">
        <div className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No upcoming transactions
            </div>
          ) : (
            upcomingEvents.map((event) => (
              <Card
                key={`${event.id}-${event.date.getTime()}`}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleEventClick(event)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <h3 className="font-semibold">{event.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {format(new Date(event.date), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {event.time}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </div>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      )}
                    </div>
                    <Badge className={cn("text-white", event.color || "bg-blue-500")}>
                      {event.type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col flex-wrap gap-4 p-6 border-b md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="sm"
            className="xl:hidden cursor-pointer"
            onClick={onMenuClick}
          >
            <Menu className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")} className="cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")} className="cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday} className="cursor-pointer">
              Today
            </Button>
          </div>

          <h1 className="text-2xl font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h1>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-10 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* View Mode Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="cursor-pointer">
                {viewMode === "month" && <Grid3X3 className="w-4 h-4 mr-2" />}
                {viewMode === "list" && <List className="w-4 h-4 mr-2" />}
                {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setViewMode("month")} className="cursor-pointer">
                <Grid3X3 className="w-4 h-4 mr-2" />
                Month
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode("list")} className="cursor-pointer">
                <List className="w-4 h-4 mr-2" />
                List
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Calendar Content */}
      {loading ? (
        <div className="flex-1 p-6">
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        viewMode === "month" ? renderCalendarGrid() : renderListView()
      )}

      {/* Event Detail Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title || "Transaction Details"}</DialogTitle>
            <DialogDescription>
              View and manage this transaction
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <span>{format(new Date(selectedEvent.date), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{selectedEvent.time} ({selectedEvent.duration})</span>
              </div>
              {selectedEvent.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
              {selectedEvent.description && (
                <div className="text-sm text-muted-foreground">
                  {selectedEvent.description}
                </div>
              )}
              <Badge className={cn("text-white", selectedEvent.color || "bg-blue-500")}>
                {selectedEvent.type}
              </Badge>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Day Events Dialog - Shows all events for a selected day */}
      <Dialog open={showDayEventsDialog} onOpenChange={setShowDayEventsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDayDate
                ? format(selectedDayDate, 'EEEE, MMMM d, yyyy')
                : 'Events'}
            </DialogTitle>
            <DialogDescription>
              {selectedDayEvents.length === 0
                ? "There is no transaction occurred or scheduled today"
                : `${selectedDayEvents.length} transaction${selectedDayEvents.length !== 1 ? 's' : ''} on this day`}
            </DialogDescription>
          </DialogHeader>
          {selectedDayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground">
                No transactions scheduled for this day
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayEvents.map((event) => (
                <Card
                  key={`${event.id}-${event.date.getTime()}`}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => {
                    handleEventClick(event)
                    setShowDayEventsDialog(false)
                  }}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{event.title}</h3>
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span>{event.time} ({event.duration})</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-2">{event.description}</p>
                        )}
                      </div>
                      <Badge className={cn("text-white shrink-0", event.color || "bg-blue-500")}>
                        {event.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
