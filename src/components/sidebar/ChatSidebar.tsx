
"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  PanelLeftClose,
  Settings,
  Sparkles,
  X,
} from "lucide-react";

import type { Conversation } from "@/types/chat";
import ConversationItem from "./ConversationItem";

type Props = {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onClose?: () => void;
};

export default function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onClose,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="flex h-full w-full flex-col border-r border-white/10 bg-[#101012]">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-violet-500">
            <Sparkles size={17} className="text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            nexus<span className="text-violet-400">.</span>
          </span>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-2 text-zinc-500 hover:bg-white/10 lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      <div className="px-3 py-3">
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-500"
        >
          <Plus size={17} />
          New chat
        </button>
      </div>

      <div className="px-3 py-2">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3">
          <Search size={15} className="text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations"
            className="h-10 w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-3 px-2 text-xs font-medium uppercase tracking-wider text-zinc-600">
          Your conversations
        </p>

        {filtered.length ? (
          <div className="space-y-1">
            {filtered.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                active={activeId === conversation.id}
                onClick={() => {
                  onSelect(conversation.id);
                  onClose?.();
                }}
              />
            ))}
          </div>
        ) : (
          <p className="px-2 py-4 text-sm text-zinc-600">
            No conversations found.
          </p>
        )}
      </div>

      <div className="border-t border-white/10 p-3">
        <button className="flex w-full items-center gap-3 rounded-xl p-3 text-sm text-zinc-400 hover:bg-white/5 hover:text-white">
          <Settings size={17} />
          Settings
        </button>

        <div className="mt-2 flex items-center gap-3 rounded-xl bg-white/[0.04] p-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-300">
            N
          </div>
          <div>
            <p className="text-sm font-medium text-white">Nexus User</p>
            <p className="text-xs text-zinc-500">Free plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
