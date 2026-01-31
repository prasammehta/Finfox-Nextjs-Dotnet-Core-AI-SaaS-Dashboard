"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { sendAiMessage, getAiHistory, getAiSession, getAiSessions, deleteAiSession, type AiChatRequest } from "./services/aiService"
import { useChat, type Message, type Conversation, type User } from "./use-chat"

const AI_BOT_ID = "ai-bot"
const AI_CONVERSATION_ID = "conv-ai-transactions"
const FIXED_SESSION_ID = 11 // Fixed session ID for AI chat (users don't create new sessions)

export type BotType = "finfox-advisor" | "transaction-helper"

const BOT_CONFIG: Record<BotType, { id: string; value: number; name: string; description: string; avatar: string }> = {
  "finfox-advisor": {
    id: "ai-bot-finfox",
    value: 0,
    name: "Finfox Advisor",
    description: "Your AI finance advisor",
    avatar: "/favicon-dark.png",
  },
  "transaction-helper": {
    id: "ai-bot-transactions",
    value: 1,
    name: "Transaction Helper",
    description: "Help with transaction management",
    avatar: "/favicon-dark.png",
  },
}

export function useAiChat() {
  const {
    conversations,
    messages,
    users,
    selectedConversation,
    setConversations,
    setMessages,
    setUsers,
    setSelectedConversation,
    addMessage,
  } = useChat()

  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [selectedBotType, setSelectedBotType] = useState<number>(0)
  const [currentSessionId, setCurrentSessionId] = useState<number>(FIXED_SESSION_ID)

  // Helper function to get BotType key from numeric value
  const getBotTypeKey = (value: number): BotType => {
    if (value === 1) return "transaction-helper"
    return "finfox-advisor"
  }

  // Initialize AI Bot on component mount
  useEffect(() => {
    const initializeAiBot = async () => {
      try {
        setLoading(true)

        // Get current user ID from localStorage
        let userId = "current-user"
        const currentUser = localStorage.getItem("current_user")
        if (currentUser) {
          try {
            const parsed = JSON.parse(currentUser)
            userId = parsed.userId
            setCurrentUserId(userId)
          } catch (e) {
            console.error("Failed to parse current_user from localStorage:", e)
          }
        }

        // Create AI Bot user
        const botTypeKey = getBotTypeKey(selectedBotType)
        const botConfig = BOT_CONFIG[botTypeKey]
        const aiBot: User = {
          id: botConfig.id,
          name: botConfig.name,
          email: "bot@finfox.com",
          avatar: botConfig.avatar,
          status: "online",
          lastSeen: new Date().toISOString(),
          role: "bot",
          department: "AI",
        }

        setUsers([aiBot])

        // Fetch all AI sessions from API
        try {
          console.log("Fetching AI sessions from API...")
          const sessionsResponse = await getAiSessions()
          console.log("=== FULL Sessions API Response ===")
          console.log("Response:", sessionsResponse)
          console.log("Response.data:", sessionsResponse?.data)
          console.log("Is data an array?", Array.isArray(sessionsResponse?.data))
          console.log("Data length:", sessionsResponse?.data?.length)

          if (sessionsResponse?.data && Array.isArray(sessionsResponse.data) && sessionsResponse.data.length > 0) {
            console.log(`Found ${sessionsResponse.data.length} sessions in API response`)
            
            // Filter out sessions without valid chatSessionId
            const validSessions = sessionsResponse.data.filter(
              (session) => session.chatSessionId !== undefined && session.chatSessionId !== null
            )
            
            console.log(`${validSessions.length} sessions have valid IDs after filtering`)

            if (validSessions.length === 0) {
              console.warn("No sessions with valid IDs, loading fixed session")
              await loadFixedSession(userId, botConfig)
            } else {
              // Convert sessions to conversations
              const sessionConversations: Conversation[] = validSessions.map((session) => {
                return {
                  id: `conv-ai-session-${session.chatSessionId}`,
                  type: "direct" as const,
                  participants: [botConfig.id],
                  name: session.title || `Chat ${session.chatSessionId}`,
                  avatar: botConfig.avatar,
                  lastMessage: {
                    id: `msg-${session.chatSessionId}-last`,
                    content: `${session.messageCount} messages`,
                    timestamp: session.createdAt,
                    senderId: botConfig.id,
                  },
                  unreadCount: 0,
                  isPinned: false,
                  isMuted: false,
                }
              })

              console.log(`Created ${sessionConversations.length} conversation objects`)
              setConversations(sessionConversations)
              console.log("Conversations set in state")

              // Select first session and load its messages
              if (sessionConversations.length > 0) {
                const firstSessionId = validSessions[0].chatSessionId
                setCurrentSessionId(firstSessionId)
                setSelectedConversation(sessionConversations[0].id)

                // Load messages for first session
                try {
                  console.log(`Loading messages for session ${firstSessionId}...`)
                  const sessionData = await getAiSession(firstSessionId)
                  if (sessionData?.data?.messages) {
                    const chatMessages: Message[] = sessionData.data.messages.map((msg: any, index: number) => ({
                      id: `msg-${firstSessionId}-${index}`,
                      content: msg.content,
                      timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
                      senderId: msg.role === "user" ? userId : botConfig.id,
                      type: "text" as const,
                      isEdited: false,
                      reactions: [],
                      replyTo: null,
                    }))

                    console.log(`Loaded ${chatMessages.length} messages for session ${firstSessionId}`)
                    setMessages(sessionConversations[0].id, chatMessages)
                  }
                } catch (err) {
                  console.warn("Could not load messages for first session:", err)
                }
              }
            }
          } else {
            console.warn("No sessions found, loading fixed session")
            await loadFixedSession(userId, botConfig)
          }
        } catch (err) {
          console.warn("Could not fetch sessions, loading fixed session:", err)
          await loadFixedSession(userId, botConfig)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error initializing AI bot:", error)
        toast.error("Failed to initialize chat")
        setLoading(false)
      }
    }

    const loadFixedSession = async (userId: string, botConfig: (typeof BOT_CONFIG)[BotType]) => {
      // Create initial AI Bot conversation
      const aiConversation: Conversation = {
        id: AI_CONVERSATION_ID,
        type: "direct",
        participants: [botConfig.id],
        name: botConfig.name,
        avatar: botConfig.avatar,
        lastMessage: {
          id: "msg-initial",
          content: `Hi! I'm ${botConfig.name}. ${botConfig.description}. How can I assist you today?`,
          timestamp: new Date().toISOString(),
          senderId: botConfig.id,
        },
        unreadCount: 0,
        isPinned: true,
        isMuted: false,
      }

      setConversations([aiConversation])
      setSelectedConversation(AI_CONVERSATION_ID)
      setCurrentSessionId(FIXED_SESSION_ID)

      // Fetch existing session messages
      try {
        console.log(`Fetching fixed session ${FIXED_SESSION_ID}...`)
        const sessionResponse = await getAiSession(FIXED_SESSION_ID)
        console.log("Session response:", sessionResponse)

        if (sessionResponse?.data?.messages && Array.isArray(sessionResponse.data.messages)) {
          const chatMessages: Message[] = sessionResponse.data.messages.map((msg: any, index: number) => ({
            id: `msg-${msg.chatMessageId || index}`,
            content: msg.content,
            timestamp: msg.createdAt || new Date().toISOString(),
            senderId: msg.role === "user" ? userId : botConfig.id,
            type: "text" as const,
            isEdited: false,
            reactions: [],
            replyTo: null,
          }))

          console.log(`Loaded ${chatMessages.length} messages from session`)
          setMessages(AI_CONVERSATION_ID, chatMessages)

          // Update last message in conversation
          if (chatMessages.length > 0) {
            const lastMsg = chatMessages[chatMessages.length - 1]
            const updatedConversation: Conversation = {
              ...aiConversation,
              lastMessage: {
                id: lastMsg.id,
                content: lastMsg.content,
                timestamp: lastMsg.timestamp,
                senderId: lastMsg.senderId,
              },
            }
            setConversations([updatedConversation])
          }
        } else {
          // No messages in session, use initial message
          const initialMessage: Message = {
            id: "msg-initial",
            content: "Hi! I'm your Transactions Bot. I can help you track and manage your transactions. How can I assist you today?",
            timestamp: new Date().toISOString(),
            senderId: botConfig.id,
            type: "text",
            isEdited: false,
            reactions: [],
            replyTo: null,
          }
          setMessages(AI_CONVERSATION_ID, [initialMessage])
        }
      } catch (sessionError) {
        console.warn("Could not fetch fixed session messages:", sessionError)
        const initialMessage: Message = {
          id: "msg-initial",
          content: "Hi! I'm your Transactions Bot. I can help you track and manage your transactions. How can I assist you today?",
          timestamp: new Date().toISOString(),
          senderId: botConfig.id,
          type: "text",
          isEdited: false,
          reactions: [],
          replyTo: null,
        }
        setMessages(AI_CONVERSATION_ID, [initialMessage])
      }
    }

    initializeAiBot()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load messages when user selects a different session
  useEffect(() => {
    const loadSelectedSessionMessages = async () => {
      if (!selectedConversation) return

      // Extract session ID from conversation ID (conv-ai-session-10 -> 10)
      const match = selectedConversation.match(/session-(\d+)/)
      if (!match) return

      const sessionId = parseInt(match[1])
      const botTypeKey = getBotTypeKey(selectedBotType)
      const botId = BOT_CONFIG[botTypeKey].id

      try {
        const sessionData = await getAiSession(sessionId)
        if (sessionData?.data?.messages) {
          const chatMessages = sessionData.data.messages.map((msg: any, index: number) => ({
            id: `msg-${sessionId}-${index}`,
            content: msg.content,
            timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
            senderId: msg.role === "user" ? (currentUserId || "current-user") : botId,
            type: "text" as const,
            isEdited: false,
            reactions: [],
            replyTo: null,
          }))
          setMessages(selectedConversation, chatMessages)
        }
      } catch (err) {
        console.warn("Could not load session messages:", err)
      }
    }

    loadSelectedSessionMessages()
  }, [selectedConversation, setMessages, currentUserId, selectedBotType])

  // Handle creating a new chat session
  const handleCreateNewChat = useCallback(() => {
    try {
      const botTypeKey = getBotTypeKey(selectedBotType)
      const botConfig = BOT_CONFIG[botTypeKey]

      // Create a new conversation with a temporary ID (sessionId 0 means new)
      const tempConversationId = `conv-ai-session-new-${Date.now()}`
      
      const newConversation: Conversation = {
        id: tempConversationId,
        type: "direct",
        participants: [botConfig.id],
        name: `New Chat`,
        avatar: botConfig.avatar,
        lastMessage: {
          id: "msg-new-initial",
          content: `Hi! I'm ${botConfig.name}. ${botConfig.description}. How can I assist you today?`,
          timestamp: new Date().toISOString(),
          senderId: botConfig.id,
        },
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
      }

      const initialMessage: Message = {
        id: "msg-new-initial",
        content: `Hi! I'm ${botConfig.name}. ${botConfig.description}. How can I assist you today?`,
        timestamp: new Date().toISOString(),
        senderId: botConfig.id,
        type: "text",
        isEdited: false,
        reactions: [],
        replyTo: null,
      }

      // Add new conversation to the list (at the top)
      setConversations([newConversation, ...conversations])
      setMessages(tempConversationId, [initialMessage])
      setSelectedConversation(tempConversationId)
      setCurrentSessionId(0) // 0 indicates new session that will be created on first message
    } catch (error) {
      console.error("Error creating new chat:", error)
      toast.error("Failed to create new chat")
    }
  }, [selectedBotType, conversations, setConversations, setMessages, setSelectedConversation])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      try {
        setSending(true)

        // Ensure we have a selected conversation
        if (!selectedConversation) {
          console.error("No conversation selected")
          setSending(false)
          return
        }

        // Get current user ID from localStorage
        const currentUser = localStorage.getItem("current_user")
        if (!currentUser) {
          console.error("User not authenticated")
          setSending(false)
          return
        }

        const { userId } = JSON.parse(currentUser)

        // Add user message to store using selected conversation
        const userMessage: Message = {
          id: `msg-user-${Date.now()}`,
          content,
          timestamp: new Date().toISOString(),
          senderId: userId,
          type: "text",
          isEdited: false,
          reactions: [],
          replyTo: null,
        }

        addMessage(selectedConversation, userMessage)

        // Send to API with current session ID and bot type
        const request: AiChatRequest = {
          userId,
          chatSessionId: currentSessionId,
          botType: selectedBotType,
          message: content,
        }

        console.log("Sending message request:", request)
        
        try {
          const response = await sendAiMessage(request)
          console.log("Raw response from API:", response)

          // Extract AI response from the actual API response structure
          // API returns: { data: { chatSessionId, messages[], lastAssistantMessage: { role, content, createdAt }, error }, message, status }
          let aiResponseText = ""
          let timestamp = new Date().toISOString()

          // Primary path: Get the last assistant message
          if (response?.data?.lastAssistantMessage?.content) {
            aiResponseText = response.data.lastAssistantMessage.content
            if (response.data.lastAssistantMessage.createdAt) {
              timestamp = response.data.lastAssistantMessage.createdAt
            }
          }
          // Fallback: Try to get from messages array (get the last assistant message)
          else if (response?.data?.messages && Array.isArray(response.data.messages)) {
            const lastAssistantMsg = [...response.data.messages]
              .reverse()
              .find((msg: any) => msg.role === "assistant")
            if (lastAssistantMsg?.content) {
              aiResponseText = lastAssistantMsg.content
              if (lastAssistantMsg.createdAt) {
                timestamp = lastAssistantMsg.createdAt
              }
            }
          }

          console.log("Extracted AI response:", aiResponseText)
          console.log("Response timestamp:", timestamp)

          // If we got a response, display it
          if (aiResponseText && aiResponseText.trim()) {
            const botTypeKey = getBotTypeKey(selectedBotType)
            const aiMessage: Message = {
              id: `msg-ai-${Date.now()}`,
              content: aiResponseText,
              timestamp,
              senderId: BOT_CONFIG[botTypeKey].id,
              type: "text",
              isEdited: false,
              reactions: [],
              replyTo: null,
            }

            addMessage(selectedConversation, aiMessage)
          } else {
            console.warn("No response content extracted from API response:", response)
            toast.error("Failed to get AI response")
          }
        } catch (apiError) {
          console.error("API call error:", apiError)
          toast.error(`Failed to get AI response: ${apiError instanceof Error ? apiError.message : "Unknown error"}`)
        }
      } catch (error) {
        console.error("Error in sendMessage:", error)
        toast.error(error instanceof Error ? error.message : "Failed to send message")
      } finally {
        setSending(false)
      }
    },
    [addMessage, selectedBotType, selectedConversation, currentSessionId]
  )

  const handleDeleteSession = (sessionId: number) => {
    // Get the conversation ID for this session
    const conversationId = `conv-ai-session-${sessionId}`
    
    // Get the current bot config
    const botTypeKey = Object.entries(BOT_CONFIG).find(([_, config]) => config.value === selectedBotType)?.[0] as BotType || "transaction-helper"
    const botConfig = BOT_CONFIG[botTypeKey]
    
    // Create initial welcome message
    const initialMessage: Message = {
      id: "msg-initial",
      content: "Hi! I'm your Transactions Bot. I can help you track and manage your transactions. How can I assist you today?",
      timestamp: new Date().toISOString(),
      senderId: botConfig.id,
      type: "text",
      isEdited: false,
      reactions: [],
      replyTo: null,
    }
    
    // Set messages with just the initial message
    setMessages(conversationId, [initialMessage])
    
    // Update conversation with fresh timestamp and initial message
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: {
            id: initialMessage.id,
            content: initialMessage.content,
            timestamp: initialMessage.timestamp,
            senderId: initialMessage.senderId,
          },
          unreadCount: 0,
        }
      }
      return conv
    })
    setConversations(updatedConversations)

    // Keep the conversation selected (don't delete it immediately)
    // The conversation will be there but with fresh initial message
  }

  return {
    conversations,
    messages,
    users,
    selectedConversation,
    loading,
    sending,
    currentSessionId,
    currentUserId,
    selectedBotType,
    setSelectedBotType,
    botOptions: Object.entries(BOT_CONFIG).map(([key, config]) => ({
      value: config.value,
      label: config.name,
    })),
    sendMessage,
    setSelectedConversation,
    deleteSession: handleDeleteSession,
    createNewChat: handleCreateNewChat,
  }
}