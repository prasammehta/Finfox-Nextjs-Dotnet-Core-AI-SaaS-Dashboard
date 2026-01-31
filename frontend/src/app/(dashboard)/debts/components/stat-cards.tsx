"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, TrendingUp, TrendingDown, ArrowUpRight, DollarSign, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'

interface Debt {
  debtId: number
  userId: string
  personName: string
  amount: number
  debtType: string
  date: string
  status: string
  paidAmount: number
  createdAt: string
  updatedAt: string
}

interface Stats {
  totalDebt: number
  totalPaid: number
  totalRemaining: number
  percentagePaid: number
}

const defaultStats: Stats = {
  totalDebt: 0,
  totalPaid: 0,
  totalRemaining: 0,
  percentagePaid: 0,
}

interface StatCardsProps {
  debts?: Debt[]
}

export function StatCards({ debts = [] }: StatCardsProps) {
  // Calculate stats from debts
  const stats = useMemo(() => {
    if (!debts || debts.length === 0) return defaultStats

    const totalDebt = debts.reduce((sum, d) => sum + (d.amount || 0), 0)
    const totalPaid = debts.reduce((sum, d) => sum + (d.paidAmount || 0), 0)
    const totalRemaining = totalDebt - totalPaid
    const percentagePaid = totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0

    return {
      totalDebt,
      totalPaid,
      totalRemaining,
      percentagePaid,
    }
  }, [debts])

  const performanceMetrics = [
    {
      title: 'Total Debt',
      current: `₹${stats.totalDebt.toFixed(2)}`,
      previous: '₹0.00',
      growth: 0,
      icon: CreditCard,
    },
    {
      title: 'Amount Paid',
      current: `₹${stats.totalPaid.toFixed(2)}`,
      previous: '₹0.00',
      growth: stats.percentagePaid,
      icon: TrendingDown,
    },
    {
      title: 'Remaining',
      current: `₹${stats.totalRemaining.toFixed(2)}`,
      previous: '₹0.00',
      growth: stats.percentagePaid >= 0 ? stats.percentagePaid : 0,
      icon: DollarSign,
    },
    {
      title: 'Paid %',
      current: `${stats.percentagePaid.toFixed(2)}%`,
      previous: '0.00%',
      growth: stats.percentagePaid,
      icon: BarChart3,
    },
  ]
  
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {performanceMetrics.map((metric, index) => (
        <Card key={index} className='border'>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <metric.icon className='text-muted-foreground size-6' />
              <Badge
                variant='outline'
                className={cn(
                  metric.growth >= 0
                    ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400'
                    : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400',
                )}
              >
                {metric.growth >= 0 ? (
                  <>
                    <TrendingUp className='me-1 size-3' />
                    {metric.growth >= 0 ? '+' : ''}
                    {metric.growth.toFixed(2)}%
                  </>
                ) : (
                  <>
                    <TrendingDown className='me-1 size-3' />
                    {metric.growth.toFixed(2)}%
                  </>
                )}
              </Badge>
            </div>

            <div className='space-y-2'>
              <p className='text-muted-foreground text-sm font-medium'>{metric.title}</p>
              <div className='text-2xl font-bold'>{metric.current}</div>
              <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                <span>from {metric.previous}</span>
                <ArrowUpRight className='size-3' />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
