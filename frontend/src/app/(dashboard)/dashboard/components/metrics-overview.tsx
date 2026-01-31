"use client"

import { TrendingUp, TrendingDown, DollarSign, Wallet, PiggyBank } from "lucide-react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDashboardMetrics } from "../hooks/useDashboardMetrics"
import { Skeleton } from "@/components/ui/skeleton"

const formatCurrency = (value: number) => {
  return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function MetricsOverview() {
  const { totalBalance, totalIncome, totalExpenses, netWorth, savingsRate, loading } = useDashboardMetrics()

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 @5xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  const metrics = [
    {
      title: "Total Balance",
      value: formatCurrency(totalBalance),
      description: "Across all accounts",
      change: "+12%",
      trend: "up" as const,
      icon: Wallet,
      footer: "Combined account balance",
      subfooter: "Updated in real-time",
    },
    {
      title: "Net Worth",
      value: formatCurrency(netWorth),
      description: "Assets minus liabilities",
      change: netWorth >= 0 ? "+5.2%" : "-3.2%",
      trend: (netWorth >= 0 ? ("up" as const) : ("down" as const)),
      icon: DollarSign,
      footer: "Total financial position",
      subfooter: "Includes investments & debts",
    },
    {
      title: "Monthly Income",
      value: formatCurrency(totalIncome),
      description: "Total incoming funds",
      change: "+8.1%",
      trend: "up" as const,
      icon: TrendingUp,
      footer: "Income this period",
      subfooter: "Compared to last month",
    },
    {
      title: "Savings Rate",
      value: `${savingsRate.toFixed(1)}%`,
      description: "Income saved this month",
      change: savingsRate >= 20 ? "+2.3%" : "-1.5%",
      trend: (savingsRate >= 20 ? ("up" as const) : ("down" as const)),
      icon: PiggyBank,
      footer: savingsRate >= 20 ? "On track" : "Needs attention",
      subfooter: `Expense: ${formatCurrency(totalExpenses)}`,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 @5xl:grid-cols-4">
      {metrics.map((metric) => {
        const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown
        const isPositive = metric.trend === "up"

        return (
          <Card key={metric.title} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardDescription>{metric.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {metric.value}
              </CardTitle>
              <div className="pt-2">
                <Badge variant="outline" className={isPositive ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"}>
                  <TrendIcon className={`h-4 w-4 mr-1 ${isPositive ? "text-green-600" : "text-red-600"}`} />
                  <span className={isPositive ? "text-green-600" : "text-red-600"}>{metric.change}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                <metric.icon className="h-4 w-4 text-muted-foreground" />
                {metric.footer}
              </div>
              <div className="line-clamp-1 text-xs text-muted-foreground">{metric.subfooter}</div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}