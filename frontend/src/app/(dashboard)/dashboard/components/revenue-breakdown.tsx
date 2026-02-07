"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector, Cell } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTransactions } from "@/hooks/api/useTransactions"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
  1: { label: "Category 1", color: "var(--chart-1)" },
  2: { label: "Category 2", color: "var(--chart-2)" },
  3: { label: "Category 3", color: "var(--chart-3)" },
  4: { label: "Category 4", color: "var(--chart-4)" },
  5: { label: "Category 5", color: "var(--chart-5)" },
  other: { label: "Other", color: "var(--chart-1)" },
} as any

export function RevenueBreakdown() {
  const id = "expense-breakdown"
  const { data: transactions, loading } = useTransactions({}, 100)
  const [activeCategory, setActiveCategory] = React.useState("")

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

    const data = Object.entries(expenses).map(([category, amount], index) => {
      const colorIndex = (index % 5) + 1
      return {
        category,
        value: total > 0 ? Math.round((amount / total) * 100) : 0,
        amount,
        fill: `var(--chart-${colorIndex})`,
        colorKey: colorIndex.toString()
      }
    })

    return data.sort((a, b) => b.value - a.value)
  }, [transactions])

  React.useEffect(() => {
    if (expenseData.length > 0 && !activeCategory) {
      setActiveCategory(expenseData[0].category)
    }
  }, [expenseData, activeCategory])

  const categories = React.useMemo(() => expenseData.map((item) => item.category), [expenseData])

  const activeIndex = expenseData.findIndex((item) => item.category === activeCategory)

  // Dynamic config for tooltip/legend labels
  const dynamicConfig = React.useMemo(() => {
    const config = { ...chartConfig }
    expenseData.forEach((item) => {
      config[item.category] = {
        label: item.category.charAt(0).toUpperCase() + item.category.slice(1),
        color: item.fill
      }
    })
    return config
  }, [expenseData])

  return (
    <Card data-chart={id} className="flex flex-col cursor-pointer">
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
                <SelectItem key={category} value={category} className="capitalize">
                  {category}
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
              config={dynamicConfig}
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
                  outerRadius={80}
                  strokeWidth={5}
                  activeIndex={activeIndex}
                  onClick={(_, index) => setActiveCategory(expenseData[index].category)}
                  activeShape={({
                    outerRadius = 0,
                    ...props
                  }: PieSectorDataItem) => (
                    <g>
                      <Sector {...props} outerRadius={outerRadius + 10} />
                      <Sector
                        {...props}
                        outerRadius={outerRadius + 25}
                        innerRadius={outerRadius + 12}
                      />
                    </g>
                  )}
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
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
