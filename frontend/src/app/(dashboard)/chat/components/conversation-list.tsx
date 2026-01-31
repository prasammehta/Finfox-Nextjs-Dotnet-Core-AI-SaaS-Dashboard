"use client"

import React, { useState } from "react"
import { format, isToday, isYesterday, isThisWeek, isThisYear } from "date-fns"
import {
  Search,
  Pin,
  VolumeX,
  MoreVertical,
  Users,
  Hash,
  Settings,
  UserPlus,
  Filter,
  Trash2,
  Plus
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { useChat, type Conversation } from "../use-chat"
import { deleteAiSession } from "../services/aiService"

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversation: string | null
  onSelectConversation: (conversationId: string) => void
  onDeleteSession?: (sessionId: number) => void
  onCreateNewChat?: () => void
}

// Enhanced time formatting function
function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp)

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Unknown'
  }

  if (isToday(date)) {
    return format(date, 'h:mm a') // 3:30 PM
  } else if (isYesterday(date)) {
    return 'Yesterday'
  } else if (isThisWeek(date)) {
    return format(date, 'EEEE') // Day name
  } else if (isThisYear(date)) {
    return format(date, 'MMM d') // Jan 15
  } else {
    return format(date, 'yyyy-MM-dd') // 2024-01-15
  }
}

export function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  onDeleteSession,
  onCreateNewChat,
}: ConversationListProps) {
  const { searchQuery, setSearchQuery } = useChat()
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredConversations = conversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedConversations = filteredConversations.sort((a, b) => {
    // Pinned conversations first
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1

    // Then by last message timestamp
    return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
  })

  const getOnlineStatus = (conversation: Conversation) => {
    if (conversation.type === "direct" && conversation.participants.length === 1) {
      // In a real app, you'd check user online status
      return Math.random() > 0.5 // Mock online status
    }
    return false
  }

  const extractSessionId = (conversationId: string): number | null => {
    const match = conversationId.match(/session-(\d+)/)
    return match ? parseInt(match[1]) : null
  }

  const handleDeleteClick = (conversationId: string) => {
    const sessionId = extractSessionId(conversationId)
    if (sessionId !== null) {
      setSessionToDelete(sessionId)
      setDeleteConfirmOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (sessionToDelete === null) return

    try {
      setIsDeleting(true)
      await deleteAiSession(sessionToDelete)
      
      // Call the callback if provided
      if (onDeleteSession) {
        onDeleteSession(sessionToDelete)
      }
      
      toast.success("Chat session deleted successfully")
      setDeleteConfirmOpen(false)
      setSessionToDelete(null)
    } catch (error) {
      console.error("Error deleting session:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete chat session"
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header - Hidden on mobile (handled by parent) */}
      <div className="hidden lg:flex items-center justify-between h-16 px-4 border-b flex-shrink-0">
        <h2 className="text-lg font-semibold">Messages</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={onCreateNewChat}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 cursor-text"
          />
        </div>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1 min-h-0 w-full">
        <div className="p-2">
          {sortedConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <p className="text-sm text-muted-foreground text-center">No conversations yet</p>
              <Button
                onClick={onCreateNewChat}
                variant="outline"
                size="sm"
                className="mt-2 cursor-pointer"
              >
                <Plus className="h-3 w-3 mr-2" />
                Start New Chat
              </Button>
            </div>
          ) : (
            sortedConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg relative overflow-visible hover:bg-accent/50 transition-colors group",
                  selectedConversation === conversation.id
                    ? "bg-accent text-accent-foreground"
                    : ""
                )}
              >
              {/* Avatar with online indicator */}
              <div className="relative flex-shrink-0 cursor-pointer" onClick={() => onSelectConversation(conversation.id)}>
                <Avatar className={cn(
                  "h-12 w-12",
                  selectedConversation === conversation.id && "ring-2 ring-background"
                )}>
                  <AvatarImage src={conversation.avatar} alt={conversation.name} />
                  <AvatarFallback className="text-sm">
                    {conversation.type === "group" ? (
                      <Users className="h-5 w-5" />
                    ) : (
                      conversation.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                    )}
                  </AvatarFallback>
                </Avatar>

                {/* Online indicator for direct messages */}
                {conversation.type === "direct" && getOnlineStatus(conversation) && (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full" />
                )}

                {/* Group indicator */}
                {conversation.type === "group" && (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-blue-500 border-2 border-background rounded-full flex items-center justify-center">
                    <Hash className="h-2 w-2 text-white" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 overflow-hidden cursor-pointer" onClick={() => onSelectConversation(conversation.id)}>
                <div className="flex items-center justify-between mb-1 min-w-0">
                  <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden pr-2">
                    <h3 className="font-medium truncate min-w-0 max-w-[160px] lg:max-w-[180px]">{conversation.name}</h3>
                    {conversation.isPinned && (
                      <Pin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    )}
                    {conversation.isMuted && (
                      <VolumeX className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">
                    {formatMessageTime(conversation.lastMessage.timestamp)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 min-w-0">
                  <p className="text-sm text-muted-foreground truncate flex-1 min-w-0 max-w-[180px] lg:max-w-[200px] pr-2">
                    {conversation.lastMessage.content}
                  </p>

                  {/* Unread count */}
                  {conversation.unreadCount > 0 && (
                    <Badge variant="default" className="min-w-[20px] h-5 text-xs cursor-pointer flex-shrink-0">
                      {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Delete Button - Shown on hover */}
              
              <div className="hidden group-hover:flex flex-shrink-0 ml-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 cursor-pointer"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="cursor-pointer text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteClick(conversation.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the entire chat session and all messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
