/**
 * Transaction Type Enums - Match backend C# enums
 */
export const TRANSACTION_TYPES = [
  { value: "INCOME", label: "Income" },
  { value: "EXPENSE", label: "Expense" },
  { value: "TRANSFER", label: "Transfer" },
] as const

/**
 * Category Enums - Match backend C# enums
 */
export const CATEGORIES = [
  // Income categories
  { value: "SALARY", label: "Salary" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "INVESTMENT_INCOME", label: "Investment Income" },
  { value: "GIFT_RECEIVED", label: "Gift Received" },
  { value: "OTHER_INCOME", label: "Other Income" },

  // Expense categories
  { value: "FOOD", label: "Food" },
  { value: "TRANSPORTATION", label: "Transportation" },
  { value: "HOUSING", label: "Housing" },
  { value: "UTILITIES", label: "Utilities" },
  { value: "ENTERTAINMENT", label: "Entertainment" },
  { value: "SHOPPING", label: "Shopping" },
  { value: "HEALTH", label: "Health" },
  { value: "EDUCATION", label: "Education" },
  { value: "PERSONAL_CARE", label: "Personal Care" },
  { value: "DEBT_PAYMENT", label: "Debt Payment" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "TRAVEL", label: "Travel" },
  { value: "GIFTS", label: "Gifts" },
  { value: "DONATIONS", label: "Donations" },
  { value: "OTHER_EXPENSE", label: "Other Expense" },

  // Transfer categories
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "WALLET_TOPUP", label: "Wallet Topup" },
  { value: "CREDIT_CARD_PAYMENT", label: "Credit Card Payment" },
  { value: "LOAN_REPAYMENT", label: "Loan Repayment" },
  { value: "INVESTMENT_TRANSFER", label: "Investment Transfer" },
] as const

/**
 * User Role Enums - Match backend C# enums
 */
export const USER_ROLES = [
  { value: "User", label: "User" },
  { value: "Admin", label: "Admin" },
] as const

/**
 * Recurring Transaction Type Enums - Match backend C# enums
 */
export const RECURRING_TRANSACTION_TYPES = [
  { value: "INCOME", label: "Income" },
  { value: "EXPENSE", label: "Expense" },
] as const

/**
 * Recurring Transaction Category Enums - Categories actually used in recurring transactions
 */
export const RECURRING_TRANSACTION_CATEGORIES = [
  { value: "HOUSING", label: "Housing" },
  { value: "SALARY", label: "Salary" },
  { value: "ENTERTAINMENT", label: "Entertainment" },
  { value: "FOOD", label: "Food" },
  { value: "PERSONAL_CARE", label: "Personal Care" },
  { value: "INVESTMENT_INCOME", label: "Investment Income" },
  { value: "UTILITIES", label: "Utilities" },
  { value: "DEBT_PAYMENT", label: "Debt Payment" },
  { value: "INVESTMENT_TRANSFER", label: "Investment Transfer" },
  { value: "OTHER_EXPENSE", label: "Other Expense" },
] as const

/**
 * Frequency Enums - Match backend C# enums
 */
export const FREQUENCIES = [
  { value: "ONCE", label: "Once" },
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
] as const

/**
 * Investment Type Enums - Match backend C# enums
 */
export const INVESTMENT_TYPES = [
  { value: "STOCK", label: "Stock" },
  { value: "CRYPTO", label: "Cryptocurrency" },
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "MUTUAL_FUND", label: "Mutual Fund" },
  { value: "BOND", label: "Bond" },
  { value: "OTHER", label: "Other" },
] as const

/**
 * Bot Type Enums - Match backend C# enums
 */
export const BOT_TYPES = [
  { value: "FINFOX_ADVICER", label: "FinFox Adviser" },
  { value: "TRANSACTION_HELPER", label: "Transaction Helper" },
] as const

export type TransactionType = typeof TRANSACTION_TYPES[number]["value"]
export type Category = typeof CATEGORIES[number]["value"]
export type UserRole = typeof USER_ROLES[number]["value"]
export type RecurringTransactionType = typeof RECURRING_TRANSACTION_TYPES[number]["value"]
export type Frequency = typeof FREQUENCIES[number]["value"]
export type InvestmentType = typeof INVESTMENT_TYPES[number]["value"]
export type BotType = typeof BOT_TYPES[number]["value"]

/**
 * Helper function to get transaction type label
 */
export function getTransactionTypeLabel(value: string | null | undefined): string {
  if (!value) return ""
  return TRANSACTION_TYPES.find(t => t.value === value?.toUpperCase())?.label || value
}

/**
 * Helper function to get category label
 */
export function getCategoryLabel(value: string | null | undefined): string {
  if (!value) return ""
  return CATEGORIES.find(c => c.value === value?.toUpperCase())?.label || value
}

/**
 * Color mapping for transaction types
 */
export function getTypeColor(type: string | null | undefined): string {
  switch (type?.toUpperCase()) {
    case "INCOME":
      return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
    case "EXPENSE":
      return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
    case "TRANSFER":
      return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20"
    default:
      return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
  }
}

/**
 * Color mapping for categories
 */
export function getCategoryColor(category: string | null | undefined): string {
  const categoryMap: Record<string, string> = {
    SALARY: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20",
    FREELANCE: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20",
    INVESTMENT_INCOME: "text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-900/20",
    GIFT_RECEIVED: "text-pink-600 bg-pink-50 dark:text-pink-400 dark:bg-pink-900/20",
    OTHER_INCOME: "text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/20",
    FOOD: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20",
    TRANSPORTATION: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",
    HOUSING: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20",
    UTILITIES: "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20",
    ENTERTAINMENT: "text-fuchsia-600 bg-fuchsia-50 dark:text-fuchsia-400 dark:bg-fuchsia-900/20",
    SHOPPING: "text-pink-600 bg-pink-50 dark:text-pink-400 dark:bg-pink-900/20",
    HEALTH: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20",
    EDUCATION: "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20",
    PERSONAL_CARE: "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20",
    DEBT_PAYMENT: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20",
    INSURANCE: "text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/20",
    TRAVEL: "text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-900/20",
    GIFTS: "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-900/20",
    DONATIONS: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20",
    OTHER_EXPENSE: "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20",
    BANK_TRANSFER: "text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/20",
    WALLET_TOPUP: "text-lime-600 bg-lime-50 dark:text-lime-400 dark:bg-lime-900/20",
    CREDIT_CARD_PAYMENT: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20",
    LOAN_REPAYMENT: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20",
    INVESTMENT_TRANSFER: "text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-900/20",
  }
  return categoryMap[category?.toUpperCase() || ""] || "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
}

/**
 * Helper function to get user role label
 */
export function getUserRoleLabel(value: string | null | undefined): string {
  if (!value) return ""
  return USER_ROLES.find(r => r.value === value)?.label || value
}

/**
 * Helper function to get recurring transaction type label
 */
export function getRecurringTransactionTypeLabel(value: string | null | undefined): string {
  if (!value) return ""
  return RECURRING_TRANSACTION_TYPES.find(t => t.value === value?.toUpperCase())?.label || value
}

/**
 * Helper function to get frequency label
 */
export function getFrequencyLabel(value: string | null | undefined): string {
  if (!value) return ""
  return FREQUENCIES.find(f => f.value === value?.toUpperCase())?.label || value
}

/**
 * Helper function to get investment type label
 */
export function getInvestmentTypeLabel(value: string | null | undefined): string {
  if (!value) return ""
  return INVESTMENT_TYPES.find(t => t.value === value?.toUpperCase())?.label || value
}

/**
 * Helper function to get bot type label
 */
export function getBotTypeLabel(value: string | null | undefined): string {
  if (!value) return ""
  return BOT_TYPES.find(b => b.value === value?.toUpperCase())?.label || value
}

/**
 * Color mapping for investment types
 */
export function getInvestmentTypeColor(type: string | null | undefined): string {
  const investmentMap: Record<string, string> = {
    STOCK: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",
    CRYPTO: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20",
    REAL_ESTATE: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20",
    MUTUAL_FUND: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20",
    BOND: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20",
    OTHER: "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20",
  }
  return investmentMap[type?.toUpperCase() || ""] || "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
}

/**
 * Color mapping for frequencies
 */
export function getFrequencyColor(frequency: string | null | undefined): string {
  const frequencyMap: Record<string, string> = {
    ONCE: "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20",
    DAILY: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20",
    WEEKLY: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",
    MONTHLY: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20",
    YEARLY: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20",
  }
  return frequencyMap[frequency?.toUpperCase() || ""] || "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
}
