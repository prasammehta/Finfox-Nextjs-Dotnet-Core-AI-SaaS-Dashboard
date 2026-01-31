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
import { Debt } from "@/types/schema"

interface DebtViewDialogProps {
  debt: Debt | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DebtViewDialog({
  debt,
  open,
  onOpenChange,
}: DebtViewDialogProps) {
  if (!debt) return null

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

  const getDebtTypeColor = (debtType: string) => {
    switch (debtType?.toUpperCase()) {
      case "LOAN":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
      case "CREDIT_CARD":
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
      case "PERSONAL":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200"
      case "EDUCATION":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200"
      case "HOUSING":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
      case "VEHICLE":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200"
      case "HEALTH":
        return "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-200"
      case "BILL":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
      case "PAID":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200"
    }
  }

  const remainingAmount = debt.amount - (debt.paidAmount || 0)
  const progressPercentage = (debt.paidAmount || 0) / debt.amount * 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Debt Details</DialogTitle>
          <DialogDescription>
            Complete information about this debt
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount Section - Main Focus */}
          <div className="bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-2">Total Amount</p>
            <p className="text-3xl font-bold text-red-600 mb-4">
              {formatCurrency(debt.amount)}
            </p>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Paid</span>
                <span>{progressPercentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Remaining: {formatCurrency(remainingAmount)}
              </div>
            </div>
          </div>

          {/* Type and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Type</p>
              <Badge className={getDebtTypeColor(debt.debtType)}>
                {debt.debtType?.replace(/_/g, " ") || "Unknown"}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Status</p>
              <Badge className={getStatusColor(debt.status)}>
                {debt.status || "Unknown"}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Person Name */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Creditor/Person
            </p>
            <p className="text-sm font-medium">
              {debt.personName || "Not specified"}
            </p>
          </div>

          {/* Paid Amount */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Paid Amount
            </p>
            <p className="text-sm text-green-600 font-medium">
              {formatCurrency(debt.paidAmount || 0)}
            </p>
          </div>

          {/* Date */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Date
            </p>
            <p className="text-sm text-foreground">
              {formatDate(debt.date)}
            </p>
          </div>

          {/* Additional Details */}
          <Separator />

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
