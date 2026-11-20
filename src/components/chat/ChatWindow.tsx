
"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import type { ChatMessage } from "@/types/chat";
import ModelSelector from "./ModelSelector";
import WelcomeScreen from "./WelcomeScreen";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

type Props = {
  title?: string;
  initialMessages: ChatMessage[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  onMenuClick: () => void;
  onSend: (message: string) => void;
};

export default function ChatWindow({
  title,
  initialMessages,
  selectedModel,
  onModelChange,
  onMenuClick,
  onSend,
}: Props) {
  const [messages, setMessages] = useState(initialMessages);

  function handleSend(message: string) {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      createdAt: new Date(),
    };

    setMessages((previous) => [...previous, newMessage]);
    onSend(message);
  }

  function handlePrompt(prompt: string) {
    handleSend(prompt);
  }

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
        {messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <WelcomeScreen onPrompt={handlePrompt} />
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
      </div>

      <div className="shrink-0 px-4 pb-4 pt-2 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <ChatInput onSend={handleSend} />

          <p className="mt-3 text-center text-[11px] text-zinc-600">
            Nexus AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </main>
  );
}
