"use client"

import * as React from "react"
import { RadialBar, RadialBarChart, PolarGrid, LabelList, Label, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useTransactions } from "@/hooks/api/useTransactions"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
    recurring: {
        label: "Recurring",
        color: "var(--chart-1)",
    },
    onetime: {
        label: "One-time",
        color: "var(--chart-4)",
    },
}

export function RecurringVsOnetimeChart() {
    const { data: transactions, loading } = useTransactions({}, 100)

    const data = React.useMemo(() => {
        if (!Array.isArray(transactions)) return []

        const expenses = transactions.filter(t => t.type?.toLowerCase() === "expense")
        const recurring = expenses.filter(t => t.recurringTransactionId).reduce((sum, t) => sum + t.amount, 0)
        const onetime = expenses.filter(t => !t.recurringTransactionId).reduce((sum, t) => sum + t.amount, 0)
        const total = recurring + onetime

        return [
            {
                type: "recurring",
                amount: recurring,
                fill: "var(--color-recurring)",
                percentage: total > 0 ? (recurring / total) * 100 : 0
            },
            {
                type: "onetime",
                amount: onetime,
                fill: "var(--color-onetime)",
                percentage: total > 0 ? (onetime / total) * 100 : 0
            },
        ]
    }, [transactions])

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>Expense Nature</CardTitle>
                <CardDescription>Recurring vs one-time spending</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                {loading ? (
                    <Skeleton className="h-[250px] w-full" />
                ) : (
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                        <RadialBarChart
                            data={data}
                            startAngle={90}
                            endAngle={450}
                            innerRadius={80}
                            outerRadius={130}
                        >
                            <PolarGrid gridType="circle" className="stroke-muted" />
                            <RadialBar
                                background
                                dataKey="percentage"
                                cornerRadius={10}
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            const recurring = data.find(d => d.type === "recurring")?.percentage || 0
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
                                                        {recurring.toFixed(0)}%
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-muted-foreground text-xs"
                                                    >
                                                        Recurring
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                />
                            </RadialBar>
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        </RadialBarChart>
                    </ChartContainer>
                )}
                <div className="mt-4 space-y-2 pb-4">
                    {data.map((item) => (
                        <div key={item.type} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                                <span className="capitalize">{item.type}</span>
                            </div>
                            <span className="font-semibold">{item.percentage.toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
