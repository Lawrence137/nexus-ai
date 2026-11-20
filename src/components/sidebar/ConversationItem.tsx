
import { MessageSquare } from "lucide-react";
import type { Conversation } from "@/types/chat";

type Props = {
  conversation: Conversation;
  active: boolean;
  onClick: () => void;
};

export default function ConversationItem({
  conversation,
  active,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
        active
          ? "bg-white/10 text-white"
          : "text-zinc-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <MessageSquare size={16} className="shrink-0" />

      <span className="truncate">
        {conversation.title}
      </span>
    </button>
  );
}
