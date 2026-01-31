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

interface BillCompanyFiltersDialogProps {
  emailFilter: string
  setEmailFilter?: (value: string) => void
  gstinFilter: string
  setGstinFilter?: (value: string) => void
  onClear: () => void
}

export function BillCompanyFiltersDialog({
  emailFilter,
  setEmailFilter,
  gstinFilter,
  setGstinFilter,
  onClear,
}: BillCompanyFiltersDialogProps) {
  const [open, setOpen] = useState(false)
  const [localEmailFilter, setLocalEmailFilter] = useState(emailFilter)
  const [localGstinFilter, setLocalGstinFilter] = useState(gstinFilter)

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setLocalEmailFilter(emailFilter)
      setLocalGstinFilter(gstinFilter)
    }
    setOpen(newOpen)
  }

  const handleApply = () => {
    setEmailFilter?.(localEmailFilter)
    setGstinFilter?.(localGstinFilter)
    setOpen(false)
  }

  const handleClear = () => {
    setLocalEmailFilter("")
    setLocalGstinFilter("")
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
          <DialogTitle className="text-2xl">Filter Bill Companies</DialogTitle>
          <DialogDescription>
            Apply advanced filters to narrow down your bill companies
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Email Filter */}
          <div className="grid gap-2">
            <Label htmlFor="email-filter" className="text-sm text-muted-foreground">
              Email
            </Label>
            <Input
              id="email-filter"
              type="email"
              placeholder="company@example.com"
              value={localEmailFilter}
              onChange={(e) => setLocalEmailFilter(e.target.value)}
            />
          </div>

          {/* GSTIN Filter */}
          <div className="grid gap-2">
            <Label htmlFor="gstin-filter" className="text-sm text-muted-foreground">
              GSTIN
            </Label>
            <Input
              id="gstin-filter"
              placeholder="18AAPCT1234A1Z0"
              value={localGstinFilter}
              onChange={(e) => setLocalGstinFilter(e.target.value)}
              maxLength={15}
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
