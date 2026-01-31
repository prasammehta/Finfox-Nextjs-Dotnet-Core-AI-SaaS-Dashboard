// ============================================================================
// GENERIC API RESPONSE INTERFACE
// ============================================================================

export interface ApiResponse<T = any> {
  data: T
  message: string
  status: boolean
}

// ============================================================================
// AUTH INTERFACES
// ============================================================================

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface User {
  userId: string
  name: string
  email: string
}

export interface UserObject {
  userId: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
  updatedAt: string
}

export interface AuthTokenData {
  token: string
  refreshToken?: string
  user: User
}

/**
 * Account balance response
 */
export interface AccountBalance {
  accountId: number
  currentBalance: number
}


// ============================================================================
// ACCOUNT INTERFACES & CRUD OPERATIONS
// ============================================================================

export interface Account {
  accountId: number
  userId: string
  name: string
  initialBalance: number
  currentBalance: number
  createdAt: string
  updatedAt: string
}

export interface CreateAccountRequest {
  userId: string
  name: string | null
  initialBalance: number
}

export interface UpdateAccountRequest {
  accountId?: number
  userId?: string
  name?: string | null
  initialBalance?: number
  currentBalance?: number
}

// ============================================================================
// BILL COMPANY INTERFACES & CRUD OPERATIONS
// ============================================================================

export interface BillCompany {
  billCompanyId: number
  userId: string
  name: string
  address: string
  gstin?: string | null
  pan?: string | null
  tdsPercent?: string | null
  email?: string | null
  phone?: string | null
  accountName?: string | null
  accountNumber?: string | null
  ifscCode?: string | null
  logoUrl?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateBillCompanyRequest {
  userId: string
  name: string
  address: string
  gstin?: string | null
  pan?: string | null
  tdsPercent?: string | null
  email?: string | null
  phone?: string | null
  accountName?: string | null
  accountNumber?: string | null
  ifscCode?: string | null
  logoUrl?: string | null
}

export interface UpdateBillCompanyRequest {
  billCompanyId?: number
  userId?: string
  name?: string
  address?: string
  gstin?: string | null
  pan?: string | null
  tdsPercent?: string | null
  email?: string | null
  phone?: string | null
  accountName?: string | null
  accountNumber?: string | null
  ifscCode?: string | null
  logoUrl?: string | null
}

// ============================================================================
// BILL INTERFACES & CRUD OPERATIONS
// ============================================================================
export interface BillItem {
  item?: string
  quantity?: number
  amount?: number
  [key: string]: string | number | undefined
}
export interface Bill {
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
  billItems: BillItem[] // Array of BillItem objects
  createdAt: string
  updatedAt: string
}

export interface CreateBillRequest {
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
  billItems: string[] // Array of JSON strings
}

export interface UpdateBillRequest {
  billId?: number
  userId?: string
  billFromId?: number
  billToId?: number
  invoiceNumber?: string
  client?: string
  issueDate?: string
  dueDate?: string
  gstRate?: number
  tdsPercent?: number
  subtotal?: number
  gstAmount?: number
  totalAmount?: number
  billItems?: string[] // Array of JSON strings
}

// ============================================================================
// DEBT INTERFACES & CRUD OPERATIONS
// ============================================================================

export interface Debt {
  debtId: number
  userId: string
  personName: string
  amount: number
  debtType: string
  date: string
  dueDate?: string | null
  notes?: string | null
  status: string
  paidAmount: number
  createdAt: string
  updatedAt: string
}

export interface CreateDebtRequest {
  userId: string
  personName: string | null
  amount: number
  debtType: string | null
  date: string
  dueDate?: string | null
  notes?: string | null
  status?: string | null
}

export interface UpdateDebtRequest {
  debtId?: number
  userId?: string
  personName?: string | null
  amount?: number
  debtType?: string | null
  date?: string
  dueDate?: string | null
  notes?: string | null
  status?: string | null
  paidAmount?: number
}

/**
 * Total debt response
 */
export interface TotalDebt {
  totalDebt: number
}

// ============================================================================
// INVESTMENT INTERFACES & CRUD OPERATIONS
// ============================================================================

export interface Investment {
  investmentId: number
  userId: string
  name: string
  type: string
  initialAmount: number
  currentValue: number
  dateAcquired: string
  notes?: string | null
  gainLoss?: number
  gainLossPercentage?: number
  createdAt: string
  updatedAt: string
}

export interface CreateInvestmentRequest {
  userId: string
  name: string | null
  type: string | null
  initialAmount: number
  currentValue: number
  dateAcquired: string
  notes?: string | null
}

export interface UpdateInvestmentRequest {
  investmentId?: number
}

/**
 * Total investment value response
 */
export interface TotalInvestmentValue {
  totalValue: number
}

/**
 * Investment gain/loss response
 */
export interface InvestmentGainLossResponse {
  gainLoss: number
  gainLossPercentage: number
  userId?: string
  name?: string | null
  type?: string | null
  initialAmount?: number
  currentValue?: number
  dateAcquired?: string
  notes?: string | null
}

// ============================================================================
// RECURRING TRANSACTION INTERFACES & CRUD OPERATIONS
// ============================================================================

export interface RecurringTransaction {
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

export interface CreateRecurringTransactionRequest {
  userId: string
  accountId: number
  amount: number
  description: string | null
  category: string | null
  frequency: string | null
  type: string | null
  startDate: string
  endDate?: string | null
}

export interface UpdateRecurringTransactionRequest {
  recurringTransactionId?: number
  userId?: string
  accountId?: number
  amount?: number
  description?: string | null
  category?: string | null
  frequency?: string | null
  type?: string | null
  startDate?: string
  endDate?: string | null
  isActive?: boolean
}

// ============================================================================
// TRANSACTION INTERFACES & CRUD OPERATIONS
// ============================================================================

export interface Transaction {
  transactionId: number
  userId: string
  amount: number
  date: string
  description: string
  type: string
  category: string
  fromAccountId: number
  createdAt: string
  toAccountId?: number | null
  debtId?: number | null
  recurringTransactionId?: number | null
  updatedAt?: string
}

export interface CreateTransactionRequest {
  userId: string
  amount: number
  date: string
  description: string | null
  type: string | null
  category: string | null
  fromAccountId?: number | null
  toAccountId?: number | null
  debtId?: number | null
  recurringTransactionId?: number | null
}

export interface UpdateTransactionRequest {
  transactionId?: number
  userId?: string
  amount?: number
  date?: string
  description?: string | null
  type?: string | null
  category?: string | null
  fromAccountId?: number | null
  toAccountId?: number | null
  debtId?: number | null
  recurringTransactionId?: number | null
}

// ============================================================================
// USER INTERFACES & CRUD OPERATIONS
// ============================================================================

export interface AppUser {
  id: string
  name: string
  email: string
  role: string
  status: string
  department?: string
  joinedDate?: string
  avatar?: string
}

export interface CreateUserRequest {
  name: string
  email: string 
  password: string

}

export interface UpdateUserRequest {
  userId?: string
  name?: string | null
  email?: string | null
}

// ============================================================================
// AUTH INTERFACES
// ============================================================================

export interface RegisterRequest {
  name: string | null
  email: string | null
  password: string | null
}

export interface LoginRequest {
  email: string | null
  password: string | null
}

// Calendar interfaces
export interface CalendarEvent {
  id: number
  title: string
  date: Date
  time: string
  duration: string
  type: "meeting" | "event" | "personal" | "task" | "reminder"
  attendees?: string[]
  location?: string
  color: string
  description?: string
}

export interface Calendar {
  id: string
  name: string
  color: string
  visible: boolean
  type: "personal" | "work" | "shared"
}

export interface CalendarItem {
  id: string
  name: string
  color: string
  visible: boolean
  type: "personal" | "work" | "shared"
}

export interface CalendarGroup {
  name: string
  items: CalendarItem[]
}

// Calendar hook interfaces
export interface UseCalendarState {
  selectedDate: Date
  showEventForm: boolean
  editingEvent: CalendarEvent | null
  showCalendarSheet: boolean
  events: CalendarEvent[]
}

export interface UseCalendarActions {
  setSelectedDate: (date: Date) => void
  setShowEventForm: (show: boolean) => void
  setEditingEvent: (event: CalendarEvent | null) => void
  setShowCalendarSheet: (show: boolean) => void
  handleDateSelect: (date: Date) => void
  handleNewEvent: () => void
  handleNewCalendar: () => void
  handleSaveEvent: (eventData: Partial<CalendarEvent>) => void
  handleDeleteEvent: (eventId: number) => void
  handleEditEvent: (event: CalendarEvent) => void
}

export interface UseCalendarReturn extends UseCalendarState, UseCalendarActions { }

// Chat interfaces
export interface ChatUser {
  id: string
  name: string
  email: string
  avatar: string
  status: "online" | "away" | "offline"
  lastSeen: string
  role: string
  department: string
}

export interface ChatMessage {
  id: string
  content: string
  timestamp: string
  senderId: string
  type: "text" | "image" | "file"
  isEdited: boolean
  reactions: Array<{
    emoji: string
    users: string[]
    count: number
  }>
  replyTo: string | null
}

export interface ChatConversation {
  id: string
  type: "direct" | "group"
  participants: string[]
  name: string
  avatar: string
  lastMessage: {
    id: string
    content: string
    timestamp: string
    senderId: string
  }
  unreadCount: number
  isPinned: boolean
  isMuted: boolean
}

// ============================================================================
// PRICING AND BILLING INTERFACES
// ============================================================================

export interface PricingPlan {
  id: string
  name: string
  description: string
  price: string
  frequency: string
  features: string[]
  popular?: boolean
  current?: boolean
}

export interface FAQ {
  id: number
  question: string
  answer: string
  category?: string
}

export interface FAQCategory {
  name: string
  count: number
}

export interface Feature {
  id: number
  name: string
  description: string
  icon: string
}

export interface FeatureItem {
  id: number
  title: string
  description: string
  icon: string
}

export interface BillingHistoryItem {
  id: number
  month: string
  plan: string
  amount: string
  status: string
}

export interface CurrentPlan {
  planName: string
  price: string
  nextBilling: string
  status: string
  daysUsed: number
  totalDays: number
  progressPercentage: number
  remainingDays: number
  needsAttention: boolean
  attentionMessage: string
}

// ============================================================================
// SIDEBAR AND THEME INTERFACES
// ============================================================================

export interface SidebarConfig {
  variant: "sidebar" | "floating" | "inset"
  collapsible: "offcanvas" | "icon" | "none"
  side: "left" | "right"
}

export interface SidebarContextValue {
  config: SidebarConfig
  updateConfig: (config: Partial<SidebarConfig>) => void
}

export interface ThemePreset {
  label?: string
  styles: {
    light: Record<string, string>
    dark: Record<string, string>
  }
}

export interface ColorTheme {
  name: string
  value: string
  preset: ThemePreset
}

export interface SidebarVariant {
  name: string
  value: "sidebar" | "floating" | "inset"
  description: string
}

export interface SidebarCollapsibleOption {
  name: string
  value: "offcanvas" | "icon" | "none"
  description: string
}

export interface SidebarSideOption {
  name: string
  value: "left" | "right"
}

export interface RadiusOption {
  name: string
  value: string
}

export interface BrandColor {
  name: string
  cssVar: string
}

export interface ImportedTheme {
  light: Record<string, string>
  dark: Record<string, string>
}

// Search interface
export interface SearchItem {
  title: string
  url: string
  group: string
  icon?: unknown
}