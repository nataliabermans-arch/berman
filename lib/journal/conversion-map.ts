/**
 * Topic → conversion mapping for the article template.
 * Drives the in-line product card, sticky right-rail CTA, and bottom mobile bar.
 */

import type { JournalCategory } from "./types";

export interface ConversionTarget {
  /** Service slug under /services/[slug] for the consult CTA. */
  serviceSlug: string;
  /** Service display name. */
  serviceName: string;
  /** Supplement slug under /services/supplements/[slug] for the in-line product card. */
  supplementSlug: string;
  /** Coupon code to display in the in-line product card. Real coupon enforcement deferred to Stripe. */
  couponCode: string;
  /** Discount label, e.g. "saves $15". */
  couponLabel: string;
  /** Short prompt for the sticky bottom mobile CTA. */
  bottomPrompt: string;
}

const FALLBACK: ConversionTarget = {
  serviceSlug: "menopause-hormones",
  serviceName: "Menopause & Hormone Therapy",
  supplementSlug: "hormone-balance-essentials",
  couponCode: "BRIEF15",
  couponLabel: "saves $15",
  bottomPrompt: "Talk to Dr. Berman →",
};

const MAP: Record<JournalCategory, ConversionTarget> = {
  All: FALLBACK,
  "Menopause & Hormones": {
    serviceSlug: "menopause-hormones",
    serviceName: "Menopause & Hormone Therapy",
    supplementSlug: "dim-plus",
    couponCode: "BRIEF15",
    couponLabel: "saves $15",
    bottomPrompt: "Hormones bothering you? Book a consult →",
  },
  "Sexual Health": {
    serviceSlug: "sexual-health",
    serviceName: "Sexual Health & Intimacy",
    supplementSlug: "libido-enhance",
    couponCode: "BRIEF15",
    couponLabel: "saves $15",
    bottomPrompt: "Talk to Dr. Berman about this →",
  },
  "Pelvic & Urinary": {
    serviceSlug: "pelvic-urinary",
    serviceName: "Pelvic Floor & Urinary Health",
    supplementSlug: "probiotic-plus",
    couponCode: "BRIEF15",
    couponLabel: "saves $15",
    bottomPrompt: "Pelvic concerns? Book a consult →",
  },
  "Vaginal Rejuvenation": {
    serviceSlug: "vaginal-rejuvenation",
    serviceName: "Vaginal Rejuvenation",
    supplementSlug: "hormone-balance-essentials",
    couponCode: "BRIEF15",
    couponLabel: "saves $15",
    bottomPrompt: "Ready for a real plan? Book a consult →",
  },
  "Aesthetic & Regenerative": {
    serviceSlug: "aesthetic-regenerative",
    serviceName: "Aesthetic & Regenerative Medicine",
    supplementSlug: "re-grow",
    couponCode: "BRIEF15",
    couponLabel: "saves $15",
    bottomPrompt: "Talk to Dr. Berman about your skin →",
  },
  "Body Contouring": {
    serviceSlug: "body-contouring",
    serviceName: "Body Contouring & Weight Loss",
    supplementSlug: "berberine-plus",
    couponCode: "BRIEF15",
    couponLabel: "saves $15",
    bottomPrompt: "Ready to talk about your body? →",
  },
  Press: FALLBACK,
  Books: FALLBACK,
  Uncategorized: FALLBACK,
};

export function getConversionTargetForCategory(
  category: string,
): ConversionTarget {
  return (MAP as Record<string, ConversionTarget>)[category] ?? FALLBACK;
}
