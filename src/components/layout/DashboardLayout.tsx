
"use client";

import { useMemo, useState } from "react";

import ChatSidebar from "@/components/sidebar/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";

import { INITIAL_CONVERSATIONS } from "@/lib/mock-data";
import { DEFAULT_MODEL } from "@/lib/ai/model-registry";
import type { Conversation } from "@/types/chat";

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

  function handleSend(message: string) {
    let conversationId = activeId;

    if (!conversationId) {
      conversationId = crypto.randomUUID();
      setActiveId(conversationId);
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: message,
      createdAt: new Date(),
    };

    setConversations((previous) => {
      const existing = previous.find(
        (conversation) => conversation.id === conversationId
      );

      if (existing) {
        return previous.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: [...conversation.messages, userMessage],
                updatedAt: new Date(),
              }
            : conversation
        );
      }

      const newConversation: Conversation = {
        id: conversationId!,
        title: message.slice(0, 40),
        updatedAt: new Date(),
        messages: [userMessage],
      };

      return [newConversation, ...previous];
    });
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-[#141416] text-white">
      {/* Desktop sidebar */}
      <div className="hidden w-[280px] shrink-0 lg:block">
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-[280px] max-w-[85vw]">
            <ChatSidebar
              conversations={conversations}
              activeId={activeId}
              onSelect={setActiveId}
              onNewChat={handleNewChat}
              onClose={() => setSidebarOpen(false)}
            />
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="flex-1 bg-black/60"
            aria-label="Close sidebar overlay"
          />
        </div>
      )}

      <ChatWindow
        key={activeId ?? "new-chat"}
        title={activeConversation?.title}
        initialMessages={activeConversation?.messages ?? []}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        onMenuClick={() => setSidebarOpen(true)}
        onSend={handleSend}
      />
    </div>
  );
}
