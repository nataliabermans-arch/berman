import { getServerSupabase } from "./client";
import { getRecentMessages } from "./conversations";
import type { ChatMessage, Lead } from "@/lib/concierge/types";

export interface CreateLeadInput {
  conversationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  recommendedSpecialty?: string;
  visitTypePreference?: "in_person" | "telehealth" | "either";
  conversationSummary: string;
}

function rand6(): string {
  return Math.random().toString(36).slice(2, 8);
}

function genLeadId(): string {
  return `lead_${Date.now().toString(36)}_${rand6()}`;
}

interface LeadRow {
  id: string;
  conversation_id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  recommended_specialty: string | null;
  visit_type_preference: Lead["visitTypePreference"] | null;
  conversation_summary: string;
  status: Lead["status"];
}

function mapLeadRow(row: LeadRow): Lead {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    createdAt: row.created_at,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    recommendedSpecialty: row.recommended_specialty ?? undefined,
    visitTypePreference: row.visit_type_preference ?? undefined,
    conversationSummary: row.conversation_summary,
    status: row.status,
  };
}

export async function createLead(
  input: CreateLeadInput,
): Promise<{ id: string }> {
  const sb = getServerSupabase();
  const id = genLeadId();
  if (!sb) {
    console.warn("[supabase/leads] createLead: mock mode (no persistence).");
    return { id: `lead_mock_${Date.now()}` };
  }
  const { error } = await sb.from("leads").insert({
    id,
    conversation_id: input.conversationId,
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    phone: input.phone,
    recommended_specialty: input.recommendedSpecialty ?? null,
    visit_type_preference: input.visitTypePreference ?? null,
    conversation_summary: input.conversationSummary,
    status: "new",
  });
  if (error) throw error;
  return { id };
}

export async function listLeads(opts?: {
  limit?: number;
  status?: Lead["status"];
}): Promise<Lead[]> {
  const sb = getServerSupabase();
  if (!sb) return [];
  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 200);
  let query = sb
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (opts?.status) query = query.eq("status", opts.status);
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as LeadRow[]).map(mapLeadRow);
}

export async function getLeadById(
  id: string,
): Promise<{ lead: Lead; transcript: ChatMessage[] } | null> {
  const sb = getServerSupabase();
  if (!sb) return null;
  const { data: row, error } = await sb
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!row) return null;
  const lead = mapLeadRow(row as LeadRow);
  const transcript = await getRecentMessages(lead.conversationId, 200);
  return { lead, transcript };
}

export async function updateLeadStatus(
  id: string,
  status: Lead["status"],
): Promise<void> {
  const sb = getServerSupabase();
  if (!sb) return;
  const { error } = await sb.from("leads").update({ status }).eq("id", id);
  if (error) throw error;
}
