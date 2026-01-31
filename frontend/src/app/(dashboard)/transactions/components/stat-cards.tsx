"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, TrendingUp, TrendingDown, ArrowUpRight, DollarSign, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'

interface Transaction {
  transactionId: number
  amount: number
  description: string
  type: string
  category: string
  fromAccountId: number
  createdAt: string
}

interface Stats {
  totalIncome: number
  totalExpense: number
  totalBalance: number
  averageTransaction: number
}

const defaultStats: Stats = {
  totalIncome: 0,
  totalExpense: 0,
  totalBalance: 0,
  averageTransaction: 0,
}

interface StatCardsProps {
  transactions?: Transaction[]
}

export function StatCards({ transactions = [] }: StatCardsProps) {
  // Calculate stats from transactions
  const stats = useMemo(() => {
    if (!transactions || transactions.length === 0) return defaultStats

    const totalIncome = transactions
      .filter((t) => t.type?.toLowerCase() === "income")
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    
    const totalExpense = transactions
      .filter((t) => t.type?.toLowerCase() === "expense")
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    
    const totalBalance = totalIncome - totalExpense
    const averageTransaction = transactions.length > 0 ? Math.abs(totalBalance) / transactions.length : 0

    return {
      totalIncome,
      totalExpense,
      totalBalance,
      averageTransaction,
    }
  }, [transactions])

  const performanceMetrics = [
    {
      title: 'Total Income',
      current: `₹${stats.totalIncome.toFixed(2)}`,
      previous: '₹0.00',
      growth: 0,
      icon: TrendingUp,
    },
    {
      title: 'Total Expense',
      current: `₹${stats.totalExpense.toFixed(2)}`,
      previous: '₹0.00',
      growth: 0,
      icon: CreditCard,
    },
    {
      title: 'Balance',
      current: `₹${stats.totalBalance.toFixed(2)}`,
      previous: '₹0.00',
      growth: stats.totalBalance >= 0 ? 0 : -5,
      icon: DollarSign,
    },
    {
      title: 'Avg Transaction',
      current: `₹${stats.averageTransaction.toFixed(2)}`,
      previous: '₹0.00',
      growth: 0,
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
                    {metric.growth}%
                  </>
                ) : (
                  <>
                    <TrendingDown className='me-1 size-3' />
                    {metric.growth}%
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
