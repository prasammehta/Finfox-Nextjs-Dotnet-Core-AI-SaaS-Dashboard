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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Sliders } from "lucide-react"

interface DebtsFiltersDialogProps {
  amountGreaterThan: string
  setAmountGreaterThan?: (value: string) => void
  amountLessThan: string
  setAmountLessThan?: (value: string) => void
  startDate: string
  setStartDate?: (value: string) => void
  endDate: string
  setEndDate?: (value: string) => void
  onClear: () => void
}

export function DebtsFiltersDialog({
  amountGreaterThan,
  setAmountGreaterThan,
  amountLessThan,
  setAmountLessThan,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onClear,
}: DebtsFiltersDialogProps) {
  const [open, setOpen] = useState(false)
  const [localAmountGreaterThan, setLocalAmountGreaterThan] = useState(amountGreaterThan)
  const [localAmountLessThan, setLocalAmountLessThan] = useState(amountLessThan)
  const [localStartDate, setLocalStartDate] = useState(startDate)
  const [localEndDate, setLocalEndDate] = useState(endDate)

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setLocalAmountGreaterThan(amountGreaterThan)
      setLocalAmountLessThan(amountLessThan)
      setLocalStartDate(startDate)
      setLocalEndDate(endDate)
    }
    setOpen(newOpen)
  }

  const handleApply = () => {
    setAmountGreaterThan?.(localAmountGreaterThan)
    setAmountLessThan?.(localAmountLessThan)
    setStartDate?.(localStartDate)
    setEndDate?.(localEndDate)
    setOpen(false)
  }

  const handleClear = () => {
    setLocalAmountGreaterThan("")
    setLocalAmountLessThan("")
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
          <DialogTitle className="text-2xl">Filter Debts</DialogTitle>
          <DialogDescription>
            Apply advanced filters to narrow down your debts
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Amount Range */}
          <div className="grid gap-2">
            <Label>Amount Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount-greater" className="text-sm">
                  Greater Than (₹)
                </Label>
                <Input
                  id="amount-greater"
                  type="number"
                  placeholder="Min amount"
                  value={localAmountGreaterThan}
                  onChange={(e) => setLocalAmountGreaterThan(e.target.value)}
                  step="0.01"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount-less" className="text-sm">
                  Less Than (₹)
                </Label>
                <Input
                  id="amount-less"
                  type="number"
                  placeholder="Max amount"
                  value={localAmountLessThan}
                  onChange={(e) => setLocalAmountLessThan(e.target.value)}
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid gap-2">
            <Label>Date Range</Label>
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
