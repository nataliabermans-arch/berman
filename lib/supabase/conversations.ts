import { getServerSupabase } from "./client";
import type { ChatMessage, Conversation, Role } from "@/lib/concierge/types";

function rand6(): string {
  return Math.random().toString(36).slice(2, 8);
}

function genConversationId(): string {
  return `conv_${Date.now().toString(36)}_${rand6()}`;
}

interface ConversationRow {
  id: string;
  visitor_id: string;
  created_at: string;
  updated_at: string;
  status: Conversation["status"];
}

interface MessageRow {
  id: number;
  conversation_id: string;
  role: Role;
  content: string;
  created_at: string;
}

function mapMessageRow(row: MessageRow): ChatMessage {
  return {
    id: String(row.id),
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
  };
}

function mapConversationRow(
  row: ConversationRow,
  messages: ChatMessage[],
): Conversation {
  return {
    id: row.id,
    visitorId: row.visitor_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    messages,
  };
}

export async function createConversation(
  visitorId: string,
): Promise<{ id: string }> {
  const sb = getServerSupabase();
  const id = genConversationId();
  if (!sb) {
    console.warn(
      "[supabase/conversations] createConversation: mock mode (no persistence).",
    );
    return { id: `conv_mock_${Date.now()}` };
  }
  const { error } = await sb.from("conversations").insert({
    id,
    visitor_id: visitorId,
    status: "open",
  });
  if (error) throw error;
  return { id };
}

export async function appendMessage(
  conversationId: string,
  role: Role,
  content: string,
): Promise<void> {
  const sb = getServerSupabase();
  if (!sb) return;
  const { error: insertErr } = await sb.from("messages").insert({
    conversation_id: conversationId,
    role,
    content,
  });
  if (insertErr) throw insertErr;
  const { error: updateErr } = await sb
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);
  if (updateErr) throw updateErr;
}

export async function getConversation(
  conversationId: string,
): Promise<Conversation | null> {
  const sb = getServerSupabase();
  if (!sb) return null;
  const { data: convRow, error: convErr } = await sb
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle();
  if (convErr) throw convErr;
  if (!convRow) return null;
  const { data: msgRows, error: msgErr } = await sb
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (msgErr) throw msgErr;
  const messages = ((msgRows ?? []) as MessageRow[]).map(mapMessageRow);
  return mapConversationRow(convRow as ConversationRow, messages);
}

export async function getRecentMessages(
  conversationId: string,
  limit = 30,
): Promise<ChatMessage[]> {
  const sb = getServerSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  const rows = ((data ?? []) as MessageRow[]).slice().reverse();
  return rows.map(mapMessageRow);
}

export async function markConversationLeadCaptured(
  conversationId: string,
): Promise<void> {
  const sb = getServerSupabase();
  if (!sb) return;
  const { error } = await sb
    .from("conversations")
    .update({ status: "lead_captured", updated_at: new Date().toISOString() })
    .eq("id", conversationId);
  if (error) throw error;
}
