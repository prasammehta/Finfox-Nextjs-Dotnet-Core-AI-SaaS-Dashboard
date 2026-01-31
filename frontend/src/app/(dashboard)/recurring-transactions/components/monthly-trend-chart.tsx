"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
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

interface MonthlyTrendChartProps {
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

export function MonthlyTrendChart({ recurringTransactions }: MonthlyTrendChartProps) {
  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const data = months.map((month, index) => ({
      month,
      net: 0,
      cumulativeNet: 0,
    }))

    // Calculate net balance for each month
    recurringTransactions.forEach((transaction) => {
      if (!isActiveTransaction(transaction)) return

      const multiplier = getFrequencyMultiplier(transaction.frequency)
      const monthlyAmount = transaction.amount * multiplier

      data.forEach((monthData) => {
        if (transaction.type === "INCOME") {
          monthData.net += monthlyAmount
        } else {
          monthData.net -= monthlyAmount
        }
      })
    })

    // Calculate cumulative net
    let cumulative = 0
    data.forEach((monthData) => {
      cumulative += monthData.net
      monthData.cumulativeNet = cumulative
    })

    return data
  }, [recurringTransactions])

  return (
    <Card className="cursor-pointer">
      <CardHeader>
        <CardTitle>Monthly Net Trend</CardTitle>
        <CardDescription>Projected net balance trend over the year</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
            <Line
              type="monotone"
              dataKey="net"
              stroke="#3b82f6"
              name="Monthly Net"
              strokeWidth={2}
              dot={{ fill: "#3b82f6" }}
            />
            <Line
              type="monotone"
              dataKey="cumulativeNet"
              stroke="#8b5cf6"
              name="Cumulative Net"
              strokeWidth={2}
              dot={{ fill: "#8b5cf6" }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
