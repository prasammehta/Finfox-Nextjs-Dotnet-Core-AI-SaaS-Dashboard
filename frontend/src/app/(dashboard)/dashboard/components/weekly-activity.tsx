"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useTransactions } from "@/hooks/api/useTransactions"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
    count: {
        label: "Transactions",
        color: "var(--chart-1)",
    },
}

export function WeeklyActivityChart() {
    const { data: transactions, loading } = useTransactions()

    const data = React.useMemo(() => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        const activity = days.map(day => ({ day, count: 0 }))

        if (Array.isArray(transactions)) {
            transactions.forEach(tx => {
                const date = new Date(tx.date || tx.createdAt)
                const dayIndex = date.getDay()
                activity[dayIndex].count += 1
            })
        }

        return activity
    }, [transactions])

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Transaction volume by day of week</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
                {loading ? (
                    <Skeleton className="h-[200px] w-full" />
                ) : (
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--color-count)" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="var(--color-count)" stopOpacity={0.3} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/30" />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12 }}
                                className="text-muted-foreground"
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12 }}
                                className="text-muted-foreground"
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar
                                dataKey="count"
                                fill="url(#barGradient)"
                                radius={[6, 6, 6, 6]}
                                barSize={32}
                            />
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}
