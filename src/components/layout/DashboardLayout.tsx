"use client";

import { useMemo, useState } from "react";

import ChatSidebar from "@/components/sidebar/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";

import { INITIAL_CONVERSATIONS } from "@/lib/mock-data";
import { DEFAULT_MODEL } from "@/lib/ai/model-registry";
import type { Conversation, ChatMessage } from "@/types/chat";

export default function DashboardLayout() {
  const [conversations, setConversations] =
    useState<Conversation[]>(INITIAL_CONVERSATIONS);

  const [activeId, setActiveId] = useState<string | null>(null);

  const [selectedModel, setSelectedModel] =
    useState(DEFAULT_MODEL.id);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId),
    [conversations, activeId]
  );

  function handleNewChat() {
    setActiveId(null);
    setSidebarOpen(false);
  }

  function handleSelectConversation(id: string) {
    setActiveId(id);
    setSidebarOpen(false);
  }

  function handleConversationStart(id: string, message: string) {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      createdAt: new Date(),
    };

    setConversations((previous) => {
      const existing = previous.find((c) => c.id === id);

      if (existing) {
        return previous.map((c) =>
          c.id === id
            ? {
                ...c,
                messages: [...c.messages, userMessage],
                updatedAt: new Date(),
              }
            : c
        );
      }

      return [
        {
          id,
          title: message.slice(0, 40),
          updatedAt: new Date(),
          messages: [userMessage],
        },
        ...previous,
      ];
    });
  }

  function handleMessagesChange(
    id: string,
    messages: ChatMessage[]
  ) {
    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === id
          ? {
              ...conversation,
              messages,
              updatedAt: new Date(),
            }
          : conversation
      )
    );

    setActiveId(id);
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[#141416] text-white">
      {/* Desktop sidebar */}
      <aside className="hidden w-[280px] shrink-0 lg:flex">
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNewChat={handleNewChat}
        />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <aside className="relative z-10 flex h-full w-[280px] max-w-[85vw] shrink-0 shadow-2xl">
            <ChatSidebar
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelectConversation}
              onNewChat={handleNewChat}
              onClose={() => setSidebarOpen(false)}
            />
          </aside>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-black/60"
            aria-label="Close sidebar"
          />
        </div>
      )}

      {/* Main chat area */}
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <ChatWindow
          key={activeId ?? "new-chat"}
          conversationId={activeId ?? undefined}
          title={activeConversation?.title}
          initialMessages={activeConversation?.messages ?? []}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onMenuClick={() => setSidebarOpen(true)}
          onConversationStart={handleConversationStart}
          onMessagesChange={handleMessagesChange}
        />
      </div>
    </div>
  );
}