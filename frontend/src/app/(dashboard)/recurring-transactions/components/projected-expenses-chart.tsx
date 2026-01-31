"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface RecurringTransaction {
  recurringTransactionId: number
  userId: string
  amount: number
  description: string
  category: string
  frequency: string
  startDate: string
  endDate: string | null
  lastGeneratedDate: string
  createdAt: string
  updatedAt: string
  accountId: number
  type: string
}

interface ProjectedExpensesChartProps {
  recurringTransactions: RecurringTransaction[]
}

function getFrequencyMultiplier(frequency: string): number {
  const multipliers: Record<string, number> = {
    "WEEKLY": 4.33,
    "MONTHLY": 1,
    "YEARLY": 1/12,
  }
  return multipliers[frequency] || 1
}

function isActiveTransaction(transaction: RecurringTransaction): boolean {
  const today = new Date()
  const startDate = new Date(transaction.startDate)
  const endDate = transaction.endDate ? new Date(transaction.endDate) : null
  
  return startDate <= today && (!endDate || today <= endDate)
}

export function ProjectedExpensesChart({ recurringTransactions }: ProjectedExpensesChartProps) {
  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const data = months.map((month) => ({
      month,
      expenses: 0,
      income: 0,
    }))

    recurringTransactions.forEach((transaction) => {
      if (!isActiveTransaction(transaction)) return

      const multiplier = getFrequencyMultiplier(transaction.frequency)
      const monthlyAmount = transaction.amount * multiplier

      // Distribute across all months
      data.forEach((monthData) => {
        if (transaction.type === "EXPENSE") {
          monthData.expenses += monthlyAmount
        } else {
          monthData.income += monthlyAmount
        }
      })
    })

    return data
  }, [recurringTransactions])

  return (
    <Card className="cursor-pointer">
      <CardHeader>
        <CardTitle>Projected Monthly Expenses & Income</CardTitle>
        <CardDescription>Annualized view of recurring transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 0,
                }).format(value)
              }
            />
            <Legend />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[8, 8, 0, 0]} />
            <Bar dataKey="income" fill="#22c55e" name="Income" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
