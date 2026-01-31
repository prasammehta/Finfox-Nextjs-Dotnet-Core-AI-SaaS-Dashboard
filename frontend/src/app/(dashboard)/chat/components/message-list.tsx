"use client"

import { useEffect, useRef, useState } from "react"
import { format, isToday, isYesterday } from "date-fns"
import { CheckCheck, MoreHorizontal, Reply, Copy, Trash2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { type Message, type User } from "../use-chat"
import { LoadingDots } from "./loading-dots"

interface MessageListProps {
  messages: Message[]
  users: User[]
  currentUserId?: string
  onReply?: (message: Message) => void
  isLoading?: boolean
  onScrollToMessage?: (messageId: string) => void
}

export function MessageList({ messages, users, currentUserId = "current-user", onReply, isLoading = false, onScrollToMessage }: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [longPressedMessageId, setLongPressedMessageId] = useState<string | null>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (bottomRef.current) {
      // Use a small delay to ensure DOM is updated
      const scrollTimer = setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 0)

      return () => clearTimeout(scrollTimer)
    }
  }, [messages])

  // Handle scroll to specific message
  useEffect(() => {
    if (onScrollToMessage) {
      const handleScroll = (messageId: string) => {
        const messageElement = messageRefs.current[messageId]
        if (messageElement && scrollAreaRef.current) {
          messageElement.scrollIntoView({ behavior: "smooth", block: "center" })
          // Highlight the message briefly
          messageElement.style.backgroundColor = "rgba(34, 197, 94, 0.1)"
          setTimeout(() => {
            messageElement.style.backgroundColor = ""
          }, 2000)
        }
      }
      
      return () => {
        // Store the handler for external use
      }
    }
  }, [onScrollToMessage])

  const getUserById = (userId: string) => {
    if (userId === currentUserId) {
      return {
        id: currentUserId,
        name: "You",
        avatar: "/avatars/current-user.png",
        status: "online" as const,
        email: "you@example.com",
        lastSeen: new Date().toISOString(),
        role: "Developer",
        department: "Engineering"
      }
    }
    return users.find(user => user.id === userId)
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    if (isToday(date)) {
      return format(date, "HH:mm")
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, "HH:mm")}`
    } else {
      return format(date, "MMM d, HH:mm")
    }
  }

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success("Message copied to clipboard")
  }

  const handleReplyClick = (message: Message) => {
    if (onReply) {
      onReply(message)
    }
  }

  const handleLongPress = (messageId: string) => {
    longPressTimerRef.current = setTimeout(() => {
      setLongPressedMessageId(messageId)
    }, 500)
  }

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }
  }

  const handleTouchStart = (messageId: string) => {
    handleLongPress(messageId)
  }

  const handleTouchEnd = () => {
    handleLongPressEnd()
  }

  const shouldShowAvatar = (message: Message, index: number) => {
    if (message.senderId === currentUserId) return false
    if (index === 0) return true

    const prevMessage = messages[index - 1]
    return prevMessage.senderId !== message.senderId
  }

  const shouldShowName = (message: Message, index: number) => {
    if (message.senderId === currentUserId) return false
    if (index === 0) return true

    const prevMessage = messages[index - 1]
    return prevMessage.senderId !== message.senderId
  }

  const isConsecutiveMessage = (message: Message, index: number) => {
    if (index === 0) return false

    const prevMessage = messages[index - 1]
    const currentDate = new Date(message.timestamp)
    const prevDate = new Date(prevMessage.timestamp)

    // Check if dates are valid
    if (isNaN(currentDate.getTime()) || isNaN(prevDate.getTime())) {
      return false
    }

    const timeDiff = currentDate.getTime() - prevDate.getTime()

    return prevMessage.senderId === message.senderId && timeDiff < 5 * 60 * 1000 // 5 minutes
  }

  const groupMessagesByDay = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = []

    messages.forEach((message) => {
      const messageDate = new Date(message.timestamp)

      // Skip messages with invalid timestamps
      if (isNaN(messageDate.getTime())) {
        return
      }

      const formattedDate = format(messageDate, "yyyy-MM-dd")
      const lastGroup = groups[groups.length - 1]

      if (lastGroup && lastGroup.date === formattedDate) {
        lastGroup.messages.push(message)
      } else {
        groups.push({
          date: formattedDate,
          messages: [message]
        })
      }
    })

    return groups
  }

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) {
      return "Today"
    } else if (isYesterday(date)) {
      return "Yesterday"
    } else {
      return format(date, "EEEE, MMMM d")
    }
  }

  const messageGroups = groupMessagesByDay(messages)

  return (
    <div className="flex-1 min-h-0 px-4 overflow-y-auto overflow-x-hidden" ref={scrollAreaRef}>
      <div className="space-y-4 py-4">
        {messageGroups.map((group) => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex items-center justify-center py-2">
              <div className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border">
                {formatDateHeader(group.date)}
              </div>
            </div>

            {/* Messages for this day */}
            <div className="space-y-1">
              {group.messages.map((message, messageIndex) => {
                const user = getUserById(message.senderId)
                const isOwnMessage = message.senderId === currentUserId
                const showAvatar = shouldShowAvatar(message, messageIndex)
                const showName = shouldShowName(message, messageIndex)
                const isConsecutive = isConsecutiveMessage(message, messageIndex)
                const isLongPressed = longPressedMessageId === message.id

                return (
                  <div
                    id={`message-${message.id}`}
                    key={message.id}
                    ref={(el) => {
                      if (el) messageRefs.current[message.id] = el
                    }}
                    className={cn(
                      "flex gap-3 group transition-colors duration-200",
                      isOwnMessage && "flex-row-reverse",
                      isConsecutive && !isOwnMessage && "ml-12"
                    )}
                    onTouchStart={() => handleTouchStart(message.id)}
                    onTouchEnd={handleTouchEnd}
                    onMouseLeave={() => setLongPressedMessageId(null)}
                  >
                    {/* Avatar */}
                    {!isOwnMessage && (
                      <div className="w-8">
                        {showAvatar && user && (
                          <Avatar className="h-8 w-8 cursor-pointer">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="text-xs">
                              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    )}

                    {/* Message content */}
                    <div className={cn("flex-1 max-w-[70%]", isOwnMessage && "flex flex-col items-end")}>
                      {/* Sender name for group messages */}
                      {showName && user && !isOwnMessage && (
                        <div className="text-sm font-medium text-foreground mb-1">
                          {user.name}
                        </div>
                      )}

                      {/* Message bubble */}
                      <div className="relative group/message">
                        <div
                          className={cn(
                            "rounded-lg px-3 py-2 text-sm wrap-break-word",
                            isOwnMessage
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted",
                            isConsecutive && "mt-1"
                          )}
                        >
                          <div className="prose prose-sm dark:prose-invert max-w-none overflow-hidden">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
                                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                                em: ({ node, ...props }) => <em className="italic" {...props} />,
                                code: ({ node, ...props }) => (
                                  <code
                                    className={cn(
                                      "font-mono text-sm px-1 rounded block bg-muted/50 p-2 overflow-x-auto"
                                    )}
                                    {...props}
                                  />
                                ),
                                blockquote: ({ node, ...props }) => (
                                  <blockquote className="border-l-4 border-muted pl-3 italic mb-2" {...props} />
                                ),
                                table: ({ node, ...props }) => (
                                  <div className="overflow-x-auto mb-2 rounded border border-muted bg-muted/20">
                                    <table className="w-full text-sm border-collapse" {...props} />
                                  </div>
                                ),
                                thead: ({ node, ...props }) => (
                                  <thead className="bg-muted/50 border-b-2 border-muted" {...props} />
                                ),
                                tbody: ({ node, ...props }) => (
                                  <tbody className="divide-y divide-muted" {...props} />
                                ),
                                tr: ({ node, ...props }) => (
                                  <tr className="hover:bg-muted/40 transition-colors" {...props} />
                                ),
                                th: ({ node, ...props }) => (
                                  <th className="px-3 py-2 text-left font-semibold border-r border-muted last:border-r-0 whitespace-nowrap" {...props} />
                                ),
                                td: ({ node, ...props }) => (
                                  <td className="px-3 py-2 border-r border-muted last:border-r-0 whitespace-nowrap" {...props} />
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>

                          {/* Message reactions */}
                          {message.reactions.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {message.reactions.map((reaction, idx) => (
                                <div
                                  key={idx}
                                  className={cn(
                                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border cursor-pointer",
                                    "bg-background/90 backdrop-blur-sm shadow-sm"
                                  )}
                                >
                                  <span>{reaction.emoji}</span>
                                  <span className="text-muted-foreground">{reaction.count}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Timestamp and status */}
                          <div className={cn(
                            "flex items-center gap-1 mt-1 text-xs",
                            isOwnMessage
                              ? "text-primary-foreground/70 justify-end"
                              : "text-muted-foreground"
                          )}>
                            <span>{formatMessageTime(message.timestamp)}</span>
                            {message.isEdited && (
                              <span className="italic">(edited)</span>
                            )}
                            {isOwnMessage && (
                              <div className="flex">
                                {/* Message status indicators */}
                                <CheckCheck className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Message actions - Desktop hover & mobile long press */}
                        {(isLongPressed || (typeof window !== 'undefined' && window.innerWidth > 768)) && (
                          <div className={cn(
                            "absolute top-1/2 -translate-y-1/2 -right-16 opacity-0 group-hover/message:opacity-100 transition-opacity",
                            isLongPressed && "opacity-100"
                          )}>
                            <div className="flex gap-1 bg-background border rounded-lg p-1 shadow-lg">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 cursor-pointer hover:bg-muted"
                                onClick={() => handleReplyClick(message)}
                                title="Reply to message"
                              >
                                <Reply className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 cursor-pointer hover:bg-muted"
                                onClick={() => handleCopyMessage(message.content)}
                                title="Copy message"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              {isOwnMessage && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 cursor-pointer hover:bg-destructive/10 text-destructive"
                                  title="Delete message"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Mobile dropdown menu */}
                        {typeof window !== 'undefined' && window.innerWidth <= 768 && !isLongPressed && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 cursor-pointer absolute top-0 opacity-0 group-hover/message:opacity-100"
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isOwnMessage ? "end" : "start"}>
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={() => handleReplyClick(message)}
                              >
                                <Reply className="h-4 w-4 mr-2" />
                                Reply
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={() => handleCopyMessage(message.content)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                              </DropdownMenuItem>
                              {isOwnMessage && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="cursor-pointer text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3">
            {/* Avatar space for alignment */}
            <div className="w-8" />

            {/* Loading message bubble */}
            <div className="flex-1">
              <div className="w-fit rounded-lg px-2.5 py-1.5 bg-muted">
                <LoadingDots />
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
