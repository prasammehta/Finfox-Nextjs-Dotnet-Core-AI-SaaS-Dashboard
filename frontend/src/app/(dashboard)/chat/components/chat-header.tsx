"use client"

import {
  MoreVertical,
  Users,
  Info,
  Trash2,
  Search
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { type Conversation, type User } from "../use-chat"

interface ChatHeaderProps {
  conversation: Conversation | null
  users: User[]
  onToggleMute?: () => void
  onToggleInfo?: () => void
  onClearConversation?: () => void
  onOpenSearch?: () => void
}

export function ChatHeader({
  conversation,
  users,
  onToggleMute,
  onToggleInfo,
  onClearConversation,
  onOpenSearch
}: ChatHeaderProps) {
  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Select a conversation to start chatting</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between h-full">
      {/* Left side - Avatar and title */}
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={conversation.avatar} alt="Fox AI" />
          <AvatarFallback>
            {conversation.type === "group" ? (
              <Users className="h-5 w-5" />
            ) : (
              "FA"
            )}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h2 className="font-semibold truncate">Fox AI</h2>
        </div>
      </div>

      {/* Right side - Action buttons */}
      <div className="flex items-center gap-1">
        {/* More options menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={onToggleInfo}
              className="cursor-pointer"
            >
              <Info className="h-4 w-4 mr-2" />
              Info
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onOpenSearch}
              className="cursor-pointer"
            >
              <Search className="h-4 w-4 mr-2" />
              Search messages
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onClearConversation}
              className="cursor-pointer text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
