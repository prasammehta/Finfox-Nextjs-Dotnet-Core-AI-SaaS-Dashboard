"use client"

import { useEffect, useState } from "react"
import { useTransactions } from "@/hooks/api/useTransactions"
import { useRecurringTransactions } from "@/hooks/api/useRecurringTransactions"
import { useAccounts } from "@/hooks/api/useAccounts"
import { useDebts } from "@/hooks/api/useDebts"
import { useInvestments } from "@/hooks/api/useInvestments"

export interface DashboardMetrics {
  totalBalance: number
  totalIncome: number
  totalExpenses: number
  netWorth: number
  recurringMonthly: number
  debtAmount: number
  investmentValue: number
  savingsRate: number
}

export function useDashboardMetrics(): DashboardMetrics & { loading: boolean; error: string | null } {
  const { data: transactions, loading: txLoading } = useTransactions()
  const { data: recurringTransactions, loading: rtLoading } = useRecurringTransactions()
  const { data: accounts, loading: accLoading } = useAccounts()
  const { data: debts, loading: debtLoading } = useDebts()
  const { data: investments, loading: invLoading } = useInvestments()
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    netWorth: 0,
    recurringMonthly: 0,
    debtAmount: 0,
    investmentValue: 0,
    savingsRate: 0,
  })

  useEffect(() => {
    const loading = txLoading || rtLoading || accLoading || debtLoading || invLoading
    if (loading) return

    // Calculate account balances
    const totalBalance = Array.isArray(accounts) ? accounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0) : 0

    // Calculate income and expenses from transactions
    const totalIncome = Array.isArray(transactions)
      ? transactions
          .filter((t) => t.type?.toLowerCase() === "income")
          .reduce((sum, t) => sum + (t.amount || 0), 0)
      : 0

    const totalExpenses = Array.isArray(transactions)
      ? transactions
          .filter((t) => t.type?.toLowerCase() === "expense")
          .reduce((sum, t) => sum + (t.amount || 0), 0)
      : 0

    // Calculate recurring monthly amounts
    const recurringMonthly = Array.isArray(recurringTransactions)
      ? recurringTransactions.reduce((sum, rt) => {
          const multiplier = getFrequencyMultiplier(rt.frequency)
          return sum + (rt.amount * multiplier)
        }, 0)
      : 0

    // Calculate total debt
    const debtAmount = Array.isArray(debts) ? debts.reduce((sum, d) => sum + (d.amount || 0), 0) : 0

    // Calculate investment value
    const investmentValue = Array.isArray(investments)
      ? investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0)
      : 0

    // Calculate net worth (accounts + investments - debts)
    const netWorth = totalBalance + investmentValue - debtAmount

    // Calculate savings rate
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

    setMetrics({
      totalBalance,
      totalIncome,
      totalExpenses,
      netWorth,
      recurringMonthly,
      debtAmount,
      investmentValue,
      savingsRate,
    })
  }, [transactions, recurringTransactions, accounts, debts, investments, txLoading, rtLoading, accLoading, debtLoading, invLoading])

  return {
    ...metrics,
    loading: txLoading || rtLoading || accLoading || debtLoading || invLoading,
    error: null,
  }
}

function getFrequencyMultiplier(frequency: string): number {
  const multipliers: Record<string, number> = {
    WEEKLY: 4.33,
    MONTHLY: 1,
    YEARLY: 1 / 12,
  }
  return multipliers[frequency] || 1
}
