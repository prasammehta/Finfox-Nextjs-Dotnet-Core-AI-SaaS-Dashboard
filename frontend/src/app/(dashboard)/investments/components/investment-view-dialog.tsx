"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Investment } from "@/types/schema"

interface InvestmentViewDialogProps {
  investment: Investment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvestmentViewDialog({
  investment,
  open,
  onOpenChange,
}: InvestmentViewDialogProps) {
  if (!investment) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getTypeColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case "STOCK":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
      case "CRYPTO":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200"
      case "REAL_ESTATE":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
      case "MUTUAL_FUND":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
      case "BOND":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200"
      case "OTHER":
        return "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200"
    }
  }

  const gain = investment.currentValue - investment.initialAmount
  const gainPercentage = investment.initialAmount > 0 ? (gain / investment.initialAmount) * 100 : 0
  const isPositive = gain >= 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Investment Details</DialogTitle>
          <DialogDescription>
            Complete information about this investment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount Section - Main Focus */}
          <div className="bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-2">Current Value</p>
            <p className={`text-3xl font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(investment.currentValue)}
            </p>
            <p className={`text-sm mt-2 ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {isPositive ? "+" : ""}{formatCurrency(gain)} ({gainPercentage.toFixed(2)}%)
            </p>
          </div>

          {/* Investment Info */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Investment Name</p>
            <p className="text-sm font-medium">{investment.name}</p>
          </div>

          {/* Type */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Type</p>
            <Badge className={getTypeColor(investment.type)}>
              {investment.type}
            </Badge>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Initial Amount</p>
              <p className="text-sm font-medium">{formatCurrency(investment.initialAmount)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Current Value</p>
              <p className="text-sm font-medium">{formatCurrency(investment.currentValue)}</p>
            </div>
          </div>

          {/* Date Information */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Date Acquired</p>
            <p className="text-sm text-foreground">{formatDate(investment.dateAcquired)}</p>
          </div>

          {/* Additional Details */}
          <Separator />

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground mb-1">Created</p>
              <p className="text-foreground">{formatDate(investment.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Updated</p>
              <p className="text-foreground">{formatDate(investment.updatedAt)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
