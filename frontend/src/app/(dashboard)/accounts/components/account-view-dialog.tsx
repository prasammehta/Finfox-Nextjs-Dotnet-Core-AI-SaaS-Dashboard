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
import { Account } from "@/types/schema"
import { TrendingUp, TrendingDown } from "lucide-react"

interface AccountViewDialogProps {
  account: Account | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccountViewDialog({
  account,
  open,
  onOpenChange,
}: AccountViewDialogProps) {
  if (!account) return null

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

  const getBalanceStatus = (
    initialBalance: number,
    currentBalance: number
  ): { status: string; color: string; isPositive: boolean } => {
    const difference = currentBalance - initialBalance
    if (difference > 0) {
      return {
        status: `+${formatCurrency(difference)}`,
        color: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
        isPositive: true,
      }
    } else if (difference < 0) {
      return {
        status: `${formatCurrency(difference)}`,
        color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
        isPositive: false,
      }
    } else {
      return {
        status: "No change",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200",
        isPositive: false,
      }
    }
  }

  const { status, color, isPositive } = getBalanceStatus(
    account.initialBalance,
    account.currentBalance
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Account Details</DialogTitle>
          <DialogDescription>
            Complete information about this account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Name */}
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-2">Account Name</p>
            <p className="text-2xl font-bold">{account.name}</p>
          </div>

          {/* Balance Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Initial Balance
              </p>
              <p className="text-lg font-semibold">
                {formatCurrency(account.initialBalance)}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Current Balance
              </p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(account.currentBalance)}
              </p>
            </div>
          </div>

          {/* Balance Change */}
          <div className="border rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Balance Change
            </p>
            <Badge className={color}>
              {isPositive ? (
                <TrendingUp className="me-1 size-3" />
              ) : (
                <TrendingDown className="me-1 size-3" />
              )}
              {status}
            </Badge>
          </div>

          <Separator />

          {/* Account ID */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Account ID
            </p>
            <p className="text-sm font-mono text-foreground">
              {account.accountId}
            </p>
          </div>

          {/* Date Information */}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Created
              </p>
              <p className="text-sm text-foreground">
                {formatDate(account.createdAt)}
              </p>
            </div>
            {account.updatedAt && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Last Updated
                </p>
                <p className="text-sm text-foreground">
                  {formatDate(account.updatedAt)}
                </p>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={() => onOpenChange(false)} className="cursor-pointer">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
