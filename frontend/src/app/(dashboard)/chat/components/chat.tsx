"use client"

import { useState } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ChatHeader } from "./chat-header"
import { MessageList } from "./message-list"
import { MessageInput } from "./message-input"
import { MessageSearch } from "./message-search"
import { toast } from "sonner"
import { deleteAiSession } from "../services/aiService"
import { type Conversation, type Message, type User } from "../use-chat"

interface ChatProps {
  conversations: Conversation[]
  messages: Record<string, Message[]>
  users: User[]
  selectedConversation: string | null
  onSendMessage?: (content: string) => Promise<void> | void
  isLoading?: boolean
  onSelectConversation?: (id: string) => void
  currentUserId?: string | null
  selectedBotType?: number
  botOptions?: Array<{ value: number; label: string }>
  onBotTypeChange?: (value: string) => void
  onDeleteSession?: (sessionId: number) => void
  onCreateNewChat?: () => void
}

export function Chat({
  conversations,
  messages,
  users,
  selectedConversation,
  onSendMessage,
  isLoading = false,
  onSelectConversation,
  currentUserId,
  selectedBotType = 0,
  botOptions = [],
  onBotTypeChange,
  onDeleteSession,
  onCreateNewChat,
}: ChatProps) {
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const messageListRef = useState<{ scrollToMessage: (id: string) => void } | null>(null)[0]
  const currentConversation = conversations.find(conv => conv.id === selectedConversation)
  const currentMessages = selectedConversation ? messages[selectedConversation] || [] : []

  const handleScrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`)
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" })
      // Highlight the message briefly
      messageElement.style.backgroundColor = "rgba(34, 197, 94, 0.1)"
      setTimeout(() => {
        messageElement.style.backgroundColor = ""
      }, 2000)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return

    if (onSendMessage) {
      await onSendMessage(content)
    }
  }

  const handleClearConversation = async () => {
    if (!selectedConversation) return

    try {
      // Extract session ID from conversation ID if it's a session-based conversation
      const match = selectedConversation.match(/session-(\d+)/)
      const sessionId = match ? parseInt(match[1]) : 11 // Default to fixed session ID 11

      // Call delete session API
      await deleteAiSession(sessionId)
      
      // Clear messages and reset conversation
      if (onDeleteSession) {
        onDeleteSession(sessionId)
      }

      // Clear reply state
      setReplyingTo(null)

      toast.success("Conversation cleared successfully")
    } catch (error) {
      console.error("Error clearing conversation:", error)
      toast.error("Failed to clear conversation")
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-full w-full flex flex-col rounded-lg border overflow-hidden bg-background">
        {/* Chat Header */}
        <div className="flex items-center h-16 px-6 border-b bg-background shrink-0">
          <div className="flex-1">
            <ChatHeader
              conversation={currentConversation || null}
              users={users}
              onToggleMute={() => {}}
              onToggleInfo={() => {}}
              onOpenSearch={() => setSearchOpen(true)}
              onClearConversation={handleClearConversation}
            />
          </div>
        </div>

        {/* Messages Container - Isolated scroll */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {selectedConversation ? (
            <>
              <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ overscrollBehavior: 'contain' }}>
                <MessageList
                  messages={currentMessages}
                  users={users}
                  currentUserId={currentUserId || undefined}
                  onReply={setReplyingTo}
                  isLoading={isLoading}
                />
              </div>

              {/* Message Input */}
              <div className="shrink-0 border-t bg-background">
                <MessageInput
                  onSendMessage={handleSendMessage}
                  disabled={isLoading}
                  placeholder={`Message ${currentConversation?.name || "Finfox Advisor"}...`}
                  selectedBotType={selectedBotType}
                  botOptions={botOptions}
                  onBotTypeChange={onBotTypeChange}
                  replyingTo={replyingTo}
                  onClearReply={() => setReplyingTo(null)}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-semibold">Welcome to Finfox Chat</h2>
                <p className="text-muted-foreground">Start a new conversation to get financial advice</p>
                <button
                  onClick={onCreateNewChat}
                  className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Search Dialog */}
      <MessageSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        messages={currentMessages}
        onSelectMessage={() => {}}
        onScrollToMessage={handleScrollToMessage}
      />
    </TooltipProvider>
  )
}
