"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import ChatSidebar from "@/components/sidebar/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";

import {
  getConversations,
  getMessages,
  getConversationModel,
  deleteConversation,
} from "@/lib/supabase/chat";

import { DEFAULT_MODEL } from "@/lib/ai/model-registry";
import type { Conversation, ChatMessage } from "@/types/chat";
import { generateConversationTitle } from "@/lib/chat-utils";
import {
  getSavedModel,
  saveSelectedModel,
} from "@/lib/ai/model-preference";

const ACTIVE_CHAT_KEY = "nexus-active-conversation";

export default function DashboardLayout() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selectionRequest = useRef(0);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId),
    [conversations, activeId]
  );

  // Load conversations and restore the previously active chat.
  useEffect(() => {
    let mounted = true;

    async function initializeDashboard() {
      try {
        setLoading(true);
        setLoadError("");

        const savedModel = getSavedModel();

        if (savedModel) {
          setSelectedModel(savedModel);
        }

        const data = await getConversations();

        if (!mounted) return;

        setConversations(data);

        const savedId = localStorage.getItem(ACTIVE_CHAT_KEY);

        if (savedId && data.some((c) => c.id === savedId)) {
          const [messages, conversationModel] = await Promise.all([
            getMessages(savedId),
            getConversationModel(savedId),
          ]);

          if (!mounted) return;

          setConversations((previous) =>
            previous.map((conversation) =>
              conversation.id === savedId
                ? { ...conversation, messages }
                : conversation
            )
          );

          if (conversationModel) {
            setSelectedModel(conversationModel);
            saveSelectedModel(conversationModel);
          }

          setActiveId(savedId);
        } else {
          localStorage.removeItem(ACTIVE_CHAT_KEY);
        }
      } catch (error) {
        console.error("Dashboard initialization failed:", error);

        if (mounted) {
          setLoadError(
            "Couldn't load your conversations. Please refresh."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initializeDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  // Start a new conversation.
  function handleNewChat() {
    selectionRequest.current += 1;

    localStorage.removeItem(ACTIVE_CHAT_KEY);

    setActiveId(null);
    setSidebarOpen(false);
    setLoadError("");
  }

  // Fetch messages before mounting ChatWindow.
  async function handleSelectConversation(id: string) {
    const requestId = ++selectionRequest.current;

    setSidebarOpen(false);
    setLoadError("");

    try {
      const [messages, savedModel] = await Promise.all([
        getMessages(id),
        getConversationModel(id),
      ]);

      if (requestId !== selectionRequest.current) return;

      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === id
            ? { ...conversation, messages }
            : conversation
        )
      );

      if (savedModel) {
        setSelectedModel(savedModel);
        saveSelectedModel(savedModel);
      }

      setActiveId(id);
      localStorage.setItem(ACTIVE_CHAT_KEY, id);
    } catch (error) {
      console.error("Failed to load conversation:", error);

      if (requestId === selectionRequest.current) {
        setLoadError(
          "Couldn't open this conversation. Please try again."
        );
      }
    }
  }

  // Delete a conversation from Supabase and local state.
  async function handleDeleteConversation(id: string) {
    if (deletingId) return;

    setDeletingId(id);
    setLoadError("");

    try {
      await deleteConversation(id);

      // Ignore any conversation selection that was still loading.
      selectionRequest.current += 1;

      setConversations((previous) =>
        previous.filter((conversation) => conversation.id !== id)
      );

      // If the deleted conversation was open, return to a new chat.
      if (activeId === id) {
        setActiveId(null);
        localStorage.removeItem(ACTIVE_CHAT_KEY);
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);

      setLoadError(
        "Couldn't delete this conversation. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // Add a new conversation to local state.
  function handleConversationStart(id: string, message: string) {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      createdAt: new Date(),
    };

    localStorage.setItem(ACTIVE_CHAT_KEY, id);
    setActiveId(id);

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
          title: generateConversationTitle(message),
          updatedAt: new Date(),
          messages: [userMessage],
        },
        ...previous,
      ];
    });
  }

  // Keep local conversation history synchronized with ChatWindow.
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
    localStorage.setItem(ACTIVE_CHAT_KEY, id);
  }

  // Save the selected model preference.
  function handleModelChange(modelId: string) {
    setSelectedModel(modelId);
    saveSelectedModel(modelId);
  }

  // Shared sidebar props.
  const sidebarProps = {
    conversations,
    activeId,
    onSelect: handleSelectConversation,
    onNewChat: handleNewChat,
    onDelete: handleDeleteConversation,
    deletingId,
  };

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[#141416] text-white">
      {/* Desktop sidebar */}
      <aside className="hidden w-[280px] shrink-0 lg:flex">
        <ChatSidebar {...sidebarProps} />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <aside className="relative z-10 flex h-full w-[280px] max-w-[85vw] shrink-0 shadow-2xl">
            <ChatSidebar
              {...sidebarProps}
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
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {loadError && (
          <div
            role="alert"
            className="border-b border-red-500/20 bg-red-500/10 px-4 py-2 text-center text-sm text-red-400"
          >
            {loadError}
          </div>
        )}

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">
            Loading your conversations...
          </div>
        ) : (
          <ChatWindow
            key={activeId ?? "new-chat"}
            conversationId={activeId ?? undefined}
            title={activeConversation?.title}
            initialMessages={activeConversation?.messages ?? []}
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
            onMenuClick={() => setSidebarOpen(true)}
            onConversationStart={handleConversationStart}
            onMessagesChange={handleMessagesChange}
          />
        )}
      </div>
    </div>
  );
}