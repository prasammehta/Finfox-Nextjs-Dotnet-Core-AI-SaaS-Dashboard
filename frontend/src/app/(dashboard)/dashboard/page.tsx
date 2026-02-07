import { MetricsOverview } from "./components/metrics-overview"
import { IncomeExpenseChart } from "./components/income-expense-chart"
import { RecentTransactions } from "./components/recent-transactions"
import { FinancialInsights } from "./components/financial-insights"
import { QuickActions } from "./components/quick-actions"
import { RevenueBreakdown } from "./components/revenue-breakdown"
import { AssetAllocationChart } from "./components/asset-allocation"
import { WeeklyActivityChart } from "./components/weekly-activity"
import { InvestmentPerformanceChart } from "./components/investment-performance"

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-6 px-6 pt-0 pb-10">
      {/* Enhanced Header */}
      <div className="flex md:flex-row flex-col md:items-center justify-between gap-4 md:gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your finances and track your wealth growth in real-time
          </p>
        </div>
        <QuickActions />
      </div>

      {/* Main Dashboard Grid */}
      <div className="@container/main space-y-6">
        {/* Top Row - Key Financial Metrics */}
        <MetricsOverview />

        {/* Section 1: Overview & Allocation */}
        <div className="grid gap-6 grid-cols-1 @4xl:grid-cols-2 @7xl:grid-cols-3">
          <AssetAllocationChart />
          <RevenueBreakdown />
          <IncomeExpenseChart />
        </div>

        {/* Section 3: Insights & Transactions */}
        <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
          <FinancialInsights />
          <RecentTransactions />
        </div>

        {/* Section 4: Activity & Performance */}
        <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
          <WeeklyActivityChart />
          <InvestmentPerformanceChart />
        </div>
      </div>
    </div>
  )
}
