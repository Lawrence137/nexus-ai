"use client";

import { useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { Menu, RefreshCw } from "lucide-react";

import type { ChatMessage } from "@/types/chat";
import {
  createConversation,
  upsertMessage,
} from "@/lib/supabase/chat";

import ModelSelector from "./ModelSelector";
import WelcomeScreen from "./WelcomeScreen";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { generateConversationTitle } from "@/lib/chat-utils"; 

type Props = {
  conversationId?: string;
  title?: string;
  initialMessages: ChatMessage[];
  selectedModel: string;
  onModelChange: (id: string) => void;
  onMenuClick: () => void;
  onConversationStart: (id: string, message: string) => void;
  onMessagesChange: (id: string, messages: ChatMessage[]) => void;
};

function toUIMessages(messages: ChatMessage[]): UIMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    parts: [{ type: "text" as const, text: message.content }],
  }));
}

function toChatMessages(messages: UIMessage[]): ChatMessage[] {
  return messages
    .filter(
      (message) =>
        message.role === "user" || message.role === "assistant"
    )
    .map((message) => ({
      id: message.id,
      role: message.role as "user" | "assistant",
      content: message.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join(""),
      createdAt: new Date(),
    }));
}

export default function ChatWindow({
  conversationId,
  title,
  initialMessages,
  selectedModel,
  onModelChange,
  onMenuClick,
  onConversationStart,
  onMessagesChange,
}: Props) {
  const [chatId] = useState(
    () => conversationId ?? crypto.randomUUID()
  );

  const [persistenceError, setPersistenceError] = useState("");

  const startedRef = useRef(
    Boolean(conversationId) || initialMessages.length > 0
  );

  const {
    messages,
    sendMessage,
    regenerate,
    stop,
    status,
    error,
  } = useChat({
    id: chatId,
    messages: toUIMessages(initialMessages),

    onFinish: async ({ messages }) => {
      const chatMessages = toChatMessages(messages);

      try {
        // Upsert all messages so regenerated responses update
        // their existing database records.
        for (const message of chatMessages) {
          await upsertMessage(chatId, message);
        }

        setPersistenceError("");
        onMessagesChange(chatId, chatMessages);
      } catch (err) {
        console.error("Message persistence error:", err);
        setPersistenceError(
          "Your response was generated, but saving it failed. Please check your connection."
        );
      }
    },

    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  const isLoading =
    status === "submitted" || status === "streaming";

  async function handleSend(message: string) {
    if (status !== "ready") return;

    setPersistenceError("");

    try {
      if (!startedRef.current) {
        // Create the database conversation using the same ID
        // already assigned to this AI chat.
const conversationTitle = generateConversationTitle(message);

await createConversation(
  conversationTitle,
  selectedModel,
  chatId
);

        onConversationStart(chatId, message);
        startedRef.current = true;
      }

      await sendMessage(
        { text: message },
        {
          body: {
            modelId: selectedModel,
          },
        }
      );
    } catch (err) {
      console.error("Unable to start conversation:", err);

      setPersistenceError(
        err instanceof Error
          ? err.message
          : "Unable to save your conversation. Please try again."
      );
    }
  }

  async function handleRegenerate() {
    if (status !== "ready") return;

    setPersistenceError("");

    await regenerate({
      body: {
        modelId: selectedModel,
      },
    });
  }

  async function handleRetry() {
    if (status !== "ready" || !error) return;

    setPersistenceError("");

    await regenerate({
      body: {
        modelId: selectedModel,
      },
    });
  }

  const displayMessages = toChatMessages(messages);

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#141416]">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="shrink-0 rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {title || "New conversation"}
            </p>

            <p className="text-xs text-zinc-500">
              AI workspace
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <ModelSelector
            selectedModel={selectedModel}
            onSelect={onModelChange}
          />
        </div>
      </header>

      {/* Messages */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain">
        {displayMessages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-3">
            <WelcomeScreen onPrompt={handleSend} />
          </div>
        ) : (
          <MessageList
            messages={displayMessages}
            isWaiting={status === "submitted"}
            onRegenerate={
              status === "ready"
                ? handleRegenerate
                : undefined
            }
          />
        )}

        {(error || persistenceError) && (
          <div
            role="alert"
            className="mx-auto mb-4 flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-4"
          >
            <p className="text-sm text-red-400">
              {persistenceError ||
                "Your response couldn't be generated. Please try again."}
            </p>

            {error && (
              <button
                type="button"
                onClick={handleRetry}
                disabled={status !== "ready"}
                className="flex shrink-0 items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            )}
          </div>
        )}
      </div>

      {/* Chat input */}
      <div className="shrink-0 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 sm:px-6 sm:pb-4">
        <div className="mx-auto w-full max-w-3xl">
          <ChatInput
            onSend={handleSend}
            onStop={stop}
            disabled={isLoading}
          />

          <p className="mt-3 text-center text-[11px] text-zinc-600">
            Nexus AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </main>
  );
}
