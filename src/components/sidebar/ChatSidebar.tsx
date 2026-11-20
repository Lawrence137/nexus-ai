"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Settings,
  Sparkles,
  X,
  LogOut,
  LoaderCircle,
  UserRound,
} from "lucide-react";

import type { Conversation } from "@/types/chat";
import { createClient } from "@/lib/supabase/client";
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
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (mounted) {
        setEmail(user?.email ?? "");
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const filtered = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out failed:", error);
      setSigningOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  const userInitial = email
    ? email.charAt(0).toUpperCase()
    : "N";

  return (
    <aside className="flex h-full min-h-0 w-full flex-col overflow-hidden border-r border-white/10 bg-[#101012]">
      {/* Brand header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-violet-500">
            <Sparkles size={17} className="text-white" />
          </div>

          <span className="text-lg font-semibold tracking-tight">
            nexus<span className="text-violet-400">.</span>
          </span>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        )}
      </div>

      {/* New chat */}
      <div className="shrink-0 px-3 py-3">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-500 active:scale-[0.98]"
        >
          <Plus size={17} />
          New chat
        </button>
      </div>

      {/* Search */}
      <div className="shrink-0 px-3 py-2">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 focus-within:border-violet-500/50">
          <Search size={15} className="shrink-0 text-zinc-500" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations"
            aria-label="Search conversations"
            className="h-11 min-w-0 w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="shrink-0 text-zinc-500 hover:text-white"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Conversations */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
        <p className="mb-3 px-2 text-xs font-medium uppercase tracking-wider text-zinc-600">
          Your conversations
        </p>

        {filtered.length > 0 ? (
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
          <p className="px-2 py-4 text-center text-sm text-zinc-600">
            {search
              ? "No conversations found."
              : "Your conversations will appear here."}
          </p>
        )}
      </div>

      {/* Account section */}
      <div className="shrink-0 border-t border-white/10 p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl p-3 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
        >
          <Settings size={17} className="shrink-0" />
          Settings
        </button>

        <div className="mt-2 flex min-w-0 items-center gap-3 rounded-xl bg-white/[0.04] p-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-300">
            {userInitial}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {email || "Nexus User"}
            </p>

            <p className="text-xs text-zinc-500">
              Free plan
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            title="Sign out"
            aria-label="Sign out"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
          >
            {signingOut ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <LogOut size={17} />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
