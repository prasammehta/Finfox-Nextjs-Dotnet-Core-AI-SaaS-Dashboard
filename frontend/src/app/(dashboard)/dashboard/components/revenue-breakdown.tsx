"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTransactions } from "@/hooks/api/useTransactions"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
  groceries: { label: "Groceries", color: "hsl(var(--chart-1))" },
  utilities: { label: "Utilities", color: "hsl(var(--chart-2))" },
  entertainment: { label: "Entertainment", color: "hsl(var(--chart-3))" },
  transportation: { label: "Transportation", color: "hsl(var(--chart-4))" },
  healthcare: { label: "Healthcare", color: "hsl(var(--chart-5))" },
  other: { label: "Other", color: "hsl(var(--chart-6))" },
}

export function RevenueBreakdown() {
  const id = "expense-breakdown"
  const { data: transactions, loading } = useTransactions()
  const [activeCategory, setActiveCategory] = React.useState("groceries")

  const expenseData = React.useMemo(() => {
    const expenses = Array.isArray(transactions) 
      ? transactions
          .filter((t) => t.type?.toLowerCase() === "expense")
          .reduce((acc: Record<string, number>, t) => {
            const category = t.category?.toLowerCase() || "other"
            acc[category] = (acc[category] || 0) + (t.amount || 0)
            return acc
          }, {})
      : {}

    const total = Object.values(expenses).reduce((a, b) => a + b, 0)

    return Object.entries(expenses).map(([category, amount]) => ({
      category,
      value: total > 0 ? Math.round((amount / total) * 100) : 0,
      amount,
      fill: chartConfig[category as keyof typeof chartConfig]?.color || chartConfig.other.color,
    }))
  }, [transactions])

  const categories = React.useMemo(() => expenseData.map((item) => item.category), [expenseData])

  const activeIndex = expenseData.findIndex((item) => item.category === activeCategory)

  return (
    <Card data-chart={id} className="flex flex-col cursor-pointer">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-2">
        <div>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>Spending distribution by category</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <div className="flex justify-center">
            <ChartContainer
              id={id}
              config={chartConfig}
              className="mx-auto aspect-square w-full max-w-[300px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={expenseData}
                  dataKey="value"
                  nameKey="category"
                  innerRadius={60}
                  strokeWidth={5}
                  activeIndex={activeIndex}
                  activeShape={({
                    outerRadius = 0,
                    ...props
                  }: PieSectorDataItem) => (
                    <g>
                      <Sector {...props} outerRadius={outerRadius + 10} />
                      <Sector
                        {...props}
                        outerRadius={outerRadius + 25}
                        fill="hsl(var(--muted))"
                      />
                    </g>
                  )}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {expenseData[activeIndex]?.value}%
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              {expenseData[activeIndex]?.category}
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            {expenseData.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => setActiveCategory(item.category)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <div>
                    <p className="font-medium capitalize text-sm">
                      {item.category}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ₹{item.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-sm">{item.value}%</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
          