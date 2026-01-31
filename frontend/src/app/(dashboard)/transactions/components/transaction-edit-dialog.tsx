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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { transactionFormSchema, type TransactionFormValues } from "@/types/zod-schema"
import { updateTransaction } from "@/services/transactionService"
import { toast } from "sonner"
import { Transaction } from "@/types/schema"

interface Account {
  accountId: number
  name: string
}

interface TransactionEditDialogProps {
  transaction: Transaction | null
  accounts: Account[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onTransactionUpdated: () => void
}

export function TransactionEditDialog({
  transaction,
  accounts,
  open,
  onOpenChange,
  onTransactionUpdated,
}: TransactionEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  useEffect(() => {
    if (transaction && open) {
      form.reset({
        amount: transaction.amount.toString(),
        description: transaction.description || "",
        type: transaction.type,
        category: transaction.category,
        fromAccountId: transaction.fromAccountId.toString(),
      })
    }
  }, [transaction, open, form])

  async function onSubmit(data: TransactionFormValues) {
    if (!transaction) return

    try {
      setIsSubmitting(true)

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
      onTransactionUpdated()
      form.reset()
      onOpenChange(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update transaction"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Update transaction details. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter amount" type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter transaction description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                        <SelectItem value="INCOME">Income</SelectItem>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="TRANSFER">Transfer</SelectItem>
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
                        <SelectItem value="FOOD">Food</SelectItem>
                        <SelectItem value="TRANSPORT">Transport</SelectItem>
                        <SelectItem value="UTILITIES">Utilities</SelectItem>
                        <SelectItem value="ENTERTAINMENT">Entertainment</SelectItem>
                        <SelectItem value="SHOPPING">Shopping</SelectItem>
                        <SelectItem value="SALARY">Salary</SelectItem>
                        <SelectItem value="INVESTMENT">Investment</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="fromAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer w-full">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.accountId} value={account.accountId.toString()}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Transaction"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
