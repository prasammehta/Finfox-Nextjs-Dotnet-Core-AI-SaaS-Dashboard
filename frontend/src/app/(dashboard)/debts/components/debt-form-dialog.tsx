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
import { debtFormSchema, type DebtFormValues } from "@/types/zod-schema"
import { createDebt, updateDebt } from "@/services/debtService"
import { toast } from "sonner"
import { Debt } from "@/types/schema"

interface DebtFormDialogProps {
  debt?: Debt | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onDebtSaved?: () => void
  children?: React.ReactNode
}

export function DebtFormDialog({
  debt = null,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onDebtSaved,
  children,
}: DebtFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const onOpenChange = controlledOnOpenChange || setInternalOpen

  const isEditMode = !!debt

  const form = useForm<DebtFormValues>({
    resolver: zodResolver(debtFormSchema),
    defaultValues: {
      personName: "",
      amount: "",
      debtType: "",
      status: "",
      paidAmount: "0",
      date: "",
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (debt && open && isEditMode) {
      form.reset({
        personName: debt.personName || "",
        amount: debt.amount.toString(),
        debtType: debt.debtType,
        status: debt.status,
        paidAmount: debt.paidAmount?.toString() || "0",
        date: debt.date?.split("T")[0] || "",
      })
    } else if (open && !isEditMode) {
      form.reset({
        personName: "",
        amount: "",
        debtType: "",
        status: "",
        paidAmount: "0",
        date: "",
      })
    }
  }, [debt, open, isEditMode, form])

  async function onSubmit(data: DebtFormValues) {
    try {
      setIsSubmitting(true)

      if (isEditMode && debt) {
        // Edit mode
        const debtData = {
          debtId: debt.debtId,
          personName: data.personName,
          amount: parseFloat(data.amount),
          debtType: data.debtType,
          status: data.status,
          paidAmount: parseFloat(data.paidAmount),
          date: new Date(data.date).toISOString(),
        }

        await updateDebt(debt.debtId, debtData)
        toast.success("Debt updated successfully")
      } else {
        // Create mode
        const currentUser = localStorage.getItem("current_user")
        if (!currentUser) {
          toast.error("User not authenticated")
          return
        }

        const debtData = {
          userId: JSON.parse(currentUser).userId,
          personName: data.personName,
          amount: parseFloat(data.amount),
          debtType: data.debtType,
          status: data.status,
          paidAmount: parseFloat(data.paidAmount),
          date: new Date(data.date).toISOString(),
        }

        await createDebt(debtData)
        toast.success("Debt created successfully")
      }

      onDebtSaved?.()
      form.reset()
      onOpenChange(false)
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to ${isEditMode ? "update" : "create"} debt`
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
          <DialogTitle className="flex items-center gap-2 text-2xl">
            {isEditMode ? "✏️ Edit Debt" : "➕ Add New Debt"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the debt details below."
              : "Create a new debt record. Fill in all the required fields."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="personName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Creditor/Person Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter creditor or person name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="debtType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Debt Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Loan">Loan</SelectItem>
                        <SelectItem value="Borrowed">Borrowed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount (₹)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter total amount" type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paidAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paid Amount (₹)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter paid amount" type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
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
                  : isEditMode ? "Update Debt" : "Save Debt"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}