"use client"

import { useState, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Wallet, TrendingUp, DollarSign, ArrowUpIcon } from "lucide-react"
import { useAccounts } from "@/hooks/api/useAccounts"
import { useTransactions } from "@/hooks/api/useTransactions"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
  balance: {
    label: "Current Balance",
    color: "hsl(var(--chart-1))",
  },
  initialBalance: {
    label: "Initial Balance",
    color: "hsl(var(--chart-2))",
  },
  growth: {
    label: "Growth",
    color: "hsl(var(--chart-3))",
  },
}

export function CustomerInsights() {
  const { data: accounts, loading: accountsLoading } = useAccounts()
  const { data: transactions, loading: transactionsLoading } = useTransactions()
  const [selectedTab, setSelectedTab] = useState("accounts")

  const accountGrowthData = useMemo(() => {
    return accounts.map(account => ({
      name: account.name || `Account ${account.accountId}`,
      balance: account.currentBalance || 0,
      initialBalance: account.initialBalance || 0,
      growth: (account.currentBalance || 0) - (account.initialBalance || 0),
    }))
  }, [accounts])

  const accountMetrics = useMemo(() => {
    const totalAccounts = accounts.length
    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0)
    const avgBalance = totalAccounts > 0 ? totalBalance / totalAccounts : 0
    
    // Calculate accounts with positive growth
    const growthAccounts = accounts.filter(
      acc => (acc.currentBalance || 0) > (acc.initialBalance || 0)
    ).length

    return {
      totalAccounts,
      totalBalance,
      avgBalance,
      growthAccounts,
      growthPercentage: totalAccounts > 0 ? (growthAccounts / totalAccounts) * 100 : 0,
    }
  }, [accounts])

  const categoryMetrics = useMemo(() => {
    const categoryMap: Record<string, { count: number; total: number }> = {}

    if (Array.isArray(transactions)) {
      transactions.forEach(tx => {
        const category = tx.category || "Other"
        if (!categoryMap[category]) {
          categoryMap[category] = { count: 0, total: 0 }
        }
        categoryMap[category].count += 1
        categoryMap[category].total += tx.amount
      })
    }

    return Object.entries(categoryMap)
      .map(([name, data]) => ({
        category: name,
        transactions: data.count,
        amount: data.total,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
  }, [transactions])

  const loading = accountsLoading || transactionsLoading

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Financial Insights</CardTitle>
        <CardDescription>Account overview and transaction analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-lg h-12">
            <TabsTrigger
              value="accounts"
              className="cursor-pointer flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Account Growth</span>
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="cursor-pointer flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Top Categories</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="mt-8 space-y-6">
            {/* Chart */}
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Account Balance Comparison</h3>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <BarChart data={accountGrowthData} margin={{ top: 20, right: 20, bottom: 60, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                    />
                    <Bar dataKey="initialBalance" fill="var(--color-initialBalance)" name="Initial" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="balance" fill="var(--color-balance)" name="Current" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="space-y-2 p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Total Accounts</p>
                </div>
                <p className="text-2xl font-bold">{accountMetrics.totalAccounts}</p>
              </div>
              <div className="space-y-2 p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Total Balance</p>
                </div>
                <p className="text-2xl font-bold">
                  ₹{accountMetrics.totalBalance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="space-y-2 p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Growing Accounts</p>
                </div>
                <p className="text-2xl font-bold">{accountMetrics.growthAccounts}/{accountMetrics.totalAccounts}</p>
              </div>
              <div className="space-y-2 p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <ArrowUpIcon className="h-4 w-4 text-green-600" />
                  <p className="text-xs text-muted-foreground">Growth Rate</p>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {accountMetrics.growthPercentage.toFixed(0)}%
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="mt-8 space-y-6">
            {/* Categories Table */}
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Top Spending Categories</h3>
                
                {categoryMetrics.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No transaction data available
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Transactions</TableHead>
                        <TableHead className="text-right">Total Amount</TableHead>
                        <TableHead className="text-right">Avg Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryMetrics.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium capitalize">{item.category}</TableCell>
                          <TableCell className="text-right">{item.transactions}</TableCell>
                          <TableCell className="text-right">
                            ₹{item.amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{(item.amount / item.transactions).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="space-y-2 p-3 border rounded-lg">
                <p className="text-xs text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <div className="space-y-2 p-3 border rounded-lg">
                <p className="text-xs text-muted-foreground">Unique Categories</p>
                <p className="text-2xl font-bold">{categoryMetrics.length}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
