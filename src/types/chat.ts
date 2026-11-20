
export type ProviderId = "openai" | "anthropic" | "google" | "groq";

export type ModelConfig = {
  id: string;
  name: string;
  provider: ProviderId;
  description: string;
  badge?: string;
  capabilities: {
    streaming: boolean;
    tools: boolean;
    vision: boolean;
    structuredOutput: boolean;
  };
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
};

export type Conversation = {
  id: string;
  title: string;
  updatedAt: Date;
  messages: ChatMessage[];
};
