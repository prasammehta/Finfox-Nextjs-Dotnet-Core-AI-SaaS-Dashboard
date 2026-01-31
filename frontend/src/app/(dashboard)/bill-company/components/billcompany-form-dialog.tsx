"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
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
import { Plus, Upload, X } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { billCompanyFormSchema, type BillCompanyFormValues } from "@/types/zod-schema"
import { createBillCompany, updateBillCompany, uploadBillCompanyLogo, deleteBillCompanyLogo } from "@/services/billCompanyService"
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
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

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
      setLogoPreview(company.logoUrl || null)
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
      setLogoPreview(null)
    }
  }, [company, open, isEditMode, form])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = async () => {
    if (isEditMode && company?.logoUrl) {
      try {
        setIsUploadingLogo(true)
        await deleteBillCompanyLogo(company.billCompanyId)
        setLogoPreview(null)
        setLogoFile(null)
        toast.success("Logo deleted successfully")
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete logo"
        toast.error(errorMessage)
      } finally {
        setIsUploadingLogo(false)
      }
    } else {
      setLogoPreview(null)
      setLogoFile(null)
    }
  }

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
        
        // Upload new logo if selected
        if (logoFile) {
          try {
            setIsUploadingLogo(true)
            await uploadBillCompanyLogo(company.billCompanyId, logoFile)
          } catch (error) {
            console.error("Logo upload error:", error)
            // Don't fail the entire operation if logo upload fails
            toast.warning("Company updated but logo upload failed")
          } finally {
            setIsUploadingLogo(false)
          }
        }

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

        const createdCompany = await createBillCompany(companyData)
        
        // Upload logo if selected
        if (logoFile) {
          try {
            setIsUploadingLogo(true)
            await uploadBillCompanyLogo(createdCompany.billCompanyId, logoFile)
          } catch (error) {
            console.error("Logo upload error:", error)
            // Don't fail the entire operation if logo upload fails
            toast.warning("Company created but logo upload failed")
          } finally {
            setIsUploadingLogo(false)
          }
        }

        toast.success("Company created successfully")
      }

      onCompanySaved?.()
      form.reset()
      setLogoFile(null)
      setLogoPreview(null)
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
            {/* Logo Section */}
            <div className="border rounded-lg p-6 bg-white dark:bg-slate-950">
              <h3 className="font-semibold text-base mb-4">Company Logo</h3>
              
              <div className="flex flex-col items-center gap-4">
                {logoPreview ? (
                  <div className="relative">
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      width={128}
                      height={128}
                      className="object-contain rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2"
                      onClick={handleRemoveLogo}
                      disabled={isUploadingLogo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-32 w-32 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                
                <div className="w-full">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    disabled={isSubmitting || isUploadingLogo}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Company Information Section */}
            <div className="bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 rounded-lg border">
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting || isUploadingLogo}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isUploadingLogo}
              >
                {isSubmitting || isUploadingLogo ? "Saving..." : ""}
                {isEditMode
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
