import { createClient } from "@/lib/supabase/client";
import type { Conversation, ChatMessage } from "@/types/chat";

type ConversationRow = {
  id: string;
  title: string;
  model_id: string | null;
  created_at: string;
  updated_at: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

function mapConversation(row: ConversationRow): Conversation {
  return {
    id: row.id,
    title: row.title,
    updatedAt: new Date(row.updated_at),
    messages: [],
  };
}

function mapMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    createdAt: new Date(row.created_at),
  };
}

export async function getConversations(): Promise<Conversation[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, model_id, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load conversations: ${error.message}`);
  }

  return (data ?? []).map((row) =>
    mapConversation(row as ConversationRow)
  );
}

export async function getMessages(
  conversationId: string
): Promise<ChatMessage[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("messages")
    .select("id, conversation_id, role, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load messages: ${error.message}`);
  }

  return (data ?? []).map((row) =>
    mapMessage(row as MessageRow)
  );
}

export async function createConversation(
  title: string,
  modelId: string,
  id?: string
): Promise<Conversation> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      ...(id ? { id } : {}),
      title: title.trim().slice(0, 100) || "New conversation",
      model_id: modelId,
    })
    .select("id, title, model_id, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(`Failed to create conversation: ${error.message}`);
  }

  return mapConversation(data as ConversationRow);
}

export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
): Promise<ChatMessage> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role,
      content,
    })
    .select("id, conversation_id, role, content, created_at")
    .single();

  if (error) {
    throw new Error(`Failed to save message: ${error.message}`);
  }

  await updateConversationTimestamp(supabase, conversationId);

  return mapMessage(data as MessageRow);
}

/**
 * Saves a completed assistant response.
 * If the latest database message is already an assistant response,
 * update it instead of creating a duplicate.
 *
 * This supports Regenerate and Retry.
 */
export async function saveAssistantResponse(
  conversationId: string,
  content: string
): Promise<ChatMessage> {
  const supabase = createClient();

  const { data: latestMessage, error: latestError } = await supabase
    .from("messages")
    .select("id, role")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) {
    throw new Error(
      `Failed to check previous message: ${latestError.message}`
    );
  }

  if (latestMessage?.role === "assistant") {
    const { data, error } = await supabase
      .from("messages")
      .update({ content })
      .eq("id", latestMessage.id)
      .select("id, conversation_id, role, content, created_at")
      .single();

    if (error) {
      throw new Error(
        `Failed to update assistant response: ${error.message}`
      );
    }

    await updateConversationTimestamp(supabase, conversationId);

    return mapMessage(data as MessageRow);
  }

  return saveMessage(conversationId, "assistant", content);
}

async function updateConversationTimestamp(
  supabase: ReturnType<typeof createClient>,
  conversationId: string
) {
  const { error } = await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  if (error) {
    console.error(
      "Message saved, but conversation timestamp update failed:",
      error.message
    );
  }
}

export async function deleteConversation(
  conversationId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId);

  if (error) {
    throw new Error(`Failed to delete conversation: ${error.message}`);
  }
}

/**
 * Creates or updates a message using a stable UUID.
 * This allows the complete chat history to be saved repeatedly
 * without creating duplicate database records.
 */
export async function upsertMessage(
  conversationId: string,
  message: ChatMessage
): Promise<void> {
  const supabase = createClient();

  // Supabase message IDs must be UUIDs.
  // Preserve existing database UUIDs and deterministically
  // convert any non-UUID AI SDK message IDs.
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      message.id
    );

  let messageId = message.id;

  if (!isUuid) {
    const hash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(message.id)
    );

    const bytes = Array.from(new Uint8Array(hash).slice(0, 16));

    bytes[6] = (bytes[6] & 0x0f) | 0x50;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    messageId = bytes
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")
      .replace(
        /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
        "$1-$2-$3-$4-$5"
      );
  }

  const { error } = await supabase
    .from("messages")
    .upsert(
      {
        id: messageId,
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
      },
      { onConflict: "id" }
    );

  if (error) {
    throw new Error(`Failed to save message: ${error.message}`);
  }
}