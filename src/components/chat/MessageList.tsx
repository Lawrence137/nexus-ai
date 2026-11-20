
"use client";

import { useEffect, useRef } from "react";
import { LoaderCircle } from "lucide-react";
import type { ChatMessage } from "@/types/chat";
import MessageBubble from "./MessageBubble";

type Props = {
  messages: ChatMessage[];
  isWaiting?: boolean;
};

export default function MessageList({
  messages,
  isWaiting = false,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });
  }, [messages, isWaiting]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isWaiting && (
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
            <LoaderCircle size={17} className="animate-spin" />
          </div>

          <p className="text-sm text-zinc-400">
            Nexus AI is thinking...
          </p>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
