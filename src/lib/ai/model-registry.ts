import type { ModelConfig } from "@/types/chat";

export const MODELS: ModelConfig[] = [
  {
    id: "google:gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    provider: "google",
    description: "Fast general-purpose AI assistant",
    badge: "Google",
    capabilities: {
      streaming: true,
      tools: true,
      vision: true,
      structuredOutput: true,
    },
  },
  {
    id: "groq:openai/gpt-oss-20b",
    name: "GPT OSS 20B",
    provider: "groq",
    description: "Fast open-weight reasoning model",
    badge: "Groq",
    capabilities: {
      streaming: true,
      tools: true,
      vision: false,
      structuredOutput: false,
    },
  },
];

export const DEFAULT_MODEL = MODELS[0];
