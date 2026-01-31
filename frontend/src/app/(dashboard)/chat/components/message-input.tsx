"use client"

import { useState, useRef } from "react"
import { Loader2, Send, ChevronDown, X, Brain, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type Message } from "../use-chat"

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void> | void
  disabled?: boolean
  placeholder?: string
  selectedBotType?: number
  botOptions?: Array<{ value: number; label: string }>
  onBotTypeChange?: (value: string) => void
  replyingTo?: Message | null
  onClearReply?: () => void
}

export function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
  selectedBotType = 0,
  botOptions = [],
  onBotTypeChange,
  replyingTo,
  onClearReply,
}: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Bot type to icon mapping
  const botIconMap: Record<number, React.ReactNode> = {
    0: <Brain className="h-4 w-4" />,
    1: <Zap className="h-4 w-4" />,
  }

  const getBotLabel = (botType: number): string => {
    const bot = botOptions.find(opt => opt.value === botType)
    return bot?.label || "Bot"
  }

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim()
    if (trimmedMessage && !disabled && !isSending) {
      try {
        setIsSending(true)
        await onSendMessage(trimmedMessage)
        setMessage("")
        setIsTyping(false)

        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto"
        }
      } catch (error) {
        console.error("Error sending message:", error)
      } finally {
        setIsSending(false)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setMessage(value)

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true)
    } else if (!value.trim() && isTyping) {
      setIsTyping(false)
    }
  }

  return (
    <div className="p-4">
      {/* Reply preview */}
      {replyingTo && (
        <div className="mb-3 border-l-4 border-primary bg-muted/50 p-3 rounded flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-primary mb-1">Replying to message</div>
            <div className="text-sm text-muted-foreground truncate">{replyingTo.content.substring(0, 100)}...</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 cursor-pointer ml-2 shrink-0"
            onClick={onClearReply}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex items-end gap-2">
        {/* Bot Type Selector - Icon dropdown on mobile, button with label on desktop */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer h-10 gap-2"
            >
              {/* Mobile: Icon only */}
              <span className="md:hidden">
                {botIconMap[selectedBotType] || <Brain className="h-4 w-4" />}
              </span>
              
              {/* Desktop: Icon + label + chevron */}
              <span className="hidden md:flex md:items-center md:gap-2">
                {botIconMap[selectedBotType] || <Brain className="h-4 w-4" />}
                <span className="text-sm max-w-30 truncate">{getBotLabel(selectedBotType)}</span>
                <ChevronDown className="h-3 w-3" />
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {botOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onBotTypeChange?.(option.value.toString())}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {botIconMap[option.value] || <Brain className="h-4 w-4" />}
                  <span>{option.label}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyPress}
          disabled={disabled || isSending}
          className="flex-1 min-h-10 max-h-30 resize-none rounded-lg border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || disabled || isSending}
          className="cursor-pointer disabled:cursor-not-allowed"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
