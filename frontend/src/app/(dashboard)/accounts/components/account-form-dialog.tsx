"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useAuth } from "@/contexts/authContext"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Account } from "@/types/schema"
import { accountFormSchema, type AccountFormValues } from "@/types/zod-schema"
import { createAccount, updateAccount } from "@/services/accountService"
import { Loader2 } from "lucide-react"

interface AccountFormDialogProps {
  account?: Account | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
  children?: React.ReactNode
}

export function AccountFormDialog({
  account,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
  children,
}: AccountFormDialogProps) {
  const { user } = useAuth()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const setOpen = isControlled ? onOpenChange! : setUncontrolledOpen

  const isEditMode = !!account

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "",
      initialBalance: "",
      currentBalance: "",
    },
  })

  useEffect(() => {
    if (isEditMode && account && open) {
      form.reset({
        name: account.name,
        initialBalance: account.initialBalance.toString(),
        currentBalance: account.currentBalance.toString(),
      })
    } else if (!isEditMode && open) {
      form.reset({
        name: "",
        initialBalance: "",
        currentBalance: "",
      })
    }
  }, [open, account, isEditMode, form])

  async function onSubmit(values: AccountFormValues) {
    try {
      setIsLoading(true)
      if (isEditMode && account) {
        const payload = {
          accountId: account.accountId,
          name: values.name,
          initialBalance: parseFloat(values.initialBalance),
          currentBalance: parseFloat(values.currentBalance),
        }
        await updateAccount(account.accountId, payload)
        toast.success("Account updated successfully")
      } else {
        if (!user?.userId) {
          toast.error("User not authenticated")
          return
        }
        const payload = {
          userId: user.userId,
          name: values.name,
          initialBalance: parseFloat(values.initialBalance),
        }
        await createAccount(payload)
        toast.success("Account created successfully")
      }

      form.reset()
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save account"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Account" : "Create Account"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update your account details"
              : "Add a new account to track your finances"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Savings Account"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="initialBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Balance</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter initial balance"
                      type="number"
                      step="0.01"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Balance</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter current balance"
                      type="number"
                      step="0.01"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Update Account" : "Create Account"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
