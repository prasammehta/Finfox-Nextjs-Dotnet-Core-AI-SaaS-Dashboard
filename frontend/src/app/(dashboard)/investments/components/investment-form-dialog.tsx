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
import { investmentFormSchema, type InvestmentFormValues } from "@/types/zod-schema"
import { createInvestment, updateInvestment } from "@/services/investmentService"
import { toast } from "sonner"
import { Investment } from "@/types/schema"

interface InvestmentFormDialogProps {
  investment?: Investment | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onInvestmentSaved?: () => void
  children?: React.ReactNode
}

export function InvestmentFormDialog({ 
  investment = null,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onInvestmentSaved,
  children
}: InvestmentFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Use controlled or internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const onOpenChange = controlledOnOpenChange || setInternalOpen

  const isEditMode = !!investment

  const form = useForm<InvestmentFormValues>({
    resolver: zodResolver(investmentFormSchema),
    defaultValues: {
      name: "",
      type: "",
      initialAmount: "",
      currentValue: "",
      dateAcquired: "",
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (investment && open && isEditMode) {
      form.reset({
        name: investment.name,
        type: investment.type,
        initialAmount: investment.initialAmount.toString(),
        currentValue: investment.currentValue.toString(),
        dateAcquired: investment.dateAcquired.split('T')[0],
      })
    } else if (open && !isEditMode) {
      form.reset({
        name: "",
        type: "",
        initialAmount: "",
        currentValue: "",
        dateAcquired: "",
      })
    }
  }, [investment, open, isEditMode, form])

  async function onSubmit(data: InvestmentFormValues) {
    try {
      setIsSubmitting(true)
      
      if (isEditMode && investment) {
        // Edit mode
        const investmentData = {
          investmentId: investment.investmentId,
          name: data.name,
          type: data.type,
          initialAmount: parseFloat(data.initialAmount),
          currentValue: parseFloat(data.currentValue),
          dateAcquired: new Date(data.dateAcquired).toISOString(),
        }

        await updateInvestment(investment.investmentId, investmentData)
        toast.success("Investment updated successfully")
      } else {
        // Create mode
        const currentUser = localStorage.getItem("current_user")
        if (!currentUser) {
          toast.error("User not authenticated")
          return
        }

        const investmentData = {
          userId: JSON.parse(currentUser).userId,
          name: data.name,
          type: data.type,
          initialAmount: parseFloat(data.initialAmount),
          currentValue: parseFloat(data.currentValue),
          dateAcquired: new Date(data.dateAcquired).toISOString(),
        }

        await createInvestment(investmentData)
        toast.success("Investment created successfully")
      }

      onInvestmentSaved?.()
      form.reset()
      onOpenChange(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${isEditMode ? "update" : "create"} investment`
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const typeOptions = [
    { value: "STOCK", label: "📈 Stock", color: "text-green-600" },
    { value: "CRYPTO", label: "₿ Crypto", color: "text-purple-600" },
    { value: "REAL_ESTATE", label: "🏠 Real Estate", color: "text-amber-600" },
    { value: "MUTUAL_FUND", label: "💼 Mutual Fund", color: "text-blue-600" },
    { value: "BOND", label: "📊 Bond", color: "text-orange-600" },
    { value: "OTHER", label: "❓ Other", color: "text-gray-600" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
     
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? "✏️ Edit Investment" : "➕ Add New Investment"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update the investment details below." 
              : "Create a new investment. Fill in all the required fields."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Investment Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-muted-foreground">Investment Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Apple Stock, Bitcoin, etc." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type and Date Grid */}
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
                        {typeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                            <span className={option.color}>● {option.label}</span>
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
                name="dateAcquired"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Acquired</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Amounts Grid */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="initialAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Amount (₹)</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Value (₹)</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                  : isEditMode ? "Update Investment" : "Create Investment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

