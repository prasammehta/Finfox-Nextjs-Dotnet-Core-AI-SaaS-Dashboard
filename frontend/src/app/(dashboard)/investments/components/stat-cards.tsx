"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, TrendingUp, TrendingDown, ArrowUpRight, DollarSign, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'

interface Investment {
  investmentId: number
  userId: string
  name: string
  type: string
  initialAmount: number
  currentValue: number
  dateAcquired: string
  createdAt: string
  updatedAt: string
}

interface Stats {
  totalInvested: number
  totalValue: number
  totalGain: number
  gainPercentage: number
}

const defaultStats: Stats = {
  totalInvested: 0,
  totalValue: 0,
  totalGain: 0,
  gainPercentage: 0,
}

interface StatCardsProps {
  investments?: Investment[]
}

export function StatCards({ investments = [] }: StatCardsProps) {
  // Calculate stats from investments
  const stats = useMemo(() => {
    if (!investments || investments.length === 0) return defaultStats

    const totalInvested = investments.reduce((sum, inv) => sum + (inv.initialAmount || 0), 0)
    const totalValue = investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0)
    const totalGain = totalValue - totalInvested
    const gainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0

    return {
      totalInvested,
      totalValue,
      totalGain,
      gainPercentage,
    }
  }, [investments])

  const performanceMetrics = [
    {
      title: 'Total Invested',
      current: `₹${stats.totalInvested.toFixed(2)}`,
      previous: '₹0.00',
      growth: 0,
      icon: CreditCard,
    },
    {
      title: 'Current Value',
      current: `₹${stats.totalValue.toFixed(2)}`,
      previous: '₹0.00',
      growth: stats.gainPercentage,
      icon: TrendingUp,
    },
    {
      title: 'Total Gain/Loss',
      current: `₹${stats.totalGain.toFixed(2)}`,
      previous: '₹0.00',
      growth: stats.gainPercentage >= 0 ? stats.gainPercentage : stats.gainPercentage,
      icon: DollarSign,
    },
    {
      title: 'Gain %',
      current: `${stats.gainPercentage.toFixed(2)}%`,
      previous: '0.00%',
      growth: stats.gainPercentage,
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
