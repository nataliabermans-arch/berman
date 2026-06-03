import { create } from "zustand";
import type { ChatMessage, ChatStreamChunk } from "@/lib/concierge/types";

const VISITOR_KEY = "berman_visitor_id";
const CONVERSATION_KEY = "berman_conversation_id";

const GREETING: ChatMessage = {
  id: "assistant-greeting",
  role: "assistant",
  content:
    "Hi — I'm the concierge for Dr. Berman's practice. What brought you here today? Tell me what you're experiencing or what you're trying to figure out — I'll point you in the right direction.",
};

function genId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(VISITOR_KEY);
  if (existing) return existing;
  const next = genId("visitor");
  window.localStorage.setItem(VISITOR_KEY, next);
  return next;
}

function getStoredConversationId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage.getItem(CONVERSATION_KEY) ?? undefined;
}

function storeConversationId(id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONVERSATION_KEY, id);
}

export interface ToolEvent {
  id: string;
  name: string;
  result: unknown;
}

export type ConciergeStatus =
  | "idle"
  | "sending"
  | "streaming"
  | "offline"
  | "error";

interface ConciergeState {
  isOpen: boolean;
  hasGreeted: boolean;
  status: ConciergeStatus;
  visitorId: string;
  conversationId?: string;
  messages: ChatMessage[];
  toolEvents: ToolEvent[];
  visitorFirstName?: string;
  errorMessage?: string;
  open: () => void;
  close: () => void;
  send: (message: string) => Promise<void>;
  reset: () => void;
}

function appendDelta(
  messages: ChatMessage[],
  id: string,
  delta: string,
): ChatMessage[] {
  return messages.map((m) =>
    m.id === id ? { ...m, content: m.content + delta } : m,
  );
}

export const useConciergeStore = create<ConciergeState>((set, get) => ({
  isOpen: false,
  hasGreeted: false,
  status: "idle",
  visitorId: "",
  conversationId: undefined,
  messages: [],
  toolEvents: [],
  visitorFirstName: undefined,
  errorMessage: undefined,

  open: () => {
    const visitorId = get().visitorId || getOrCreateVisitorId();
    const conversationId = get().conversationId ?? getStoredConversationId();
    set((state) => ({
      isOpen: true,
      visitorId,
      conversationId,
      messages: state.hasGreeted ? state.messages : [GREETING],
      hasGreeted: true,
    }));
  },

  close: () => set({ isOpen: false }),

  reset: () =>
    set({
      messages: [GREETING],
      toolEvents: [],
      conversationId: undefined,
      visitorFirstName: undefined,
      errorMessage: undefined,
      status: "idle",
    }),

  send: async (raw: string) => {
    const message = raw.trim();
    if (!message) return;
    const { status } = get();
    if (status === "sending" || status === "streaming") return;

    const visitorId = get().visitorId || getOrCreateVisitorId();
    const userMessage: ChatMessage = {
      id: genId("user"),
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };
    const assistantId = genId("assistant");
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      visitorId,
      status: "sending",
      errorMessage: undefined,
      messages: [...state.messages, userMessage, assistantPlaceholder],
    }));

    let res: Response;
    try {
      res = await fetch("/api/concierge/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: get().conversationId,
          visitorId,
          message,
        }),
      });
    } catch {
      set((state) => ({
        status: "error",
        errorMessage: "Network error — please try again.",
        messages: state.messages.filter((m) => m.id !== assistantId),
      }));
      return;
    }

    if (!res.ok) {
      if (res.status === 503) {
        set((state) => ({
          status: "offline",
          messages: state.messages.filter((m) => m.id !== assistantId),
        }));
        return;
      }
      set((state) => ({
        status: "error",
        errorMessage: "Concierge ran into a hiccup. Try again in a moment.",
        messages: state.messages.filter((m) => m.id !== assistantId),
      }));
      return;
    }

    if (!res.body) {
      set((state) => ({
        status: "error",
        errorMessage: "Empty response from concierge.",
        messages: state.messages.filter((m) => m.id !== assistantId),
      }));
      return;
    }

    set({ status: "streaming" });
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const raw = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          const line = raw.replace(/^data: /, "").trim();
          if (!line) continue;
          let chunk: ChatStreamChunk;
          try {
            chunk = JSON.parse(line) as ChatStreamChunk;
          } catch {
            continue;
          }

          if (chunk.conversationId && !get().conversationId) {
            storeConversationId(chunk.conversationId);
            set({ conversationId: chunk.conversationId });
          }

          if (chunk.type === "delta" && chunk.content) {
            set((state) => ({
              messages: appendDelta(
                state.messages,
                assistantId,
                chunk.content!,
              ),
            }));
          } else if (chunk.type === "tool_call" && chunk.tool) {
            const toolEvent: ToolEvent = {
              id: genId("tool"),
              name: chunk.tool.name,
              result: chunk.tool.result,
            };
            const result = chunk.tool.result as
              | { firstName?: string }
              | undefined;
            const firstName =
              result && typeof result === "object" && "firstName" in result
                ? (result.firstName as string | undefined)
                : undefined;
            set((state) => ({
              toolEvents: [...state.toolEvents, toolEvent],
              visitorFirstName: firstName ?? state.visitorFirstName,
            }));
          } else if (chunk.type === "error") {
            set({
              status: "error",
              errorMessage: chunk.error ?? "Concierge returned an error.",
            });
          }
        }
      }
      set({ status: "idle" });
    } catch {
      set({
        status: "error",
        errorMessage: "Stream interrupted — please try again.",
      });
    }
  },
}));
