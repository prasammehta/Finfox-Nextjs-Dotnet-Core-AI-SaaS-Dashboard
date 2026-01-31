"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, TrendingUp, TrendingDown, ArrowUpRight, DollarSign, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'
import { Bill, BillItem } from "@/types/schema"


interface Stats {
  totalBillAmount: number
  totalTax: number
  totalWithTax: number
  overdueBillsCount: number
  averageBillAmount: number
}

const defaultStats: Stats = {
  totalBillAmount: 0,
  totalTax: 0,
  totalWithTax: 0,
  overdueBillsCount: 0,
  averageBillAmount: 0,
}

interface StatCardsProps {
  bills?: Bill[]
}

function calculateBillAmount(billItems: BillItem[] | undefined | null): number {
  if (!billItems || !Array.isArray(billItems)) return 0
  
  return billItems.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : 0
    const quantity = typeof item.quantity === 'number' ? item.quantity : 0
    const amount = typeof item.amount === 'number' ? item.amount : 0
    const cost = typeof item.cost === 'number' ? item.cost : 0
    const premium = typeof item.premium === 'number' ? item.premium : 0
    const rate = typeof item.rate === 'number' ? item.rate : 0
    const hours = typeof item.hours === 'number' ? item.hours : 0
    const usage = typeof item.usage === 'string' ? parseFloat(item.usage.match(/\d+/)?.[0] || '0') : 0
    
    const itemTotal = (price && quantity ? price * quantity : 0) +
                      amount +
                      cost +
                      premium +
                      (rate && usage ? usage * rate : 0) +
                      (hours && rate ? hours * rate : 0)
    return sum + itemTotal
  }, 0)
}

export function StatCards({ bills = [] }: StatCardsProps) {
  // Calculate stats from bills
  const stats = useMemo(() => {
    if (!bills || bills.length === 0) return defaultStats

    const now = new Date()
    let totalBillAmount = 0
    let totalTax = 0
    let overdueBillsCount = 0

    bills.forEach(bill => {
      const billAmount = calculateBillAmount(bill.billItems)
      totalBillAmount += billAmount
      totalTax += bill.gstAmount || 0

      if (new Date(bill.dueDate) < now) {
        overdueBillsCount += 1
      }
    })

    const totalWithTax = totalBillAmount + totalTax
    const averageBillAmount = bills.length > 0 ? totalBillAmount / bills.length : 0

    return {
      totalBillAmount,
      totalTax,
      totalWithTax,
      overdueBillsCount,
      averageBillAmount,
    }
  }, [bills])

  const performanceMetrics = [
    {
      title: 'Total Bill Amount',
      current: `₹${stats.totalBillAmount.toFixed(2)}`,
      previous: '₹0.00',
      growth: 0,
      icon: CreditCard,
    },
    {
      title: 'Total Tax',
      current: `₹${stats.totalTax.toFixed(2)}`,
      previous: '₹0.00',
      growth: 0,
      icon: DollarSign,
    },
    {
      title: 'Total (With Tax)',
      current: `₹${stats.totalWithTax.toFixed(2)}`,
      previous: '₹0.00',
      growth: 0,
      icon: TrendingUp,
    },
    {
      title: 'Overdue Bills',
      current: `${stats.overdueBillsCount}`,
      previous: '0',
      growth: stats.overdueBillsCount > 0 ? -stats.overdueBillsCount : 0,
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
