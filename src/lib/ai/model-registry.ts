
import type { ModelConfig } from "@/types/chat";

export const MODELS: ModelConfig[] = [
  {
    id: "openai:gpt-model",
    name: "GPT",
    provider: "openai",
    description: "General-purpose AI assistant",
    badge: "Popular",
    capabilities: {
      streaming: true,
      tools: true,
      vision: true,
      structuredOutput: true,
    },
  },
  {
    id: "anthropic:claude-model",
    name: "Claude",
    provider: "anthropic",
    description: "Reasoning and writing assistant",
    capabilities: {
      streaming: true,
      tools: true,
      vision: true,
      structuredOutput: true,
    },
  },
  {
    id: "google:gemini-model",
    name: "Gemini",
    provider: "google",
    description: "Multimodal AI assistant",
    capabilities: {
      streaming: true,
      tools: true,
      vision: true,
      structuredOutput: true,
    },
  },
];

export const DEFAULT_MODEL = MODELS[0];
