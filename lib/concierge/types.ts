/**
 * Concierge AI types — single source of truth for the chat assistant.
 * Imported by API route, chat UI, admin leads page, Supabase wrapper.
 */

export type Role = "user" | "assistant" | "system";

export interface ChatMessage {
  id?: string;
  role: Role;
  content: string;
  createdAt?: string;
}

export interface Conversation {
  id: string; // conv_<timestamp>_<random>
  visitorId: string; // anonymous id from localStorage
  createdAt: string;
  updatedAt: string;
  status: "open" | "lead_captured" | "abandoned";
  messages: ChatMessage[];
}

/** Persisted lead — what the assistant collects and saves. */
export interface Lead {
  id: string; // lead_<timestamp>_<random>
  conversationId: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  recommendedSpecialty?: string;
  visitTypePreference?: "in_person" | "telehealth" | "either";
  conversationSummary: string; // a short summary the assistant writes
  status: "new" | "contacted" | "booked" | "closed";
}

/** Streaming chunk format from /api/concierge/chat (Server-Sent Events). */
export interface ChatStreamChunk {
  type: "delta" | "tool_call" | "done" | "error";
  content?: string; // for delta
  tool?: { name: string; result: unknown }; // for tool_call
  conversationId?: string; // sent on first chunk so client knows
  error?: string;
}

/** Request body for POST /api/concierge/chat */
export interface ChatRequest {
  conversationId?: string; // null on first message
  visitorId: string;
  message: string;
}
