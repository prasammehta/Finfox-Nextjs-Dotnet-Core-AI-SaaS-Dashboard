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

interface AccountsFiltersDialogProps {
  startDate: string
  setStartDate?: (value: string) => void
  endDate: string
  setEndDate?: (value: string) => void
  onClear: () => void
}

export function AccountsFiltersDialog({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onClear,
}: AccountsFiltersDialogProps) {
  const [open, setOpen] = useState(false)
  const [localStartDate, setLocalStartDate] = useState(startDate)
  const [localEndDate, setLocalEndDate] = useState(endDate)

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setLocalStartDate(startDate)
      setLocalEndDate(endDate)
    }
    setOpen(newOpen)
  }

  const handleApply = () => {
    setStartDate?.(localStartDate)
    setEndDate?.(localEndDate)
    setOpen(false)
  }

  const handleClear = () => {
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
          <DialogTitle className="text-2xl">Filter Accounts</DialogTitle>
          <DialogDescription>
            Apply advanced filters to narrow down your accounts
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Date Range */}
          <div className="grid gap-2">
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-date" className="text-sm text-muted-foreground">
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={localStartDate}
                  onChange={(e) => setLocalStartDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-date" className="text-sm text-muted-foreground">
                  End Date
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

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClear} className="cursor-pointer">
            Clear Filters
          </Button>
          <Button onClick={handleApply} className="cursor-pointer">
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
