
import { Bot, User } from "lucide-react";
import type { ChatMessage } from "@/types/chat";

type Props = {
  message: ChatMessage;
};

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
          <Bot size={17} />
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[75%] ${
          isUser
            ? "bg-violet-600 text-white"
            : "border border-white/10 bg-white/[0.04] text-zinc-200"
        }`}
      >
        {message.content}
      </div>

      {isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-zinc-300">
          <User size={17} />
        </div>
      )}
    </div>
  );
}
