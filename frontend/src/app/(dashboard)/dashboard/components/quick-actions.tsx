"use client"

import { Plus, Download, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDashboardMetrics } from "../hooks/useDashboardMetrics"

export function QuickActions() {
  const { savingsRate } = useDashboardMetrics()

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className={`px-3 py-1 rounded-full text-sm font-medium ${savingsRate >= 20 ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200"}`}>
        <TrendingUp className="inline h-4 w-4 mr-1" />
        Savings: {savingsRate.toFixed(1)}%
      </div>
      <div className="flex gap-2">
        <Button size="sm" className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
        <Button variant="outline" size="sm" className="cursor-pointer">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  )
}
