"use client"

import { Chat } from "./components/chat"
import { useAiChat } from "./use-chat-ai"

export default function ChatPage() {
  const { 
    conversations, 
    messages, 
    users, 
    selectedConversation, 
    loading, 
    sending, 
    currentUserId,
    selectedBotType,
    setSelectedBotType,
    botOptions,
    sendMessage,
    setSelectedConversation,
    deleteSession,
    createNewChat,
  } = useAiChat()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading chat...</div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-80px)] flex flex-col w-full bg-background overflow-hidden">
      <Chat
        conversations={conversations}
        messages={messages}
        users={users}
        selectedConversation={selectedConversation}
        onSendMessage={sendMessage}
        isLoading={sending}
        currentUserId={currentUserId}
        onSelectConversation={setSelectedConversation}
        selectedBotType={selectedBotType}
        botOptions={botOptions}
        onBotTypeChange={(value) => setSelectedBotType(parseInt(value))}
        onDeleteSession={deleteSession}
        onCreateNewChat={createNewChat}
      />
    </div>
  )
}
