"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
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
import { User } from "@/types/schema"
import { userFormSchema, type UserFormValues } from "@/types/zod-schema"
import { createUser, updateUser } from "@/services/userService"
import { Loader2 } from "lucide-react"

interface UserFormDialogProps {
  user?: User | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
  children?: React.ReactNode
}

export function UserFormDialog({
  user,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
  children,
}: UserFormDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const setOpen = isControlled ? onOpenChange! : setUncontrolledOpen

  const isEditMode = !!user

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      passwordHash: "",
    },
  })

  useEffect(() => {
    if (isEditMode && open) {
      form.reset({
        name: user.name,
        email: user.email,
        passwordHash: "",
      })
    } else if (!isEditMode && open) {
      form.reset({
        name: "",
        email: "",
        passwordHash: "",
      })
    }
  }, [open, user, isEditMode, form])

  async function onSubmit(values: UserFormValues) {
    try {
      setIsLoading(true)

      if (isEditMode && user) {
        // For edit, only send name and email
        await updateUser(user.userId, {
          userId: user.userId,
          name: values.name,
          email: values.email,
        })
        toast.success("User updated successfully")
      } else {
        // For create, send all fields
        await createUser({
          name: values.name,
          email: values.email,
          password: values.passwordHash!,
        })
        toast.success("User created successfully")
      }

      form.reset()
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save user"
      toast.error(errorMessage)
      console.error("Error:", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit User" : "Create User"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update user details"
              : "Add a new user account"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter user name"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter email address"
                      type="email"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditMode && (
              <FormField
                control={form.control}
                name="passwordHash"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter password"
                        type="password"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                {isEditMode ? "Update User" : "Create User"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
