"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { recurringTransactionFormSchema, type RecurringTransactionFormValues } from "@/types/zod-schema"
import { createRecurringTransaction, updateRecurringTransaction } from "@/services/recurringTransactionService"
import { toast } from "sonner"
import { RecurringTransaction } from "@/types/schema"

interface RecurringTransactionFormDialogProps {
  recurringTransaction?: RecurringTransaction | null
  accounts?: { accountId: number; name: string }[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onTransactionSaved?: () => void
  children?: React.ReactNode
}

const CATEGORIES = [
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
]

const FREQUENCIES = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
]

const TYPES = [
  { value: "INCOME", label: "Income" },
  { value: "EXPENSE", label: "Expense" },
]

export function RecurringTransactionFormDialog({
  recurringTransaction = null,
  accounts = [],
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onTransactionSaved,
  children,
}: RecurringTransactionFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const onOpenChange = controlledOnOpenChange || setInternalOpen

  const isEditMode = !!recurringTransaction

  const form = useForm<RecurringTransactionFormValues>({
    resolver: zodResolver(recurringTransactionFormSchema),
    defaultValues: {
      description: "",
      amount: "0.00",
      category: "",
      frequency: "MONTHLY",
      type: "EXPENSE",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      accountId: "1",
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (recurringTransaction && open && isEditMode) {
      form.reset({
        description: recurringTransaction.description || "",
        amount: recurringTransaction.amount.toString(),
        category: recurringTransaction.category,
        frequency: recurringTransaction.frequency,
        type: recurringTransaction.type,
        startDate: recurringTransaction.startDate?.split("T")[0] || "",
        endDate: recurringTransaction.endDate?.split("T")[0] || "",
        accountId: recurringTransaction.accountId?.toString() || "1",
      })
    } else if (open && !isEditMode) {
      form.reset({
        description: "",
        amount: "0.00",
        category: "",
        frequency: "MONTHLY",
        type: "EXPENSE",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        accountId: "1",
      })
    }
  }, [recurringTransaction, open, isEditMode, form])

  async function onSubmit(data: RecurringTransactionFormValues) {
    try {
      setIsSubmitting(true)

      if (isEditMode && recurringTransaction) {
        // Edit mode
        const transactionData = {
          recurringTransactionId: recurringTransaction.recurringTransactionId,
          description: data.description,
          amount: parseFloat(data.amount),
          category: data.category,
          frequency: data.frequency,
          type: data.type,
          startDate: new Date(data.startDate).toISOString(),
          endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
          accountId: parseInt(data.accountId),
        }

        await updateRecurringTransaction(recurringTransaction.recurringTransactionId, transactionData)
        toast.success("Recurring transaction updated successfully")
      } else {
        // Create mode
        const currentUser = localStorage.getItem("current_user")
        if (!currentUser) {
          toast.error("User not authenticated")
          return
        }

        const transactionData = {
          userId: JSON.parse(currentUser).userId,
          description: data.description,
          amount: parseFloat(data.amount),
          category: data.category,
          frequency: data.frequency,
          type: data.type,
          startDate: new Date(data.startDate).toISOString(),
          endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
          accountId: parseInt(data.accountId),
        }

        await createRecurringTransaction(transactionData)
        toast.success("Recurring transaction created successfully")
      }

      onTransactionSaved?.()
      form.reset()
      onOpenChange(false)
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to ${isEditMode ? "update" : "create"} recurring transaction`
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            {isEditMode ? "✏️ Edit Recurring Transaction" : "➕ Add Recurring Transaction"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the recurring transaction details below."
              : "Create a new recurring bill, subscription, or income."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Monthly House Rent"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type and Frequency */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="cursor-pointer">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FREQUENCIES.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value} className="cursor-pointer">
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="cursor-pointer">
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start and End Date */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Account */}
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem 
                          key={account.accountId} 
                          value={account.accountId.toString()}
                          className="cursor-pointer"
                        >
                          💳 {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                {isSubmitting
                  ? isEditMode ? "Updating..." : "Creating..."
                  : isEditMode ? "Update Transaction" : "Save Transaction"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
