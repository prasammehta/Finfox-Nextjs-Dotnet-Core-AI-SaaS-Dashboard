"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserObject } from "@/types/schema"

interface UserViewDialogProps {
  user: UserObject | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserViewDialog({
  user,
  open,
  onOpenChange,
}: UserViewDialogProps) {
  if (!user) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const generateAvatar = (name: string) => {
    const names = name.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Complete information about this user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Avatar and Name */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg font-semibold">
                {generateAvatar(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-2xl font-bold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Separator />

          {/* User ID */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              User ID
            </p>
            <p className="text-sm font-mono text-foreground">
              {user.userId}
            </p>
          </div>

          {/* Email */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Email Address
            </p>
            <p className="text-sm text-foreground">{user.email}</p>
          </div>

          {/* Account Status */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Status
            </p>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
              Active
            </Badge>
          </div>

          <Separator />

          {/* Date Information */}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Account Created
              </p>
              <p className="text-sm text-foreground">
                {formatDate(user.createdAt)}
              </p>
            </div>
            {user.updatedAt && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Last Updated
                </p>
                <p className="text-sm text-foreground">
                  {formatDate(user.updatedAt)}
                </p>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={() => onOpenChange(false)} className="cursor-pointer">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
