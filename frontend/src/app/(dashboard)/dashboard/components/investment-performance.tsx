"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useInvestments } from "@/hooks/api/useInvestments"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
    performance: {
        label: "Net Gain/Loss",
        color: "var(--chart-1)",
    },
}

export function InvestmentPerformanceChart() {
    const { data: investments, loading } = useInvestments()

    const data = React.useMemo(() => {
        if (!Array.isArray(investments)) return []

        return investments.map(inv => ({
            name: inv.name,
            value: (inv.currentValue || 0) - (inv.initialAmount || 0),
        })).sort((a, b) => b.value - a.value)
    }, [investments])

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>Investment Performance</CardTitle>
                <CardDescription>Net gain or loss per investment</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
                {loading ? (
                    <Skeleton className="h-[200px] w-full" />
                ) : data.length === 0 ? (
                    <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                        No investment data available
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/30" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10 }}
                                interval={0}
                                angle={-20}
                                textAnchor="end"
                                className="text-muted-foreground"
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12 }}
                                tickFormatter={(val) => `₹${val}`}
                                className="text-muted-foreground"
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ReferenceLine y={0} stroke="var(--border)" />
                            <Bar
                                dataKey="value"
                                fill="var(--color-performance)"
                                radius={[4, 4, 4, 4]}
                                barSize={40}
                            >
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}
