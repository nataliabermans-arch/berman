import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam, Tool } from "@anthropic-ai/sdk/resources/messages";

let cached: Anthropic | null = null;

export function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  if (cached) return cached;
  cached = new Anthropic({ apiKey });
  return cached;
}

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getModel(): string {
  return process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
}

export interface StreamRunArgs {
  client: Anthropic;
  system: string;
  messages: MessageParam[];
  tools: Tool[];
  maxTokens?: number;
}

export function startStream({
  client,
  system,
  messages,
  tools,
  maxTokens = 1024,
}: StreamRunArgs) {
  return client.messages.stream({
    model: getModel(),
    max_tokens: maxTokens,
    system,
    messages,
    tools,
  });
}
