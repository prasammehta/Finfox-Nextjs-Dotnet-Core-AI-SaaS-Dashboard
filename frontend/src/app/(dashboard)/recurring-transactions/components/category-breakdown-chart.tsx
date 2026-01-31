"use client"

import { useMemo, useState } from "react"
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"
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

interface CategoryBreakdownChartProps {
  recurringTransactions: RecurringTransaction[]
}

const COLORS = [
  "#3b82f6", "#ef4444", "#8b5cf6", "#f59e0b", "#10b981",
  "#06b6d4", "#ec4899", "#f97316", "#6366f1", "#14b8a6",
]

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

export function CategoryBreakdownChart({ recurringTransactions }: CategoryBreakdownChartProps) {
  const chartData = useMemo(() => {
    const categoryMap: Record<string, number> = {}

    recurringTransactions.forEach((transaction) => {
      if (!isActiveTransaction(transaction) || transaction.type !== "EXPENSE") return

      const multiplier = getFrequencyMultiplier(transaction.frequency)
      const monthlyAmount = transaction.amount * multiplier

      const categoryName = transaction.category.replace(/_/g, " ")
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + monthlyAmount
    })

    return Object.entries(categoryMap)
      .map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100,
      }))
      .sort((a, b) => b.value - a.value)
  }, [recurringTransactions])

  return (
    <Card className="cursor-pointer">
      <CardHeader>
        <CardTitle>Expense Category Breakdown</CardTitle>
        <CardDescription>Monthly projected expenses by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) =>
                `${name}: ₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 2,
                }).format(value)
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
