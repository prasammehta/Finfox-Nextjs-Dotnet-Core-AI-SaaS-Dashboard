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
import { Transaction } from "@/types/schema"
import { getTransactionTypeLabel, getCategoryLabel, getTypeColor, getCategoryColor } from "@/constants/enums"

interface Account {
  accountId: number
  name: string
}

interface TransactionViewDialogProps {
  transaction: Transaction | null
  accounts?: Account[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionViewDialog({
  transaction,
  accounts = [],
  open,
  onOpenChange,
}: TransactionViewDialogProps) {
  if (!transaction) return null

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
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "income":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
      case "expense":
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
      case "transfer":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200"
    }
  }

  const getCategoryColor = (category: string) => {
    const categoryMap: Record<string, string> = {
      "food": "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
      "transport": "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
      "utilities": "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
      "entertainment": "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200",
      "shopping": "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-200",
      "salary": "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
      "investment": "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200",
    }
    return categoryMap[category?.toLowerCase()] || "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200"
  }

  const getAccountName = (accountId: number) => {
    return accounts.find(acc => acc.accountId === accountId)?.name || `Account ${accountId}`
  }

  const isIncome = transaction.type?.toUpperCase() === "INCOME"
  const isExpense = transaction.type?.toUpperCase() === "EXPENSE"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Complete information about this transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount Section - Main Focus */}
          <div className="bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-2">Amount</p>
            <p className={`text-3xl font-bold ${isIncome ? "text-green-600" : isExpense ? "text-red-600" : "text-blue-600"}`}>
              {isIncome || isExpense ? (isIncome ? "+" : "-") : ""}
              {formatCurrency(transaction.amount)}
            </p>
          </div>

          {/* Type and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Type</p>
              <Badge className={getTypeColor(transaction.type)}>
                {getTransactionTypeLabel(transaction.type)}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Category</p>
              <Badge className={getCategoryColor(transaction.category)}>
                {getCategoryLabel(transaction.category)}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Description */}
          {transaction.description && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Description</p>
              <p className="text-sm text-foreground">{transaction.description}</p>
            </div>
          )}

          {/* Account */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Account</p>
            <p className="text-sm font-medium">{getAccountName(transaction.fromAccountId)}</p>
          </div>

          {/* Date Information */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Transaction Date</p>
            <p className="text-sm text-foreground">{formatDate(transaction.date)}</p>
          </div>

          {/* Additional Details */}
          <Separator />

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground mb-1">Status</p>
              <Badge variant="outline">Completed</Badge>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Last Updated</p>
              <p className="text-xs text-muted-foreground">
                {transaction.updatedAt ? formatDate(transaction.updatedAt) : "—"}
              </p>
            </div>
          </div>

          {/* Close Button */}
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
