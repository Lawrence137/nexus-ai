
"use client";

import { ChevronDown, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { MODELS } from "@/lib/ai/model-registry";

type Props = {
  selectedModel: string;
  onSelect: (modelId: string) => void;
};

export default function ModelSelector({
  selectedModel,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);

  const selected = MODELS.find(
    (model) => model.id === selectedModel
  ) ?? MODELS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
      >
        <Sparkles size={15} className="text-violet-400" />
        <span>{selected.name}</span>
        <ChevronDown size={14} className="text-zinc-400" />
      </button>

      {open && (
        <>
          <button
            aria-label="Close model selector"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute left-0 top-12 z-20 w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#18181b] p-2 shadow-2xl">
            <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Select a model
            </p>

            {MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onSelect(model.id);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-white/5"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {model.name}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {model.description}
                  </p>
                </div>

                {selectedModel === model.id && (
                  <Check size={16} className="text-violet-400" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
