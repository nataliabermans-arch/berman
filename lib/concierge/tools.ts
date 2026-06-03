import type { Tool } from "@anthropic-ai/sdk/resources/messages";
import {
  deliverLead,
  hasFailedDelivery,
  hasSentEmail,
  hasSentWebhook,
  labelLeadReasons,
  missingRequiredDelivery,
  normalizeVisitType,
  summarizeLeadDelivery,
} from "@/lib/leads/delivery";
import { createLead } from "@/lib/supabase/leads";
import { markConversationLeadCaptured } from "@/lib/supabase/conversations";
import { SERVICES } from "@/lib/services/content";

export const TOOLS: Tool[] = [
  {
    name: "save_lead",
    description:
      "Save the visitor's contact info as a lead in the practice's CRM. Call this AFTER you have collected first name, last name, email, phone, and visit type preference.",
    input_schema: {
      type: "object",
      properties: {
        first_name: { type: "string", description: "First name" },
        last_name: { type: "string", description: "Last name" },
        email: { type: "string", description: "Email address" },
        phone: { type: "string", description: "Phone number, any format" },
        recommended_specialty: {
          type: "string",
          description:
            "Slug of the recommended specialty (one of: menopause-hormones, sexual-health, pelvic-urinary, vaginal-rejuvenation, aesthetic-regenerative, body-contouring) — or empty if unclear",
        },
        visit_type_preference: {
          type: "string",
          enum: ["in_person", "telehealth", "either"],
          description: "Visit type preference",
        },
        conversation_summary: {
          type: "string",
          description:
            "A 1-2 sentence summary of what the visitor came for, in your own words",
        },
      },
      required: [
        "first_name",
        "last_name",
        "email",
        "phone",
        "conversation_summary",
      ],
    },
  },
  {
    name: "recommend_specialty",
    description:
      "Look up the matching specialty page for a given symptom cluster. Call this BEFORE recommending the visitor see Dr. Berman, so you can speak about the right specialty by name.",
    input_schema: {
      type: "object",
      properties: {
        symptom_summary: {
          type: "string",
          description:
            "A short description of the visitor's symptom or concern",
        },
      },
      required: ["symptom_summary"],
    },
  },
];

export interface ToolContext {
  conversationId: string;
}

export interface SaveLeadInput {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  recommended_specialty?: string;
  visit_type_preference?: "in_person" | "telehealth" | "either";
  conversation_summary: string;
}

export interface RecommendSpecialtyInput {
  symptom_summary: string;
}

const SPECIALTY_KEYWORDS: Array<[string, string[]]> = [
  [
    "menopause-hormones",
    [
      "menopause",
      "perimenopause",
      "hormone",
      "hot flash",
      "night sweat",
      "brain fog",
      "mood",
      "sleep",
      "weight",
      "libido",
    ],
  ],
  [
    "sexual-health",
    [
      "sex",
      "libido",
      "arousal",
      "orgasm",
      "pain",
      "intercourse",
      "dyspareunia",
      "vaginismus",
      "vulvodynia",
    ],
  ],
  [
    "pelvic-urinary",
    [
      "incontinence",
      "leak",
      "prolapse",
      "urinary",
      "uti",
      "pelvic pain",
      "bladder",
      "urgency",
    ],
  ],
  [
    "vaginal-rejuvenation",
    ["dryness", "atrophy", "laxity", "monalisa", "prp", "postpartum", "tissue"],
  ],
  [
    "aesthetic-regenerative",
    ["botox", "filler", "skin", "wrinkle", "hair", "aesthetic", "cosmetic"],
  ],
  [
    "body-contouring",
    [
      "weight",
      "fat",
      "body",
      "emsculpt",
      "forma",
      "beautifill",
      "contour",
      "cellulite",
    ],
  ],
];

export async function handleTool(
  name: string,
  input: unknown,
  ctx: ToolContext,
): Promise<unknown> {
  if (name === "save_lead") {
    const data = input as SaveLeadInput;
    const recommendedSpecialty = data.recommended_specialty || undefined;
    const result = await createLead({
      conversationId: ctx.conversationId,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      recommendedSpecialty,
      visitTypePreference: data.visit_type_preference || "either",
      conversationSummary: data.conversation_summary,
    });
    const reasons = recommendedSpecialty ? [recommendedSpecialty] : [];
    const delivery = await deliverLead({
      ticketId: result.id,
      source: "ai_concierge",
      receivedAt: new Date().toISOString(),
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      preferredContact: "either",
      visitType: normalizeVisitType(data.visit_type_preference || "either"),
      preferredWindow: null,
      reasons,
      reasonLabels: labelLeadReasons(reasons),
      message: data.conversation_summary,
      consent: null,
      conversationId: ctx.conversationId,
      recommendedSpecialty: recommendedSpecialty || null,
      conversationSummary: data.conversation_summary,
    });
    const missingRequired = missingRequiredDelivery(delivery);
    if (hasFailedDelivery(delivery) || missingRequired.length > 0) {
      console.error("[concierge-lead-delivery-failed]", {
        missingRequired,
        delivery: summarizeLeadDelivery(delivery),
      });
      throw new Error("Lead notification failed.");
    }
    await markConversationLeadCaptured(ctx.conversationId);
    const notified = hasSentWebhook(delivery) || hasSentEmail(delivery);
    return {
      lead_id: result.id,
      ok: true,
      message: notified
        ? "Lead saved. Patient coordinator notified."
        : "Lead saved for coordinator review.",
    };
  }
  if (name === "recommend_specialty") {
    const data = input as RecommendSpecialtyInput;
    const summary = (data.symptom_summary ?? "").toLowerCase();
    let best = "menopause-hormones";
    let bestScore = -1;
    for (const [slug, keywords] of SPECIALTY_KEYWORDS) {
      const score = keywords.reduce(
        (s, kw) => s + (summary.includes(kw) ? 1 : 0),
        0,
      );
      if (score > bestScore) {
        bestScore = score;
        best = slug;
      }
    }
    const specialty = SERVICES.find((s) => s.slug === best);
    return {
      specialty_slug: best,
      specialty_name: specialty?.name ?? best,
      url: `/services/${best}`,
    };
  }
  return { error: "Unknown tool: " + name };
}
