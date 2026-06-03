import type { NextRequest } from "next/server";
import type {
  ContentBlockParam,
  MessageParam,
  ToolUseBlockParam,
} from "@anthropic-ai/sdk/resources/messages";
import { CONCIERGE_SYSTEM_PROMPT } from "@/lib/concierge/system-prompt";
import {
  getAnthropicClient,
  isAnthropicConfigured,
  startStream,
} from "@/lib/concierge/anthropic";
import { TOOLS, handleTool } from "@/lib/concierge/tools";
import {
  appendMessage,
  createConversation,
  getRecentMessages,
} from "@/lib/supabase/conversations";
import type {
  ChatMessage,
  ChatRequest,
  ChatStreamChunk,
} from "@/lib/concierge/types";

export const runtime = "nodejs";

const OFFLINE_MESSAGE =
  "Concierge offline — please leave your contact info via the booking form.";

function toAnthropicMessages(history: ChatMessage[]): MessageParam[] {
  return history
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
}

interface PendingToolUse {
  id: string;
  name: string;
  jsonChunks: string[];
}

export async function POST(req: NextRequest) {
  if (!isAnthropicConfigured()) {
    return new Response(JSON.stringify({ error: OFFLINE_MESSAGE }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body || typeof body.message !== "string" || !body.message.trim()) {
    return new Response(JSON.stringify({ error: "Missing message." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!body.visitorId || typeof body.visitorId !== "string") {
    return new Response(JSON.stringify({ error: "Missing visitorId." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const client = getAnthropicClient();
  if (!client) {
    return new Response(JSON.stringify({ error: OFFLINE_MESSAGE }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  let conversationId = body.conversationId?.trim() || "";
  if (!conversationId) {
    const created = await createConversation(body.visitorId);
    conversationId = created.id;
  }

  await appendMessage(conversationId, "user", body.message);

  const history = await getRecentMessages(conversationId, 30);
  const baseMessages: MessageParam[] =
    history.length > 0
      ? toAnthropicMessages(history)
      : [{ role: "user", content: body.message }];

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (chunk: ChatStreamChunk) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`),
        );
      };

      let assistantText = "";

      try {
        send({ type: "delta", content: "", conversationId });

        const messages: MessageParam[] = [...baseMessages];
        let safetyHops = 0;

        while (safetyHops < 6) {
          safetyHops += 1;

          const turnText: string[] = [];
          const blocksByIndex = new Map<number, PendingToolUse>();
          const orderedBlocks: ContentBlockParam[] = [];

          const turn = startStream({
            client,
            system: CONCIERGE_SYSTEM_PROMPT,
            messages,
            tools: TOOLS,
          });

          for await (const event of turn) {
            if (event.type === "content_block_start") {
              const block = event.content_block;
              if (block.type === "tool_use") {
                blocksByIndex.set(event.index, {
                  id: block.id,
                  name: block.name,
                  jsonChunks: [],
                });
              }
            } else if (event.type === "content_block_delta") {
              if (event.delta.type === "text_delta") {
                const text = event.delta.text;
                turnText.push(text);
                send({ type: "delta", content: text });
              } else if (event.delta.type === "input_json_delta") {
                const pending = blocksByIndex.get(event.index);
                if (pending) pending.jsonChunks.push(event.delta.partial_json);
              }
            }
          }

          const final = await turn.finalMessage();
          for (const block of final.content) {
            if (block.type === "text") {
              orderedBlocks.push({ type: "text", text: block.text });
            } else if (block.type === "tool_use") {
              orderedBlocks.push({
                type: "tool_use",
                id: block.id,
                name: block.name,
                input: block.input,
              } satisfies ToolUseBlockParam);
            }
          }

          assistantText += turnText.join("");

          if (final.stop_reason !== "tool_use") {
            break;
          }

          const toolUseBlocks = orderedBlocks.filter(
            (b): b is ToolUseBlockParam => b.type === "tool_use",
          );
          if (toolUseBlocks.length === 0) break;

          messages.push({ role: "assistant", content: orderedBlocks });

          const toolResults: ContentBlockParam[] = [];
          for (const tu of toolUseBlocks) {
            let result: unknown;
            try {
              result = await handleTool(tu.name, tu.input, { conversationId });
            } catch (err) {
              result = {
                error: err instanceof Error ? err.message : "Tool failed.",
              };
            }
            send({ type: "tool_call", tool: { name: tu.name, result } });
            toolResults.push({
              type: "tool_result",
              tool_use_id: tu.id,
              content: JSON.stringify(result),
            });
          }

          messages.push({ role: "user", content: toolResults });
        }

        if (assistantText.trim().length > 0) {
          try {
            await appendMessage(conversationId, "assistant", assistantText);
          } catch (err) {
            console.error(
              "[concierge] failed to persist assistant message",
              err,
            );
          }
        }

        send({ type: "done" });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Concierge error.";
        console.error("[concierge] stream error", err);
        send({ type: "error", error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
