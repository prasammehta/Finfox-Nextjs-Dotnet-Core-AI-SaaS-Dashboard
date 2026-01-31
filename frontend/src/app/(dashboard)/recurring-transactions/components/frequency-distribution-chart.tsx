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

interface FrequencyDistributionChartProps {
  recurringTransactions: RecurringTransaction[]
}

function isActiveTransaction(transaction: RecurringTransaction): boolean {
  const today = new Date()
  const startDate = new Date(transaction.startDate)
  const endDate = transaction.endDate ? new Date(transaction.endDate) : null
  
  return startDate <= today && (!endDate || today <= endDate)
}

export function FrequencyDistributionChart({ recurringTransactions }: FrequencyDistributionChartProps) {
  const chartData = useMemo(() => {
    const frequencyMap: Record<string, { count: number; amount: number }> = {
      "WEEKLY": { count: 0, amount: 0 },
      "MONTHLY": { count: 0, amount: 0 },
      "YEARLY": { count: 0, amount: 0 },
    }

    recurringTransactions.forEach((transaction) => {
      if (!isActiveTransaction(transaction)) return

      const freq = transaction.frequency
      if (frequencyMap[freq]) {
        frequencyMap[freq].count += 1
        frequencyMap[freq].amount += transaction.amount
      }
    })

    return [
      {
        name: "Weekly",
        count: frequencyMap["WEEKLY"].count,
        amount: frequencyMap["WEEKLY"].amount,
      },
      {
        name: "Monthly",
        count: frequencyMap["MONTHLY"].count,
        amount: frequencyMap["MONTHLY"].amount,
      },
      {
        name: "Yearly",
        count: frequencyMap["YEARLY"].count,
        amount: frequencyMap["YEARLY"].amount,
      },
    ]
  }, [recurringTransactions])

  return (
    <Card className="cursor-pointer">
      <CardHeader>
        <CardTitle>Frequency Distribution</CardTitle>
        <CardDescription>Transaction count and amount by frequency</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "amount") {
                  return new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    minimumFractionDigits: 0,
                  }).format(value)
                }
                return value
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Count" radius={[8, 8, 0, 0]} />
            <Bar yAxisId="right" dataKey="amount" fill="#8b5cf6" name="Total Amount" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
