"use client"

import * as React from "react"
import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip, Label } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useAccounts } from "@/hooks/api/useAccounts"
import { useInvestments } from "@/hooks/api/useInvestments"
import { useDebts } from "@/hooks/api/useDebts"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
    accounts: {
        label: "Accounts",
        color: "var(--chart-1)",
    },
    investments: {
        label: "Investments",
        color: "var(--chart-2)",
    },
    debts: {
        label: "Debts",
        color: "var(--chart-5)",
    },
}

export function AssetAllocationChart() {
    const { data: accounts, loading: accountsLoading } = useAccounts()
    const { data: investments, loading: investmentsLoading } = useInvestments()
    const { data: debts, loading: debtsLoading } = useDebts()

    const data = React.useMemo(() => {
        const totalAccounts = accounts?.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0) || 0
        const totalInvestments = investments?.reduce((sum, inv) => sum + (inv.currentValue || 0), 0) || 0
        const totalDebts = debts?.reduce((sum, debt) => sum + (debt.amount - (debt.paidAmount || 0)), 0) || 0

        return [
            { name: "Accounts", value: totalAccounts, fill: "var(--chart-1)" },
            { name: "Investments", value: totalInvestments, fill: "var(--chart-2)" },
            { name: "Debts", value: totalDebts, fill: "var(--chart-5)" },
        ].filter(item => item.value > 0)
    }, [accounts, investments, debts])

    const loading = accountsLoading || investmentsLoading || debtsLoading

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
                <CardDescription>Net worth distribution</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                {loading ? (
                    <Skeleton className="h-[250px] w-full" />
                ) : (
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={70}
                                outerRadius={90}
                                strokeWidth={5}
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            const totalValue = data.reduce((acc, curr) => acc + curr.value, 0)
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
                                                        className="fill-foreground text-2xl font-bold"
                                                    >
                                                        ₹{totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-muted-foreground text-xs"
                                                    >
                                                        Net Worth
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                />
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                )}
                <div className="mt-4 space-y-2 pb-4">
                    {data.map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                                <span>{item.name}</span>
                            </div>
                            <span className="font-semibold">₹{item.value.toLocaleString("en-IN")}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
