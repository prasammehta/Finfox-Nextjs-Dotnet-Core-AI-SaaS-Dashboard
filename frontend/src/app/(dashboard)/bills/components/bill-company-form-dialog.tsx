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
import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { billCompanyFormSchema, type BillCompanyFormValues } from "@/types/zod-schema"
import { createBillCompany, updateBillCompany } from "@/services/billCompanyService"
import { toast } from "sonner"
import { BillCompany } from "@/types/schema"

interface BillCompanyFormDialogProps {
  company?: BillCompany | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onCompanySaved?: () => void
}

export function BillCompanyFormDialog({
  company = null,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onCompanySaved,
}: BillCompanyFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const onOpenChange = controlledOnOpenChange || setInternalOpen

  const isEditMode = !!company

  const form = useForm<BillCompanyFormValues>({
    resolver: zodResolver(billCompanyFormSchema),
    defaultValues: {
      name: "",
      address: "",
      gstin: "",
      pan: "",
      tdsPercent: "",
      email: "",
      phone: "",
      accountName: "",
      accountNumber: "",
      ifscCode: "",
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (company && open && isEditMode) {
      form.reset({
        name: company.name || "",
        address: company.address || "",
        gstin: company.gstin || "",
        pan: company.pan || "",
        tdsPercent: company.tdsPercent || "",
        email: company.email || "",
        phone: company.phone || "",
        accountName: company.accountName || "",
        accountNumber: company.accountNumber || "",
        ifscCode: company.ifscCode || "",
      })
    } else if (open && !isEditMode) {
      form.reset({
        name: "",
        address: "",
        gstin: "",
        pan: "",
        tdsPercent: "",
        email: "",
        phone: "",
        accountName: "",
        accountNumber: "",
        ifscCode: "",
      })
    }
  }, [company, open, isEditMode, form])

  async function onSubmit(data: BillCompanyFormValues) {
    try {
      setIsSubmitting(true)

      if (isEditMode && company) {
        // Edit mode
        const companyData = {
          billCompanyId: company.billCompanyId,
          userId: company.userId,
          ...data,
        }

        await updateBillCompany(company.billCompanyId, companyData)
        toast.success("Company updated successfully")
      } else {
        // Create mode
        const currentUser = localStorage.getItem("current_user")
        if (!currentUser) {
          toast.error("User not authenticated")
          return
        }

        const companyData = {
          userId: JSON.parse(currentUser).userId,
          ...data,
        }

        await createBillCompany(companyData)
        toast.success("Company created successfully")
      }

      onCompanySaved?.()
      form.reset()
      onOpenChange(false)
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to ${isEditMode ? "update" : "create"} company`
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isEditMode && (
        <DialogTrigger asChild>
          <Button className="cursor-pointer" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            {isEditMode ? "✏️ Edit Company" : "➕ Add New Company"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isEditMode
              ? "Update the company details below."
              : "Create a new bill company record. Fill in all the required fields."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Information Section */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 rounded-lg border">
              <h3 className="font-semibold text-sm text-muted-foreground mb-4">
                Basic Information
              </h3>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">Company Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Acme Corporation"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 123 Business St, City"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gstin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">GSTIN</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 27AABCT1234H1Z0"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">PAN</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., AAAPA1234A"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="border rounded-lg p-6 bg-white dark:bg-slate-950">
              <h3 className="font-semibold text-base mb-4">Contact Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="company@example.com"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+91 XXXXX XXXXX"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Bank Details Section */}
            <div className="border rounded-lg p-6 bg-white dark:bg-slate-950">
              <h3 className="font-semibold text-base mb-4">Bank Details</h3>
              <p className="text-xs text-muted-foreground mb-4">Optional banking information</p>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">Account Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Account holder name"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">Account Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="XXXXXXXXXXXXXX"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ifscCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">IFSC Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., SBIN0001234"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Tax Section */}
            <div className="border rounded-lg p-6 bg-white dark:bg-slate-950">
              <h3 className="font-semibold text-base mb-4">Tax Information</h3>

              <FormField
                control={form.control}
                name="tdsPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">TDS Percent (%)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 5"
                        type="number"
                        step="0.01"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                {isSubmitting
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                  ? "Update Company"
                  : "Save Company"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
