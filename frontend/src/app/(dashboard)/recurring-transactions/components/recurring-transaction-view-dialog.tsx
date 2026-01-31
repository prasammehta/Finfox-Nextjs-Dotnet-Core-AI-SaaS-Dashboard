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
import { RecurringTransaction } from "@/types/schema"

interface Account {
  accountId: number
  name: string
}

interface RecurringTransactionViewDialogProps {
  recurringTransaction: RecurringTransaction | null
  accounts?: Account[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RecurringTransactionViewDialog({
  recurringTransaction,
  accounts = [],
  open,
  onOpenChange,
}: RecurringTransactionViewDialogProps) {
  if (!recurringTransaction) return null

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
    switch (type?.toLowerCase()) {
      case "income":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
      case "expense":
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200"
    }
  }

  const getCategoryColor = (category: string) => {
    const categoryMap: Record<string, string> = {
      housing:
        "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
      salary:
        "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
      entertainment:
        "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200",
      food: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
      personal_care:
        "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-200",
      investment_income:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
      utilities:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
      debt_payment:
        "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
      investment_transfer:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200",
      other_expense:
        "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200",
    }
    return (
      categoryMap[category?.toLowerCase()] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200"
    )
  }

  const getFrequencyLabel = (frequency: string) => {
    const frequencyMap: Record<string, string> = {
      WEEKLY: "📅 Weekly",
      MONTHLY: "📆 Monthly",
      YEARLY: "📊 Yearly",
    }
    return frequencyMap[frequency] || frequency
  }

  const getAccountName = (accountId: number) => {
    return (
      accounts.find((acc) => acc.accountId === accountId)?.name ||
      `Account ${accountId}`
    )
  }

  const isIncome = recurringTransaction.type?.toLowerCase() === "income"
  const isExpense = recurringTransaction.type?.toLowerCase() === "expense"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recurring Transaction Details</DialogTitle>
          <DialogDescription>
            Complete information about this recurring transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount Section - Main Focus */}
          <div className="bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-2">Amount</p>
            <p
              className={`text-3xl font-bold ${
                isIncome ? "text-green-600" : isExpense ? "text-red-600" : "text-blue-600"
              }`}
            >
              {isIncome || isExpense ? (isIncome ? "+" : "-") : ""}
              {formatCurrency(recurringTransaction.amount)}
            </p>
          </div>

          {/* Type and Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Type</p>
              <Badge className={getTypeColor(recurringTransaction.type)}>
                {recurringTransaction.type || "Unknown"}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Frequency
              </p>
              <Badge variant="outline">
                {getFrequencyLabel(recurringTransaction.frequency)}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Description */}
          {recurringTransaction.description && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Description
              </p>
              <p className="text-sm text-foreground">
                {recurringTransaction.description}
              </p>
            </div>
          )}

          {/* Category */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Category
            </p>
            <Badge className={getCategoryColor(recurringTransaction.category)}>
              {recurringTransaction.category.replace(/_/g, " ")}
            </Badge>
          </div>

          {/* Account */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Account
            </p>
            <p className="text-sm font-medium">
              {getAccountName(recurringTransaction.accountId)}
            </p>
          </div>

          {/* Date Information */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Start Date
            </p>
            <p className="text-sm text-foreground">
              {formatDate(recurringTransaction.startDate)}
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
