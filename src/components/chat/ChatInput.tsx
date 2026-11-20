
"use client";

import { useRef, useState } from "react";
import {
  ArrowUp,
  Paperclip,
  X,
} from "lucide-react";

type Props = {
  onSend: (message: string) => void;
  disabled?: boolean;
};

export default function ChatInput({
  onSend,
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
            onClick={() => setFile(null)}
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
            onClick={() => fileRef.current?.click()}
            className="rounded-lg p-2 text-zinc-500 hover:bg-white/10 hover:text-white"
            aria-label="Attach file"
          >
            <Paperclip size={18} />
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!value.trim() || disabled}
          className="flex size-9 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Send message"
        >
          <ArrowUp size={19} />
        </button>
      </div>
    </div>
  );
}
