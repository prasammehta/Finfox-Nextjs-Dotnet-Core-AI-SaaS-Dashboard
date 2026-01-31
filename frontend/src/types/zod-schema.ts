import { z } from "zod"

// ============================================================================
// ACCOUNT SCHEMAS
// ============================================================================

export const accountFormSchema = z.object({
  name: z.string().min(2, {
    message: "Account name must be at least 2 characters.",
  }),
  initialBalance: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Initial balance must be 0 or greater.",
  }),
  currentBalance: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Current balance must be 0 or greater.",
  }),
})

export type AccountFormValues = z.infer<typeof accountFormSchema>

// ============================================================================
// TRANSACTION SCHEMAS
// ============================================================================

export const transactionFormSchema = z.object({
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number.",
  }),
  description: z.string().min(3, {
    message: "Description must be at least 3 characters.",
  }),
  type: z.string().min(1, {
    message: "Please select a transaction type.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  fromAccountId: z.string().min(1, {
    message: "Please select an account.",
  }),
})

export type TransactionFormValues = z.infer<typeof transactionFormSchema>

// ============================================================================
// RECURRING TRANSACTION SCHEMAS
// ============================================================================

export const recurringTransactionFormSchema = z.object({
  description: z.string().min(3, {
    message: "Description must be at least 3 characters.",
  }),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be greater than 0.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  frequency: z.string().min(1, {
    message: "Please select a frequency.",
  }),
  type: z.string().min(1, {
    message: "Please select a type.",
  }),
  startDate: z.string().min(1, {
    message: "Please select a start date.",
  }),
  endDate: z.string().optional(),
  accountId: z.string().min(1, {
    message: "Please select an account.",
  }),
})

export type RecurringTransactionFormValues = z.infer<typeof recurringTransactionFormSchema>

// ============================================================================
// DEBT SCHEMAS
// ============================================================================

export const debtFormSchema = z.object({
  personName: z.string().min(3, {
    message: "Creditor/Person name must be at least 3 characters.",
  }),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number.",
  }),
  debtType: z.string().min(1, {
    message: "Please select a debt type.",
  }),
  status: z.string().min(1, {
    message: "Please select a status.",
  }),
  paidAmount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Paid amount must be 0 or greater.",
  }),
  date: z.string().min(1, {
    message: "Please select a date.",
  }),
})

export type DebtFormValues = z.infer<typeof debtFormSchema>

// ============================================================================
// INVESTMENT SCHEMAS
// ============================================================================

export const investmentFormSchema = z.object({
  name: z.string().min(3, {
    message: "Investment name must be at least 3 characters.",
  }),
  type: z.string().min(1, {
    message: "Please select an investment type.",
  }),
  initialAmount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Initial amount must be a positive number.",
  }),
  currentValue: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Current value must be a positive number.",
  }),
  dateAcquired: z.string().min(1, {
    message: "Please select a date.",
  }),
})

export type InvestmentFormValues = z.infer<typeof investmentFormSchema>

// ============================================================================
// BILL SCHEMAS
// ============================================================================

export const billFormSchema = z.object({
  invoiceNumber: z.string().min(1, {
    message: "Invoice number is required.",
  }),
  client: z.string().min(1, {
    message: "Client name is required.",
  }),
  billFromId: z.string().min(1, {
    message: "Please select a company (Bill From).",
  }),
  billToId: z.string().min(1, {
    message: "Please select a client company (Bill To).",
  }),
  issueDate: z.string().min(1, {
    message: "Please select an issue date.",
  }),
  dueDate: z.string().min(1, {
    message: "Please select a due date.",
  }),
  gstRate: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "GST rate must be 0 or greater.",
  }),
  tdsPercent: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "TDS percent must be 0 or greater.",
  }),
  subtotal: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Subtotal must be 0 or greater.",
  }),
  billItems: z.string().min(1, {
    message: "Bill items cannot be empty.",
  }),
})

export type BillFormValues = z.infer<typeof billFormSchema>

export const billCompanyFormSchema = z.object({
  name: z.string().min(3, {
    message: "Company name must be at least 3 characters.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  gstin: z.string().optional().or(z.literal("")),
  pan: z.string().optional().or(z.literal("")),
  tdsPercent: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  accountName: z.string().optional().or(z.literal("")),
  accountNumber: z.string().optional().or(z.literal("")),
  ifscCode: z.string().optional().or(z.literal("")),
})

export type BillCompanyFormValues = z.infer<typeof billCompanyFormSchema>

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const userFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.email({
    message: "Please enter a valid email address.",
  }),
  passwordHash: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }).optional().or(z.literal("")),
})

export type UserFormValues = z.infer<typeof userFormSchema>

// ============================================================================
// SETTINGS SCHEMAS
// ============================================================================

// Account Settings
export const accountSettingsFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
})

export type AccountSettingsFormValues = z.infer<typeof accountSettingsFormSchema>

// User Settings
export const userSettingsFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional(),
  role: z.string().optional(),
  bio: z.string().optional(),
  company: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
})

export type UserSettingsFormValues = z.infer<typeof userSettingsFormSchema>

// Appearance Settings
export const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark"]),
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  sidebarWidth: z.string().optional(),
  contentWidth: z.string().optional(),
})

export type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

// Notifications Settings
export const notificationsFormSchema = z.object({
  emailSecurity: z.boolean(),
  emailUpdates: z.boolean(),
  emailMarketing: z.boolean(),
  pushMessages: z.boolean(),
  pushMentions: z.boolean(),
  pushTasks: z.boolean().optional(),
  emailFrequency: z.string().optional(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
  channelEmail: z.boolean().optional(),
  channelPush: z.boolean().optional(),
  channelSms: z.boolean().optional(),
  // New notification table fields
  orderUpdatesEmail: z.boolean(),
  orderUpdatesBrowser: z.boolean(),
  orderUpdatesApp: z.boolean(),
  invoiceRemindersEmail: z.boolean(),
  invoiceRemindersBrowser: z.boolean(),
  invoiceRemindersApp: z.boolean(),
  promotionalOffersEmail: z.boolean(),
  promotionalOffersBrowser: z.boolean(),
  promotionalOffersApp: z.boolean(),
  systemMaintenanceEmail: z.boolean(),
  systemMaintenanceBrowser: z.boolean(),
  systemMaintenanceApp: z.boolean(),
  notificationTiming: z.string(),
})

export type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

// ============================================================================
// CONTACT & NEWSLETTER SCHEMAS
// ============================================================================

export const contactFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>

export const newsletterSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

export type NewsletterValues = z.infer<typeof newsletterSchema>