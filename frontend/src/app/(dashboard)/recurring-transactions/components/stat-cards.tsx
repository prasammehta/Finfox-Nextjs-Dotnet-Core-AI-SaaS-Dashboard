"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, Repeat2, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'

interface RecurringTransaction {
  recurringTransactionId: number
  userId: string
  amount: number
  description: string
  category: string
  frequency: string
  startDate: string
  endDate: string | null
  lastGeneratedDate: string
  createdAt: string
  updatedAt: string
  accountId: number
  type: string
}

interface Stats {
  monthlyExpenses: number
  monthlyIncome: number
  netMonthly: number
  totalRecurringCount: number
  activeTransactions: number
}

const defaultStats: Stats = {
  monthlyExpenses: 0,
  monthlyIncome: 0,
  netMonthly: 0,
  totalRecurringCount: 0,
  activeTransactions: 0,
}

interface StatCardsProps {
  recurringTransactions?: RecurringTransaction[]
}

function getFrequencyMultiplier(frequency: string): number {
  const multipliers: Record<string, number> = {
    "WEEKLY": 4.33,  // Average weeks per month
    "MONTHLY": 1,
    "YEARLY": 1/12,
  }
  return multipliers[frequency] || 1
}

function isActiveTransaction(transaction: RecurringTransaction): boolean {
  const today = new Date()
  const startDate = new Date(transaction.startDate)
  const endDate = transaction.endDate ? new Date(transaction.endDate) : null
  
  return startDate <= today && (!endDate || today <= endDate)
}

export function StatCards({ recurringTransactions = [] }: StatCardsProps) {
  // Calculate stats from recurring transactions
  const stats = useMemo(() => {
    if (!recurringTransactions || recurringTransactions.length === 0) return defaultStats

    let monthlyExpenses = 0
    let monthlyIncome = 0
    let activeCount = 0

    recurringTransactions.forEach(t => {
      const multiplier = getFrequencyMultiplier(t.frequency)
      const monthlyAmount = t.amount * multiplier

      if (t.type === "EXPENSE") {
        monthlyExpenses += monthlyAmount
      } else if (t.type === "INCOME") {
        monthlyIncome += monthlyAmount
      }

      if (isActiveTransaction(t)) {
        activeCount += 1
      }
    })

    const netMonthly = monthlyIncome - monthlyExpenses

    return {
      monthlyExpenses,
      monthlyIncome,
      netMonthly,
      totalRecurringCount: recurringTransactions.length,
      activeTransactions: activeCount,
    }
  }, [recurringTransactions])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const performanceMetrics = [
    {
      title: 'Monthly Income',
      current: formatCurrency(stats.monthlyIncome),
      previous: '₹0.00',
      growth: 0,
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'Monthly Expenses',
      current: formatCurrency(stats.monthlyExpenses),
      previous: '₹0.00',
      growth: stats.monthlyExpenses > 0 ? -stats.monthlyExpenses : 0,
      icon: TrendingDown,
      color: 'text-red-600',
    },
    {
      title: 'Net Monthly',
      current: formatCurrency(stats.netMonthly),
      previous: '₹0.00',
      growth: stats.netMonthly >= 0 ? 1 : -1,
      icon: DollarSign,
      color: stats.netMonthly >= 0 ? 'text-green-600' : 'text-red-600',
    },
    {
      title: 'Active Recurring',
      current: `${stats.activeTransactions}/${stats.totalRecurringCount}`,
      previous: '0',
      growth: 0,
      icon: Repeat2,
      color: 'text-blue-600',
    },
  ]
  
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {performanceMetrics.map((metric, index) => (
        <Card key={index} className='border'>
          <CardContent className='space-y-4 pt-6'>
            <div className='flex items-center justify-between'>
              <metric.icon className={`${metric.color} size-6`} />
            </div>

            <div className='space-y-2'>
              <p className='text-muted-foreground text-sm font-medium'>{metric.title}</p>
              <div className='text-2xl font-bold'>{metric.current}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}