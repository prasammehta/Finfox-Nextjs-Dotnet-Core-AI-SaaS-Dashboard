"use client"

import React from "react"
import { Eye, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTransactions } from "@/hooks/api/useTransactions"
import { Skeleton } from "@/components/ui/skeleton"

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    groceries: "🛒",
    utilities: "⚡",
    entertainment: "🎬",
    transportation: "🚗",
    healthcare: "⚕️",
    salary: "💼",
    investment: "📈",
  }
  return icons[category?.toLowerCase()] || "💳"
}

const getTypeColor = (type: string) => {
  return type?.toLowerCase() === "income"
    ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
    : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
}

export function RecentTransactions() {
  const { data: transactions, loading } = useTransactions()
  
  const recentTransactions = React.useMemo(() => {
    return Array.isArray(transactions)
      ? transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
      : []
  }, [transactions])
   
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest 5 financial activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No transactions yet
            </p>
          ) : (
            recentTransactions.map((transaction) => (
              <div
                key={transaction.transactionId}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-lg">
                      {getCategoryIcon(transaction.category || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {transaction.description || transaction.category || "Transaction"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${transaction.type?.toLowerCase() === "income" ? "text-green-600" : "text-red-600"}`}>
                      {transaction.type?.toLowerCase() === "income" ? "+" : "-"}₹{transaction.amount.toFixed(2)}
                    </p>
                    <Badge className={`text-xs ${getTypeColor(transaction.type || "")}`}>
                      {transaction.type}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="cursor-pointer">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-red-600">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
  