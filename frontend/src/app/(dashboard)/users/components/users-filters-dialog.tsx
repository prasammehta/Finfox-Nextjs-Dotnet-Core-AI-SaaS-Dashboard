"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Sliders } from "lucide-react"

interface UsersFiltersDialogProps {
  emailFilter: string
  setEmailFilter?: (value: string) => void
  startDate: string
  setStartDate?: (value: string) => void
  endDate: string
  setEndDate?: (value: string) => void
  onClear: () => void
}

export function UsersFiltersDialog({
  emailFilter,
  setEmailFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onClear,
}: UsersFiltersDialogProps) {
  const [open, setOpen] = useState(false)
  const [localEmailFilter, setLocalEmailFilter] = useState(emailFilter)
  const [localStartDate, setLocalStartDate] = useState(startDate)
  const [localEndDate, setLocalEndDate] = useState(endDate)

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setLocalEmailFilter(emailFilter)
      setLocalStartDate(startDate)
      setLocalEndDate(endDate)
    }
    setOpen(newOpen)
  }

  const handleApply = () => {
    setEmailFilter?.(localEmailFilter)
    setStartDate?.(localStartDate)
    setEndDate?.(localEndDate)
    setOpen(false)
  }

  const handleClear = () => {
    setLocalEmailFilter("")
    setLocalStartDate("")
    setLocalEndDate("")
    onClear()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer">
          <Sliders className="mr-2 size-4" />
          More Filters
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Filter Users</DialogTitle>
          <DialogDescription>
            Apply advanced filters to narrow down your users
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Email Filter */}
          <div className="grid gap-2">
            <Label htmlFor="email-filter">Email</Label>
            <Input
              id="email-filter"
              type="email"
              placeholder="Search by email..."
              value={localEmailFilter}
              onChange={(e) => setLocalEmailFilter(e.target.value)}
            />
          </div>

          {/* Date Range */}
          <div className="grid gap-2">
            <Label>Joined Date Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-date" className="text-sm">
                  From
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={localStartDate}
                  onChange={(e) => setLocalStartDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-date" className="text-sm">
                  To
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={localEndDate}
                  onChange={(e) => setLocalEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleClear}
            className="cursor-pointer"
          >
            Clear
          </Button>
          <Button
            onClick={handleApply}
            className="cursor-pointer"
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
