"use client"

import { useState, useMemo } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { type Message } from "../use-chat"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MessageSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  messages: Message[]
  onSelectMessage?: (message: Message) => void
  onScrollToMessage?: (messageId: string) => void
}

export function MessageSearch({
  open,
  onOpenChange,
  messages,
  onSelectMessage,
  onScrollToMessage
}: MessageSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter and search messages
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()
    return messages.filter(msg => 
      msg.content.toLowerCase().includes(query)
    )
  }, [searchQuery, messages])

  const handleSelectResult = (message: Message) => {
    onSelectMessage?.(message)
    onScrollToMessage?.(message.id)
    onOpenChange(false)
  }

  const handleClear = () => {
    setSearchQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search Messages</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search in messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Results */}
          <ScrollArea className="h-100 border rounded-md p-4">
            {searchResults.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {searchQuery ? "No messages found" : "Start typing to search messages"}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-4">
                  Found {searchResults.length} message{searchResults.length !== 1 ? "s" : ""}
                </p>
                {searchResults.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => handleSelectResult(message)}
                    className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors border border-transparent hover:border-border group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {/* Highlight the search term */}
                        <p className="text-sm line-clamp-2 wrap-break-word">
                          {highlightText(message.content, searchQuery)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(message.timestamp).toLocaleDateString()} {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-xs px-2 py-1 rounded bg-primary/10 text-primary whitespace-nowrap group-hover:bg-primary/20">
                        {message.senderId === "ai-bot-transactions" ? "Bot" : "You"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to highlight search query in text
function highlightText(text: string, query: string) {
  if (!query.trim()) return text

  const parts = text.split(new RegExp(`(${query})`, "gi"))
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-900">{part}</mark>
          : part
      )}
    </span>
  )
}
