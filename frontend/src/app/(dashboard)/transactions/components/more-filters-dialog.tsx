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

interface MoreFiltersDialogProps {
  startDate: string
  endDate: string
  fromAccountId: string
  amountGreaterThan: string
  amountLessThan: string
  accounts: Array<{ accountId: number; name: string }>
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onFromAccountIdChange: (value: string) => void
  onAmountGreaterThanChange: (value: string) => void
  onAmountLessThanChange: (value: string) => void
  onApply: () => void
  onClear: () => void
}

export function MoreFiltersDialog({
  startDate,
  endDate,
  fromAccountId,
  amountGreaterThan,
  amountLessThan,
  accounts,
  onStartDateChange,
  onEndDateChange,
  onFromAccountIdChange,
  onAmountGreaterThanChange,
  onAmountLessThanChange,
  onApply,
  onClear,
}: MoreFiltersDialogProps) {
  const [open, setOpen] = useState(false)
  // Local state for filter editing
  const [localStartDate, setLocalStartDate] = useState(startDate)
  const [localEndDate, setLocalEndDate] = useState(endDate)
  const [localFromAccountId, setLocalFromAccountId] = useState(fromAccountId)
  const [localAmountGreaterThan, setLocalAmountGreaterThan] = useState(amountGreaterThan)
  const [localAmountLessThan, setLocalAmountLessThan] = useState(amountLessThan)

  // Update local state when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      setLocalStartDate(startDate)
      setLocalEndDate(endDate)
      setLocalFromAccountId(fromAccountId)
      setLocalAmountGreaterThan(amountGreaterThan)
      setLocalAmountLessThan(amountLessThan)
    }
  }

  // Handle Apply
  const handleApply = () => {
    onStartDateChange(localStartDate)
    onEndDateChange(localEndDate)
    onFromAccountIdChange(localFromAccountId)
    onAmountGreaterThanChange(localAmountGreaterThan)
    onAmountLessThanChange(localAmountLessThan)
    onApply()
    setOpen(false)
  }

  // Handle Clear
  const handleClear = () => {
    setLocalStartDate("")
    setLocalEndDate("")
    setLocalFromAccountId("all")
    setLocalAmountGreaterThan("")
    setLocalAmountLessThan("")
    onStartDateChange("")
    onEndDateChange("")
    onFromAccountIdChange("")
    onAmountGreaterThanChange("")
    onAmountLessThanChange("")
    onClear()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer">
          <Sliders className="mr-2 size-4" />
          More Filter
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Filter Transactions</DialogTitle>
          <DialogDescription className="text-base">
            Select filters to narrow down your transactions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* From Account Section */}
          <div className="space-y-3">
            <Label htmlFor="dialog-account-filter" className="text-base font-semibold">
              From Account
            </Label>
            <Select value={localFromAccountId || "all"} onValueChange={setLocalFromAccountId}>
              <SelectTrigger className="cursor-pointer h-11" id="dialog-account-filter">
                <SelectValue placeholder="Select Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.accountId} value={String(account.accountId)}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="start-date" className="text-base font-semibold">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={localStartDate}
                onChange={(e) => setLocalStartDate(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="end-date" className="text-base font-semibold">
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={localEndDate}
                onChange={(e) => setLocalEndDate(e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          {/* Amount Range Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="amount-greater" className="text-base font-semibold">
                Amount Greater Than
              </Label>
              <Input
                id="amount-greater"
                type="number"
                placeholder="0"
                value={localAmountGreaterThan}
                onChange={(e) => setLocalAmountGreaterThan(e.target.value)}
                step="0.01"
                className="h-11"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="amount-less" className="text-base font-semibold">
                Amount Less Than
              </Label>
              <Input
                id="amount-less"
                type="number"
                placeholder="0"
                value={localAmountLessThan}
                onChange={(e) => setLocalAmountLessThan(e.target.value)}
                step="0.01"
                className="h-11"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            className="cursor-pointer px-6 h-10"
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button className="cursor-pointer px-6 h-10 bg-green-600 hover:bg-green-700" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
