"use client";

import { useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { Menu } from "lucide-react";

import type { ChatMessage } from "@/types/chat";
import ModelSelector from "./ModelSelector";
import WelcomeScreen from "./WelcomeScreen";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

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

  const startedRef = useRef(initialMessages.length > 0);

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
    onFinish: ({ messages }) => {
      onMessagesChange(chatId, toChatMessages(messages));
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  const isLoading =
    status === "submitted" || status === "streaming";

  async function handleSend(message: string) {
    if (status !== "ready") return;

    if (!startedRef.current) {
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
  }

  async function handleRegenerate() {
    if (status !== "ready") return;

    await regenerate({
      body: {
        modelId: selectedModel,
      },
    });
  }

  const displayMessages = toChatMessages(messages);

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-[#141416]">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div>
            <p className="text-sm font-medium text-white">
              {title || "New conversation"}
            </p>
            <p className="text-xs text-zinc-500">
              AI workspace
            </p>
          </div>
        </div>

        <ModelSelector
          selectedModel={selectedModel}
          onSelect={onModelChange}
        />
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {displayMessages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
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

        {error && (
          <p className="mx-auto mb-3 w-full max-w-3xl px-4 text-sm text-red-400">
            Something went wrong. Please try again.
          </p>
        )}
      </div>

      <div className="shrink-0 px-4 pb-4 pt-2 sm:px-6">
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
