"use client"

import { useState, useMemo } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useTransactions } from "@/hooks/api/useTransactions"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
  expense: {
    label: "Expenses",
    color: "hsl(var(--chart-2))",
  },
}

export function SalesChart() {
  const { data: transactions, loading } = useTransactions()
  const [timeRange, setTimeRange] = useState("6m")

  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentMonth = new Date().getMonth()
    
    // Determine how many months to show based on selection
    const monthsToShow = timeRange === "3m" ? 3 : timeRange === "1m" ? 1 : 6
    const startMonth = Math.max(0, currentMonth - monthsToShow + 1)
    
    const data = months.slice(startMonth, currentMonth + 1).map(month => ({
      month,
      income: 0,
      expense: 0,
    }))

    // Group transactions by month
    if (Array.isArray(transactions)) {
      transactions.forEach(transaction => {
        const txDate = new Date(transaction.createdAt)
        const txMonth = txDate.getMonth()
        
        // Only include if within our range
        if (txMonth >= startMonth && txMonth <= currentMonth) {
          const monthIndex = txMonth - startMonth
          if (monthIndex >= 0 && monthIndex < data.length) {
            if (transaction.type?.toLowerCase() === "income") {
              data[monthIndex].income += transaction.amount
            } else if (transaction.type?.toLowerCase() === "expense") {
              data[monthIndex].expense += transaction.amount
            }
          }
        }
      })
    }

    return data
  }, [transactions, timeRange])

  return (
    <Card className="cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Income vs Expenses</CardTitle>
          <CardDescription>Monthly comparison over time</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32 cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m" className="cursor-pointer">Last 1 month</SelectItem>
            <SelectItem value="3m" className="cursor-pointer">Last 3 months</SelectItem>
            <SelectItem value="6m" className="cursor-pointer">Last 6 months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0 pt-6">
        <div className="px-6 pb-6">
          {loading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : (
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="var(--color-income)"
                  fill="url(#colorIncome)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="var(--color-expense)"
                  fill="url(#colorExpense)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
