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

interface BillsFiltersDialogProps {
  amountGreaterThan: string
  setAmountGreaterThan?: (value: string) => void
  amountLessThan: string
  setAmountLessThan?: (value: string) => void
  dueDate: string
  setDueDate?: (value: string) => void
  onClear: () => void
}

export function BillsFiltersDialog({
  amountGreaterThan,
  setAmountGreaterThan,
  amountLessThan,
  setAmountLessThan,
  dueDate,
  setDueDate,
  onClear,
}: BillsFiltersDialogProps) {
  const [open, setOpen] = useState(false)
  const [localAmountGreaterThan, setLocalAmountGreaterThan] = useState(amountGreaterThan)
  const [localAmountLessThan, setLocalAmountLessThan] = useState(amountLessThan)
  const [localDueDate, setLocalDueDate] = useState(dueDate)

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setLocalAmountGreaterThan(amountGreaterThan)
      setLocalAmountLessThan(amountLessThan)
      setLocalDueDate(dueDate)
    }
    setOpen(newOpen)
  }

  const handleApply = () => {
    setAmountGreaterThan?.(localAmountGreaterThan)
    setAmountLessThan?.(localAmountLessThan)
    setDueDate?.(localDueDate)
    setOpen(false)
  }

  const handleClear = () => {
    setLocalAmountGreaterThan("")
    setLocalAmountLessThan("")
    setLocalDueDate("")
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
          <DialogTitle className="text-2xl">Filter Bills</DialogTitle>
          <DialogDescription>
            Apply advanced filters to narrow down your bills
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Amount Range */}
          <div className="grid gap-2">
            <Label>Amount Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount-greater" className="text-sm text-muted-foreground">
                  Amount Greater Than
                </Label>
                <Input
                  id="amount-greater"
                  type="number"
                  placeholder="0.00"
                  value={localAmountGreaterThan}
                  onChange={(e) => setLocalAmountGreaterThan(e.target.value)}
                  step="0.01"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount-less" className="text-sm text-muted-foreground">
                  Amount Less Than
                </Label>
                <Input
                  id="amount-less"
                  type="number"
                  placeholder="10000.00"
                  value={localAmountLessThan}
                  onChange={(e) => setLocalAmountLessThan(e.target.value)}
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className="grid gap-2">
            <Label htmlFor="due-date" className="text-sm text-muted-foreground">
              Due Date
            </Label>
            <Input
              id="due-date"
              type="date"
              value={localDueDate}
              onChange={(e) => setLocalDueDate(e.target.value)}
            />
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
