
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";

export const maxDuration = 30;

const MODEL_MAP = {
  "google:gemini-3.8-flash": () =>
    google("gemini-3.8-flash"),

  "groq:openai/gpt-oss-20b": () =>
    groq("openai/gpt-oss-20b"),
} as const;

type ModelId = keyof typeof MODEL_MAP;

export async function POST(req: Request) {
  try {
    const {
      messages,
      modelId = "google:gemini-3.8-flash",
    }: {
      messages: UIMessage[];
      modelId?: string;
    } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "A non-empty messages array is required." },
        { status: 400 }
      );
    }

    if (!(modelId in MODEL_MAP)) {
      return Response.json(
        { error: "Unsupported model selected." },
        { status: 400 }
      );
    }

    const selectedModel = MODEL_MAP[modelId as ModelId]();

    const result = streamText({
      model: selectedModel,

      system:
        "You are Nexus AI, a helpful, accurate, and thoughtful AI assistant. Explain technical topics clearly and provide practical examples when useful.",

      messages: await convertToModelMessages(messages),

      maxRetries: 0,
      maxOutputTokens: 512,
      temperature: 0.7,

      onError({ error }) {
        console.error(`${modelId} streaming error:`, error);
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);

    return Response.json(
      { error: "Unable to generate a response. Please try again." },
      { status: 500 }
    );
  }
}
