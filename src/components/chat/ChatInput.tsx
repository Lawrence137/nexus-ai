"use client";

import { useRef, useState } from "react";
import {
  ArrowUp,
  Paperclip,
  X,
  Square,
} from "lucide-react";

type Props = {
  onSend: (message: string) => void;
  onStop: () => void;
  disabled?: boolean;
};

export default function ChatInput({
  onSend,
  onStop,
  disabled = false,
}: Props) {
  const [value, setValue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    const message = value.trim();

    if (!message || disabled) return;

    onSend(message);
    setValue("");
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1b1b1f] p-3 shadow-xl focus-within:border-violet-500/50">
      {file && (
        <div className="mb-2 flex items-center gap-2 text-xs text-zinc-400">
          <Paperclip size={14} />
          <span className="max-w-48 truncate">{file.name}</span>

          <button
            type="button"
            onClick={() => {
              setFile(null);
              if (fileRef.current) fileRef.current.value = "";
            }}
            aria-label="Remove attachment"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="Message Nexus AI..."
        disabled={disabled}
        rows={2}
        className="max-h-40 min-h-14 w-full resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
      />

      <div className="flex items-center justify-between">
        <div>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) =>
              setFile(e.target.files?.[0] ?? null)
            }
          />

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={disabled}
            className="rounded-lg p-2 text-zinc-500 hover:bg-white/10 hover:text-white disabled:opacity-40"
            aria-label="Attach file"
          >
            <Paperclip size={18} />
          </button>
        </div>

        {disabled ? (
          <button
            type="button"
            onClick={onStop}
            className="flex size-9 items-center justify-center rounded-xl bg-red-500 text-white transition hover:bg-red-400"
            aria-label="Stop generating"
            title="Stop generating"
          >
            <Square size={15} fill="currentColor" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="flex size-9 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Send message"
          >
            <ArrowUp size={19} />
          </button>
        )}
      </div>
    </div>
  );
}
