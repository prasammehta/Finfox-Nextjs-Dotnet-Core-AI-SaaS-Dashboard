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
import { TRANSACTION_TYPES, CATEGORIES } from "@/constants/enums"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { transactionFormSchema, type TransactionFormValues } from "@/types/zod-schema"
import { createTransaction, updateTransaction } from "@/services/transactionService"
import { toast } from "sonner"
import { Transaction } from "@/types/schema"

interface Account {
  accountId: number
  name: string
}

interface TransactionFormDialogProps {
  accounts: Account[]
  transaction?: Transaction | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onTransactionSaved?: () => void
  children?: React.ReactNode
}

export function TransactionFormDialog({ 
  accounts, 
  transaction = null,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onTransactionSaved,
  children,
}: TransactionFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Use controlled or internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const onOpenChange = controlledOnOpenChange || setInternalOpen

  const isEditMode = !!transaction

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: "",
      description: "",
      type: "",
      category: "",
      fromAccountId: "",
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (transaction && open && isEditMode) {
      form.reset({
        amount: transaction.amount.toString(),
        description: transaction.description || "",
        type: transaction.type,
        category: transaction.category,
        fromAccountId: transaction.fromAccountId.toString(),
      })
    } else if (open && !isEditMode) {
      form.reset({
        amount: "",
        description: "",
        type: "",
        category: "",
        fromAccountId: "",
      })
    }
  }, [transaction, open, isEditMode, form])

  async function onSubmit(data: TransactionFormValues) {
    try {
      setIsSubmitting(true)
      
      if (isEditMode && transaction) {
        // Edit mode
        const transactionData = {
          transactionId: transaction.transactionId,
          amount: parseFloat(data.amount),
          description: data.description,
          type: data.type,
          category: data.category,
          fromAccountId: parseInt(data.fromAccountId),
        }

        await updateTransaction(transaction.transactionId, transactionData)
        toast.success("Transaction updated successfully")
      } else {
        // Create mode
        const currentUser = localStorage.getItem("current_user")
        if (!currentUser) {
          toast.error("User not authenticated")
          return
        }

        const transactionData = {
          userId: JSON.parse(currentUser).userId,
          amount: parseFloat(data.amount),
          date: new Date().toISOString(),
          description: data.description,
          type: data.type,
          category: data.category,
          fromAccountId: parseInt(data.fromAccountId),
        }

        await createTransaction(transactionData)
        toast.success("Transaction created successfully")
      }

      onTransactionSaved?.()
      form.reset()
      onOpenChange(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${isEditMode ? "update" : "create"} transaction`
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? "✏️ Edit Transaction" : "➕ Add New Transaction"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update the transaction details below." 
              : "Create a new transaction. Fill in all the required fields."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Amount Section */}
            <div className="bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 rounded-lg border">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-muted-foreground">Amount (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="0.00" 
                        type="number" 
                        step="0.01"
                        className="text-2xl font-bold border-0 bg-transparent focus:ring-0 p-0"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Weekly groceries, Office supplies..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type and Category Grid */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TRANSACTION_TYPES.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                            {option.label}
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Account */}
            <FormField
              control={form.control}
              name="fromAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer w-full">
                        <SelectValue placeholder="Select an account" />
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

            <DialogFooter className="pt-4">
              <Button 
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                {isSubmitting 
                  ? isEditMode ? "Updating..." : "Creating..." 
                  : isEditMode ? "Update Transaction" : "Create Transaction"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
