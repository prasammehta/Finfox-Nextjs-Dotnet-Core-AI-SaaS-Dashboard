// Investments DataTable interfaces
export interface InvestmentDT {
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

export interface InvestmentFormValuesDT {
  name: string
  type: string
  initialAmount: string
  currentValue: string
  dateAcquired: string
}

export interface InvestmentsDataTablePropsDT {
  investments: InvestmentDT[]
  loading: boolean
  onDeleteInvestment: (id: number) => void
  onEditInvestment: (investment: InvestmentDT) => void
  onInvestmentUpdated: () => void
  nameFilter: string
  setNameFilter: (value: string) => void
  typeFilter: string
  setTypeFilter: (value: string) => void
  gainLossGreaterThan: string
  setGainLossGreaterThan: (value: string) => void
  gainLossLessThan: string
  setGainLossLessThan: (value: string) => void
  returnPercentGreaterThan: string
  setReturnPercentGreaterThan: (value: string) => void
  dateAcquired: string
  setDateAcquired: (value: string) => void
}

// Accounts DataTable interfaces
export interface AccountDT {
  accountId: number
  userId: string
  name: string
  initialBalance: number
  currentBalance: number
  createdAt: string
  updatedAt: string
}

export interface AccountFormValuesDT {
  name: string
  initialBalance: string
  currentBalance: string
}

export interface AccountsDataTablePropsDT {
  accounts: AccountDT[]
  loading: boolean
  onDeleteAccount: (id: number) => void
  onEditAccount: (account: AccountDT) => void
  onAccountUpdated: () => void
}

// Bills DataTable interfaces
export interface BillItemDT {
  item?: string
  quantity?: number
  amount?: number
  [key: string]: string | number | undefined
}

export interface BillDT {
  billId: number
  userId: string
  billFromId: number
  billToId: number
  invoiceNumber: string
  client: string
  issueDate: string
  dueDate: string
  gstRate: number
  tdsPercent: number
  subtotal: number
  gstAmount: number
  totalAmount: number
  billItems: BillItemDT[]
  createdAt: string
  updatedAt: string
}

export interface BillFormValuesDT {
  invoiceNumber: string
  billFromId: string
  billToId: string
  client: string
  issueDate: string
  dueDate: string
  gstRate: string
  tdsPercent: string
  subtotal: string
  billItems: string
}

export interface BillsDataTablePropsDT {
  bills: BillDT[]
  loading: boolean
  onDeleteBill: (id: number) => void
  onEditBill: (bill: BillDT) => void
  onBillUpdated: () => void
}

// Debts DataTable interfaces
export interface DebtDT {
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

export interface DebtFormValuesDT {
  personName: string
  amount: string
  debtType: string
  status: string
  paidAmount: string
  date: string
}

export interface DebtsDataTablePropsDT {
  debts: DebtDT[]
  accounts: Array<{ accountId: number; name: string }>
  loading: boolean
  onDeleteDebt: (id: number) => void
  onEditDebt: (debt: DebtDT) => void
  onDebtUpdated: () => void
}

// Recurring Transactions DataTable interfaces
export interface RecurringTransactionDT {
  recurringTransactionId: number
  userId: string
  amount: number
  description: string
  category: string
  frequency: string
  startDate: string
  endDate: string | null
  lastGeneratedDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  accountId: number
  type: string
}

export interface RecurringTransactionsDataTablePropsDT {
  recurringTransactions: RecurringTransactionDT[]
  accounts: Array<{ accountId: number; name: string }>
  loading: boolean
  onDeleteTransaction: (id: number) => void
  onEditTransaction: (transaction: RecurringTransactionDT) => void
  onTransactionUpdated: () => void
}

// Transactions DataTable interfaces
export interface TransactionDT {
  transactionId: number
  userId: string
  amount: number
  description: string
  type: string
  category: string
  fromAccountId: number
  createdAt: string
  date: string
}

export interface AccountDTForTransactions {
  accountId: number
  name: string
}

export interface TransactionFormValuesDT {
  amount: string
  description: string
  type: string
  category: string
  fromAccountId: string
}

export interface TransactionsDataTablePropsDT {
  transactions: TransactionDT[]
  accounts: AccountDTForTransactions[]
  loading: boolean
  onDeleteTransaction: (id: number) => void
  onEditTransaction: (transaction: TransactionDT) => void
  onTransactionUpdated: () => void
  typeFilter: string
  setTypeFilter: (value: string) => void
  categoryFilter: string
  setCategoryFilter: (value: string) => void
  startDate: string
  setStartDate: (value: string) => void
  endDate: string
  setEndDate: (value: string) => void
  fromAccountId: string
  setFromAccountId: (value: string) => void
  amountGreaterThan: string
  setAmountGreaterThan: (value: string) => void
  amountLessThan: string
  setAmountLessThan: (value: string) => void
  pageIndex?: number
  pageSize?: number
  totalCount?: number
  totalPages?: number
  hasPreviousPage?: boolean
  hasNextPage?: boolean
  onPageIndexChange?: (pageIndex: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

// Users DataTable interfaces
export interface UserDT {
  userId: string
  email: string
  name: string
  passwordHash: string
  createdAt: string
  updatedAt: string
}

export interface UsersDataTablePropsDT {
  users: UserDT[]
  onDeleteUser: (userId: string) => void
  onEditUser: (user: UserDT) => void
  onAddUser: (userData: Omit<UserDT, 'userId' | 'createdAt' | 'updatedAt'>) => void
}
