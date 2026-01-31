"use client"

import { useState } from "react"
import { Check, ChevronRight, Plus, Eye, EyeOff, MoreHorizontal } from "lucide-react"
import { type CalendarItem, type CalendarGroup } from "@/types/schema"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface CalendarsProps {
  calendars?: {
    name: string
    items: string[]
  }[]
  onCalendarToggle?: (calendarId: string, visible: boolean) => void
  onCalendarEdit?: (calendarId: string) => void
  onCalendarDelete?: (calendarId: string) => void
  onNewCalendar?: () => void
  visibleCalendars?: Record<string, boolean>
}

// Enhanced calendar data with colors and visibility
const enhancedCalendars: CalendarGroup[] = [
  {
    name: "Financial Calendars",
    items: [
      { id: "transactions", name: "Transactions", color: "bg-blue-500", visible: true, type: "personal" },
      { id: "recurring-transactions", name: "Recurring Transactions", color: "bg-green-500", visible: true, type: "work" }
    ]
  }
]

export function Calendars({
  onCalendarToggle,
  onCalendarEdit,
  onCalendarDelete,
  onNewCalendar,
  visibleCalendars
}: CalendarsProps) {
  const [calendarData, setCalendarData] = useState(enhancedCalendars)

  const handleToggleVisibility = (calendarId: string) => {
    const currentVisible = visibleCalendars?.[calendarId] ?? 
      calendarData.flatMap(g => g.items).find(c => c.id === calendarId)?.visible ?? false
    
    const newVisibleState = !currentVisible

    setCalendarData(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === calendarId 
          ? { ...item, visible: newVisibleState }
          : item
      )
    })))
    
    // Pass the new state to parent
    onCalendarToggle?.(calendarId, newVisibleState)
  }

  return (
    <div className="space-y-4">
      {calendarData.map((calendar, index) => (
        <div key={calendar.name}>
          <Collapsible
            defaultOpen={index === 0}
            className="group/collapsible"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer">
              <span className="text-sm font-medium">{calendar.name}</span>
              <div className="flex items-center gap-1">
                {index === 0 && (
                  <div
                    className="h-5 w-5 flex items-center justify-center opacity-0 group-hover/collapsible:opacity-100 cursor-pointer hover:bg-accent rounded-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onNewCalendar?.()
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </div>
                )}
                <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="mt-2 space-y-1">
                {calendar.items.map((item) => {
                  const isVisible = visibleCalendars?.[item.id] ?? item.visible
                  return (
                  <div key={item.id} className="group/calendar-item">
                    <div className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-md">
                      <div className="flex items-center gap-3 flex-1">
                        {/* Calendar Color & Visibility Toggle */}
                        <button
                          onClick={() => handleToggleVisibility(item.id)}
                          className={cn(
                            "flex aspect-square size-4 shrink-0 items-center justify-center rounded-sm border transition-all cursor-pointer",
                            isVisible 
                              ? cn("border-transparent text-white", item.color)
                              : "border-border bg-transparent"
                          )}
                        >
                          {isVisible && <Check className="size-3" />}
                        </button>

                        {/* Calendar Name */}
                        <span 
                          className={cn(
                            "flex-1 truncate text-sm cursor-pointer",
                            !isVisible && "text-muted-foreground"
                          )}
                          onClick={() => handleToggleVisibility(item.id)}
                        >
                          {item.name}
                        </span>

                        {/* Visibility Icon */}
                        <div className="opacity-0 group-hover/calendar-item:opacity-100">
                          {isVisible ? (
                            <Eye className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <EyeOff className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>

                        {/* More Options */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div
                              className="h-5 w-5 flex items-center justify-center p-0 opacity-0 group-hover/calendar-item:opacity-100 cursor-pointer hover:bg-accent rounded-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" side="right">
                            <DropdownMenuItem 
                              onClick={() => onCalendarEdit?.(item.id)}
                              className="cursor-pointer"
                            >
                              Edit calendar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleVisibility(item.id)}
                              className="cursor-pointer"
                            >
                              {isVisible ? "Hide" : "Show"} calendar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onCalendarDelete?.(item.id)}
                              className="cursor-pointer text-destructive"
                            >
                              Delete calendar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      ))}
    </div>
  )
}
