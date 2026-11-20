"use client";

import { MessageSquare, Trash2, LoaderCircle } from "lucide-react";
import type { Conversation } from "@/types/chat";

type Props = {
  conversation: Conversation;
  active: boolean;
  deleting: boolean;
  onClick: () => void;
  onDelete: () => void;
};

export default function ConversationItem({
  conversation,
  active,
  deleting,
  onClick,
  onDelete,
}: Props) {
  return (
    <div
      className={`group flex w-full items-center gap-1 rounded-xl transition ${
        active
          ? "bg-white/10 text-white"
          : "text-zinc-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={deleting}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm disabled:opacity-50"
      >
        <MessageSquare size={16} className="shrink-0" />

        <span className="truncate">{conversation.title}</span>
      </button>

      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        title="Delete conversation"
        aria-label={`Delete ${conversation.title}`}
        className="mr-2 flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 focus:opacity-100 group-hover:opacity-100 disabled:opacity-50"
      >
        {deleting ? (
          <LoaderCircle size={15} className="animate-spin" />
        ) : (
          <Trash2 size={15} />
        )}
      </button>
    </div>
  );
}