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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sliders } from "lucide-react"

interface InvestmentsFiltersDialogProps {
  typeFilter: string
  setTypeFilter?: (value: string) => void
  gainLossGreaterThan: string
  setGainLossGreaterThan?: (value: string) => void
  gainLossLessThan: string
  setGainLossLessThan?: (value: string) => void
  returnPercentGreaterThan: string
  setReturnPercentGreaterThan?: (value: string) => void
  dateAcquired: string
  setDateAcquired?: (value: string) => void
  onClear: () => void
}

export function InvestmentsFiltersDialog({
  typeFilter,
  setTypeFilter,
  gainLossGreaterThan,
  setGainLossGreaterThan,
  gainLossLessThan,
  setGainLossLessThan,
  returnPercentGreaterThan,
  setReturnPercentGreaterThan,
  dateAcquired,
  setDateAcquired,
  onClear,
}: InvestmentsFiltersDialogProps) {
  const [open, setOpen] = useState(false)
  const [localTypeFilter, setLocalTypeFilter] = useState(typeFilter)
  const [localGainLossGreaterThan, setLocalGainLossGreaterThan] = useState(gainLossGreaterThan)
  const [localGainLossLessThan, setLocalGainLossLessThan] = useState(gainLossLessThan)
  const [localReturnPercentGreaterThan, setLocalReturnPercentGreaterThan] = useState(returnPercentGreaterThan)
  const [localDateAcquired, setLocalDateAcquired] = useState(dateAcquired)

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setLocalTypeFilter(typeFilter)
      setLocalGainLossGreaterThan(gainLossGreaterThan)
      setLocalGainLossLessThan(gainLossLessThan)
      setLocalReturnPercentGreaterThan(returnPercentGreaterThan)
      setLocalDateAcquired(dateAcquired)
    }
    setOpen(newOpen)
  }

  const handleApply = () => {
    setTypeFilter?.(localTypeFilter)
    setGainLossGreaterThan?.(localGainLossGreaterThan)
    setGainLossLessThan?.(localGainLossLessThan)
    setReturnPercentGreaterThan?.(localReturnPercentGreaterThan)
    setDateAcquired?.(localDateAcquired)
    setOpen(false)
  }

  const handleClear = () => {
    setLocalTypeFilter("")
    setLocalGainLossGreaterThan("")
    setLocalGainLossLessThan("")
    setLocalReturnPercentGreaterThan("")
    setLocalDateAcquired("")
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
          <DialogTitle className="text-2xl">Filter Investments</DialogTitle>
          <DialogDescription>
            Apply advanced filters to narrow down your investments
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Investment Type */}
          <div className="grid gap-2">
            <Label htmlFor="type-filter" className="text-sm text-muted-foreground">
              Investment Type
            </Label>
            <Select
              value={localTypeFilter || "all"}
              onValueChange={(value) => setLocalTypeFilter(value === "all" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Stocks">Stocks</SelectItem>
                <SelectItem value="Bonds">Bonds</SelectItem>
                <SelectItem value="Mutual Funds">Mutual Funds</SelectItem>
                <SelectItem value="Real Estate">Real Estate</SelectItem>
                <SelectItem value="Cryptocurrency">Cryptocurrency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Gain/Loss Range */}
          <div className="grid gap-2">
            <Label>Gain/Loss Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gain-loss-greater" className="text-sm text-muted-foreground">
                  Gain/Loss Greater Than
                </Label>
                <Input
                  id="gain-loss-greater"
                  type="number"
                  placeholder="0.00"
                  value={localGainLossGreaterThan}
                  onChange={(e) => setLocalGainLossGreaterThan(e.target.value)}
                  step="0.01"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gain-loss-less" className="text-sm text-muted-foreground">
                  Gain/Loss Less Than
                </Label>
                <Input
                  id="gain-loss-less"
                  type="number"
                  placeholder="50000.00"
                  value={localGainLossLessThan}
                  onChange={(e) => setLocalGainLossLessThan(e.target.value)}
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Return Percentage */}
          <div className="grid gap-2">
            <Label htmlFor="return-percent" className="text-sm text-muted-foreground">
              Return Percentage Greater Than
            </Label>
            <Input
              id="return-percent"
              type="number"
              placeholder="10"
              value={localReturnPercentGreaterThan}
              onChange={(e) => setLocalReturnPercentGreaterThan(e.target.value)}
              step="0.01"
            />
          </div>

          {/* Date Acquired */}
          <div className="grid gap-2">
            <Label htmlFor="date-acquired" className="text-sm text-muted-foreground">
              Date Acquired
            </Label>
            <Input
              id="date-acquired"
              type="date"
              value={localDateAcquired}
              onChange={(e) => setLocalDateAcquired(e.target.value)}
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
