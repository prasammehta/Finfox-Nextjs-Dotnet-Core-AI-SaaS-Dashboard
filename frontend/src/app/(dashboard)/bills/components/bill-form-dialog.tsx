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
import { Plus, Trash2, Copy } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { billFormSchema, type BillFormValues } from "@/types/zod-schema"
import { createBill, updateBill } from "@/services/billService"
import { toast } from "sonner"
import { generateInvoiceNumber } from "../utils/invoice-number-generator"
import { Bill } from "@/types/schema"

interface BillCompany {
  billCompanyId: number
  name: string
}

interface BillItem {
  description: string
  quantity: number
  rate: number
  _id?: string
}

interface BillFormDialogProps {
  bill?: Bill | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onBillSaved?: () => void
  billCompanies?: BillCompany[]
  children?: React.ReactNode
}

export function BillFormDialog({
  bill = null,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onBillSaved,
  billCompanies = [],
  children,
}: BillFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [billItems, setBillItems] = useState<BillItem[]>([
    { description: "", quantity: 0, rate: 0, _id: "1" },
  ])

  // Use controlled or internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const onOpenChange = controlledOnOpenChange || setInternalOpen

  const isEditMode = !!bill

  const form = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      invoiceNumber: "",
      client: "",
      billFromId: "",
      billToId: "",
      issueDate: "",
      dueDate: "",
      gstRate: "0",
      tdsPercent: "0",
      subtotal: "0",
      billItems: JSON.stringify([{ description: "", quantity: 0, rate: 0 }]),
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (bill && open && isEditMode) {
      form.reset({
        invoiceNumber: bill.invoiceNumber || "",
        client: bill.client || "",
        billFromId: bill.billFromId?.toString() || "",
        billToId: bill.billToId?.toString() || "",
        issueDate: bill.issueDate?.split("T")[0] || "",
        dueDate: bill.dueDate?.split("T")[0] || "",
        gstRate: bill.gstRate?.toString() || "0",
        tdsPercent: bill.tdsPercent?.toString() || "0",
        subtotal: bill.subtotal?.toString() || "0",
        billItems: JSON.stringify(
          bill.billItems?.map((item) =>
            typeof item === "string" ? JSON.parse(item) : item
          ) || []
        ),
      })

      try {
        const items = bill.billItems?.map((item, idx) => ({
          ...(typeof item === "string" ? JSON.parse(item) : item),
          _id: `${idx}`,
        })) || []
        setBillItems(
          items.length > 0
            ? items
            : [{ description: "", quantity: 0, rate: 0, _id: "1" }]
        )
      } catch (e) {
        console.error("Error parsing bill items:", e)
        setBillItems([{ description: "", quantity: 0, rate: 0, _id: "1" }])
      }
    } else if (open && !isEditMode) {
      form.reset({
        invoiceNumber: generateInvoiceNumber(),
        client: "",
        billFromId: "",
        billToId: "",
        issueDate: "",
        dueDate: "",
        gstRate: "0",
        tdsPercent: "0",
        subtotal: "0",
        billItems: JSON.stringify([{ description: "", quantity: 0, rate: 0 }]),
      })
      setBillItems([{ description: "", quantity: 0, rate: 0, _id: "1" }])
    }
  }, [bill, open, isEditMode, form])

  // Update billItems field when items change
  useEffect(() => {
    const itemsForSubmit = billItems.map(({ _id, ...item }) => item)
    form.setValue("billItems", JSON.stringify(itemsForSubmit))
  }, [billItems, form])

  // Helper functions for calculations
  const calculateSubtotal = (): number => {
    return billItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.rate || 0), 0)
  }

  const calculateGST = (subtotal: number): number => {
    const gstRate = parseFloat(form.watch("gstRate")) || 0
    return (subtotal * gstRate) / 100
  }

  const calculateTDS = (subtotal: number): number => {
    const tdsRate = parseFloat(form.watch("tdsPercent")) || 0
    return (subtotal * tdsRate) / 100
  }

  const addBillItem = () => {
    const newId =
      Math.max(
        ...billItems.map((item) => parseInt(item._id || "0") || 0),
        0
      ) + 1
    setBillItems([
      ...billItems,
      { description: "", quantity: 0, rate: 0, _id: `${newId}` },
    ])
  }

  const removeBillItem = (id: string) => {
    if (billItems.length === 1) {
      toast.error("At least one bill item is required")
      return
    }
    setBillItems(billItems.filter((item) => item._id !== id))
  }

  const duplicateBillItem = (id: string) => {
    const itemToDuplicate = billItems.find((item) => item._id === id)
    if (itemToDuplicate) {
      const newId =
        Math.max(
          ...billItems.map((item) => parseInt(item._id || "0") || 0),
          0
        ) + 1
      const { _id, ...itemData } = itemToDuplicate
      setBillItems([...billItems, { ...itemData, _id: `${newId}` }])
    }
  }

  const updateBillItem = (
    id: string,
    field: keyof BillItem,
    value: string | number
  ) => {
    setBillItems(
      billItems.map((item) =>
        item._id === id ? { ...item, [field]: value } : item
      )
    )
  }

  async function onSubmit(data: BillFormValues) {
    try {
      setIsSubmitting(true)

      // Validate required fields
      if (!data.billFromId || !data.billToId || !data.issueDate || !data.dueDate) {
        toast.error("Please fill in all required fields (Bill From, Bill To, Issue Date, Due Date)")
        setIsSubmitting(false)
        return
      }

      if (billItems.length === 0 || billItems.every(item => !item.description)) {
        toast.error("Please add at least one bill item")
        setIsSubmitting(false)
        return
      }

      // Calculate totals using helper functions
      const billItemsArray = billItems.map(({ _id, ...item }) => item)
      const subtotal = calculateSubtotal()
      const gstAmount = calculateGST(subtotal)
      const tdsAmount = calculateTDS(subtotal)
      const totalAmount = subtotal + gstAmount
      const payableAmount = totalAmount - tdsAmount

      if (isEditMode && bill) {
        // Edit mode
        const billData = {
          billId: bill.billId,
          userId: bill.userId,
          billFromId: parseInt(data.billFromId),
          billToId: parseInt(data.billToId),
          invoiceNumber: data.invoiceNumber,
          client: data.client,
          issueDate: new Date(data.issueDate).toISOString(),
          dueDate: new Date(data.dueDate).toISOString(),
          gstRate: parseFloat(data.gstRate),
          tdsPercent: parseFloat(data.tdsPercent),
          subtotal: subtotal,
          gstAmount: gstAmount,
          totalAmount: totalAmount,
          tdsAmount: tdsAmount,
          payableAmount: payableAmount,
          billItems: billItemsArray.map(item => JSON.stringify(item)),
        }

        await updateBill(bill.billId, billData)
        toast.success("Bill updated successfully")
      } else {
        // Create mode
        const currentUser = localStorage.getItem("current_user")
        if (!currentUser) {
          toast.error("User not authenticated")
          setIsSubmitting(false)
          return
        }

        const userId =
          typeof currentUser === "string"
            ? JSON.parse(currentUser).userId
            : currentUser

        const billData = {
          userId: userId,
          billFromId: parseInt(data.billFromId),
          billToId: parseInt(data.billToId),
          invoiceNumber: data.invoiceNumber,
          client: data.client,
          issueDate: new Date(data.issueDate).toISOString(),
          dueDate: new Date(data.dueDate).toISOString(),
          gstRate: parseFloat(data.gstRate),
          tdsPercent: parseFloat(data.tdsPercent),
          subtotal: subtotal,
          gstAmount: gstAmount,
          totalAmount: totalAmount,
          tdsAmount: tdsAmount,
          payableAmount: payableAmount,
          billItems: billItemsArray.map(item => JSON.stringify(item)),
        }

        const response = await createBill(billData)
        if (response) {
          toast.success("Bill created successfully")
        }
      }

      onBillSaved?.()
      form.reset()
      setBillItems([{ description: "", quantity: 0, rate: 0, _id: "1" }])
      onOpenChange(false)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : `Failed to ${isEditMode ? "update" : "create"} bill`
      console.error("Bill submission error:", errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      {!isEditMode && !children && (
        <DialogTrigger asChild>
          <Button className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Add Bill
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            {isEditMode ? "✏️ Edit Bill" : "➕ Add New Bill"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isEditMode ? "Update the bill details and items below." : "Create a new bill record. Fill in all the required fields."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Bill Header Section */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 rounded-lg border">
              <h3 className="font-semibold text-sm text-muted-foreground mb-4">Bill Information</h3>

              <div className="space-y-4">
                {/* Invoice and Client */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="invoiceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">Invoice Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., INV-001"
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
                    name="client"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">Client Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Acme Corp"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Bill From and Bill To */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="billFromId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">Bill From (Company)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger className="cursor-pointer">
                              <SelectValue placeholder="Select issuing company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {billCompanies.map((company) => (
                              <SelectItem key={company.billCompanyId} value={company.billCompanyId.toString()}>
                                {company.name}
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
                    name="billToId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">Bill To (Company)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger className="cursor-pointer">
                              <SelectValue placeholder="Select receiving company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {billCompanies.map((company) => (
                              <SelectItem key={company.billCompanyId} value={company.billCompanyId.toString()}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">Issue Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Bill Items Section */}
            <div className="border rounded-lg p-6 bg-white dark:bg-slate-950">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-base">Bill Items</h3>
                  <p className="text-xs text-muted-foreground mt-1">Add and manage individual bill items</p>
                </div>
                <Button
                  type="button"
                  onClick={addBillItem}
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  disabled={isSubmitting}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {billItems.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No bill items added yet. Click &quot;Add Item&quot; to get started.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {billItems.map((item, index) => (
                  <div
                    key={item._id}
                    className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800"
                  >
                    <div className="grid grid-cols-12 gap-3 items-end">
                      {/* Description */}
                      <div className="col-span-5">
                        <label className="text-xs font-semibold text-muted-foreground block mb-2">
                          Description
                        </label>
                        <Input
                          placeholder="Item description"
                          value={(item.description as string) || ""}
                          onChange={(e) =>
                            updateBillItem(item._id!, "description", e.target.value)
                          }
                          className="text-sm"
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Quantity */}
                      <div className="col-span-2">
                        <label className="text-xs font-semibold text-muted-foreground block mb-2">
                          Qty
                        </label>
                        <Input
                          placeholder="0"
                          type="number"
                          step="0.01"
                          value={(item.quantity as number) || ""}
                          onChange={(e) =>
                            updateBillItem(item._id!, "quantity", parseFloat(e.target.value) || 0)
                          }
                          className="text-sm"
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Rate */}
                      <div className="col-span-2">
                        <label className="text-xs font-semibold text-muted-foreground block mb-2">
                          Rate (₹)
                        </label>
                        <Input
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          value={(item.rate as number) || ""}
                          onChange={(e) =>
                            updateBillItem(item._id!, "rate", parseFloat(e.target.value) || 0)
                          }
                          className="text-sm"
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Actions */}
                      <div className="col-span-3 flex gap-1">
                        <Button
                          type="button"
                          onClick={() => duplicateBillItem(item._id!)}
                          variant="ghost"
                          size="sm"
                          title="Duplicate item"
                          className="cursor-pointer"
                          disabled={isSubmitting}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          onClick={() => removeBillItem(item._id!)}
                          variant="ghost"
                          size="sm"
                          title="Delete item"
                          className="cursor-pointer text-red-600 hover:text-red-700"
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hidden field for form submission */}
              <FormField
                control={form.control}
                name="billItems"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input type="hidden" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Tax and Calculation Section */}
            <div className="border rounded-lg p-6 bg-white dark:bg-slate-950">
              <h3 className="font-semibold text-base mb-4">Tax & Summary</h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <FormField
                  control={form.control}
                  name="gstRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">GST Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0"
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
                <FormField
                  control={form.control}
                  name="tdsPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">TDS (%)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0"
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

              {/* Amount Summary */}
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-muted-foreground">Subtotal</label>
                  <span className="text-sm font-semibold">₹ {(() => {
                    let subtotal = 0
                    billItems.forEach((item) => {
                      subtotal += (item.quantity as number || 0) * (item.rate as number || 0)
                    })
                    return subtotal.toFixed(2)
                  })()}</span>
                </div>
                <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                  <label className="text-sm font-medium">GST ({form.watch("gstRate") || 0}%)</label>
                  <span className="text-sm font-semibold">+ ₹ {(() => {
                    let subtotal = 0
                    billItems.forEach((item) => {
                      subtotal += (item.quantity as number || 0) * (item.rate as number || 0)
                    })
                    const gstRate = parseFloat(form.watch("gstRate")) || 0
                    return ((subtotal * gstRate) / 100).toFixed(2)
                  })()}</span>
                </div>
                <div className="flex justify-between items-center text-red-600 dark:text-red-400">
                  <label className="text-sm font-medium">TDS ({form.watch("tdsPercent") || 0}%)</label>
                  <span className="text-sm font-semibold">- ₹ {(() => {
                    let subtotal = 0
                    billItems.forEach((item) => {
                      subtotal += (item.quantity as number || 0) * (item.rate as number || 0)
                    })
                    const tdsRate = parseFloat(form.watch("tdsPercent")) || 0
                    return ((subtotal * tdsRate) / 100).toFixed(2)
                  })()}</span>
                </div>
                <div className="border-t border-slate-300 dark:border-slate-600 pt-3 flex justify-between items-center bg-blue-50 dark:bg-blue-950 px-3 py-2 rounded">
                  <label className="text-base font-bold">Amount to be Paid</label>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">₹ {(() => {
                    let subtotal = 0
                    billItems.forEach((item) => {
                      subtotal += (item.quantity as number || 0) * (item.rate as number || 0)
                    })
                    const gstRate = parseFloat(form.watch("gstRate")) || 0
                    const tdsRate = parseFloat(form.watch("tdsPercent")) || 0
                    const gstAmount = (subtotal * gstRate) / 100
                    const tdsAmount = (subtotal * tdsRate) / 100
                    const payable = subtotal + gstAmount - tdsAmount
                    return payable.toFixed(2)
                  })()}</span>
                </div>
              </div>
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
                {isSubmitting ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Bill" : "Save Bill")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
