"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  GrainGradient,
  MeshGradient,
  NeuroNoise,
} from "@paper-design/shaders-react";

import AddToCartButton from "@/components/commerce/AddToCartButton";
import {
  SUPPLEMENTS,
  SUPPLEMENT_BUNDLE,
  type Supplement,
} from "@/lib/services/supplements";
import PageTail from "../../_page-tail";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number];
const VIEWPORT = { once: true, margin: "-80px" } as const;

const ALL: Supplement[] = [SUPPLEMENT_BUNDLE, ...SUPPLEMENTS];

const WINE_GLASS_BG =
  "linear-gradient(135deg, rgba(74,28,38,0.92) 0%, rgba(58,20,29,0.92) 100%)";

const floatingSupplementImage = (src: string) =>
  src.replace("/images/supplements/", "/images/supplements/floating/");

const priceToNumber = (price: string) => Number(price.replace(/[^0-9.]/g, ""));

interface ProductDetail {
  italicHeadlineText: string;
  italicHeadlineWord: string;
  paragraphs: string[];
  why: {
    headlineText: string;
    italicWord: string;
    paragraphs: string[];
  };
  facts: { label: string; value: string }[];
  ingredients: string[];
}

const DETAILS: Record<string, ProductDetail> = {
  "hormone-balance-essentials": {
    italicHeadlineText: "The starter stack.",
    italicHeadlineWord: "starter stack.",
    paragraphs: [
      "Three bottles, formulated to be taken together. DIM + supports cleaner estrogen metabolism along the 2-hydroxy pathway, Vitamin D Plus K covers the two micronutrients almost every patient tests low for, and Probiotic Plus rebuilds the microbiome that handles a meaningful share of estrogen recirculation.",
      "This is the bundle I hand to women in perimenopause who ask, in the last five minutes of a visit, what they should actually be taking. It is not exotic. It is the foundation. Most patients will feel something inside thirty days — usually steadier mood, fewer cycle-related symptoms, and a better-functioning gut.",
      "Take all three with breakfast. One month per bundle. Pair with a hormone panel and a real conversation, not in place of one.",
    ],
    why: {
      headlineText: "The shelf I wished existed.",
      italicWord: "shelf",
      paragraphs: [
        "For years I sent patients home with a list of three brands across three websites and a prayer that they would actually order all three. Most ordered one. The bundle exists so the foundation gets taken — not just intended.",
        "Bundle pricing is set so the three together cost less than the singles. Same bottles, same formulations.",
      ],
    },
    facts: [
      { label: "Includes", value: "DIM + · Vitamin D Plus K · Probiotic Plus" },
      { label: "Supply", value: "30 days" },
      { label: "Sourcing", value: "US-manufactured, GMP-certified" },
      { label: "Take with", value: "Food, once daily" },
    ],
    ingredients: [
      "DIM + — 200mg DIM, 100mg Calcium-D-Glucarate, BioPerine",
      "Vitamin D Plus K — 5,000 IU D3 (cholecalciferol), 90mcg K2 (MK-7)",
      "Probiotic Plus — 50 billion CFU, 12-strain blend",
    ],
  },
  "dim-plus": {
    italicHeadlineText: "What it does.",
    italicHeadlineWord: "does.",
    paragraphs: [
      "DIM (3,3'-diindolylmethane) is the metabolite the body produces from cruciferous vegetables — the one that nudges estrogen down the cleaner 2-hydroxy pathway. We dose it at 200mg, paired with calcium-D-glucarate to support phase-II detoxification in the liver.",
      "The patients who notice it most: women in perimenopause with cycle-related breast tenderness, mood swings, or stubborn estrogen-dominant symptoms. Two capsules with breakfast.",
      "DIM is not a substitute for hormone replacement, and it will not fix every symptom. It does one job, and it does it well — which is why it is the bottle most often refilled on this shelf.",
    ],
    why: {
      headlineText: "The bottle I couldn't find on a shelf.",
      italicWord: "couldn't find",
      paragraphs: [
        "Most retail DIM bottles use 50–100mg with no glucarate, which is the dose chosen because it is cheap, not because it works. The studied range is 150–300mg paired with phase-II support.",
        "We formulate at the working dose. The bottle costs more. It is also the only one I will hand to a patient.",
      ],
    },
    facts: [
      { label: "Form", value: "Capsule" },
      { label: "Dose", value: "2 capsules daily, with breakfast" },
      { label: "Quantity", value: "60 capsules · 30-day supply" },
      { label: "Sourcing", value: "US-manufactured, GMP-certified" },
    ],
    ingredients: [
      "DIM (3,3'-diindolylmethane) — 200mg",
      "Calcium-D-Glucarate — 100mg",
      "BioPerine (black pepper extract) — 5mg",
    ],
  },
  "libido-enhance": {
    italicHeadlineText: "What it does.",
    italicHeadlineWord: "does.",
    paragraphs: [
      "Three botanicals with the most consistent literature in female sexual function: maca root, tribulus terrestris, and fenugreek. Dosed at the levels used in the trials — not the sprinkles used to put the names on the label.",
      "The mechanism is not testosterone replacement. Maca appears to act on the hypothalamic axis, tribulus on androgen receptor sensitivity, fenugreek on free testosterone availability. Together, the patients who respond tend to notice it inside four to six weeks.",
      "It is not a substitute for evaluating low desire properly — which usually means hormones, sleep, relationship dynamics, and medications all on the table. It is a real adjunct for the women who want to try a botanical first.",
    ],
    why: {
      headlineText: "An adjunct, not a fix.",
      italicWord: "adjunct,",
      paragraphs: [
        "Most libido bottles on the market are stimulants in disguise — caffeine, yohimbe, theobromine — sold as desire-enhancers. We do not use any of them.",
        "This is a botanical-only formulation, dosed for women, paired with the recommendation that you also have the conversation about hormones if it comes back to that.",
      ],
    },
    facts: [
      { label: "Form", value: "Capsule" },
      { label: "Dose", value: "2 capsules daily" },
      { label: "Quantity", value: "60 capsules · 30-day supply" },
      { label: "Sourcing", value: "US-manufactured, GMP-certified" },
    ],
    ingredients: [
      "Maca root extract (Lepidium meyenii) — 1,500mg",
      "Tribulus terrestris extract — 750mg",
      "Fenugreek seed extract — 600mg",
    ],
  },
  "vitamin-d-plus-k": {
    italicHeadlineText: "Why both vitamins.",
    italicHeadlineWord: "both vitamins.",
    paragraphs: [
      "Vitamin D3 without K2 is the most common mistake in supplementation. D3 raises blood calcium; K2 (specifically the MK-7 form) is what tells calcium where to go — into the bones and teeth, not into the arteries and soft tissue.",
      "We dose 5,000 IU of D3 with 90mcg of K2 MK-7. That is enough D for most patients to move into the optimal 50–80 ng/mL range over a few months, paired with the K cofactor that makes the calcium handling actually safe.",
      "If you have not had a vitamin D level checked recently, do that. Most adults in the US run deficient. This bottle exists because the standard 1,000 IU sold at retail is, for almost everyone, a placebo.",
    ],
    why: {
      headlineText: "Two vitamins, never separate.",
      italicWord: "never separate.",
      paragraphs: [
        "Pairing D and K is not novel — it is the literature. It is also rarely done, because most brands buy the cheaper synthetic K1 if they bother with K at all. K1 does not move calcium the way K2 MK-7 does.",
        "One capsule, every morning, with food that has some fat in it. Both vitamins are fat-soluble.",
      ],
    },
    facts: [
      { label: "Form", value: "Softgel" },
      { label: "Dose", value: "1 softgel daily, with food" },
      { label: "Quantity", value: "60 softgels · 60-day supply" },
      { label: "Sourcing", value: "US-manufactured, GMP-certified" },
    ],
    ingredients: [
      "Vitamin D3 (cholecalciferol) — 5,000 IU (125mcg)",
      "Vitamin K2 (MK-7, menaquinone-7) — 90mcg",
      "Organic olive oil — carrier",
    ],
  },
  "probiotic-plus": {
    italicHeadlineText: "What it does.",
    italicHeadlineWord: "does.",
    paragraphs: [
      "A 50-billion-CFU multi-strain probiotic, shelf-stable, with twelve strains across the Lactobacillus and Bifidobacterium families. Dosed for adults, not toddlers.",
      "I prescribe this most often after a course of antibiotics, after a GI insult, or for patients with chronic loose stools, bloating, or low-grade inflammation that is not pinning to anything else. The estrogen connection matters here too — a meaningful portion of estrogen reabsorption happens in the gut, which is why a poor microbiome can mimic hormonal symptoms.",
      "One capsule a day, anytime. No refrigeration needed. The strains are encapsulated to survive stomach acid.",
    ],
    why: {
      headlineText: "Strains and doses, listed.",
      italicWord: "listed.",
      paragraphs: [
        "Most probiotic bottles list a CFU count and call it a day. We list every strain and disclose the proprietary blend ratios, because if you have ever responded to one strain and not another, you already know why this matters.",
        "Shelf-stable means it works in your medicine cabinet. Refrigerated probiotics are a nightmare for compliance.",
      ],
    },
    facts: [
      { label: "Form", value: "Capsule" },
      { label: "Dose", value: "1 capsule daily" },
      { label: "Quantity", value: "30 capsules · 30-day supply" },
      {
        label: "Sourcing",
        value: "US-manufactured, GMP-certified · shelf-stable",
      },
    ],
    ingredients: [
      "50 billion CFU multi-strain blend",
      "Lactobacillus acidophilus, L. plantarum, L. rhamnosus, L. casei, L. paracasei, L. salivarius",
      "Bifidobacterium lactis, B. bifidum, B. longum, B. breve, B. infantis",
      "Streptococcus thermophilus",
    ],
  },
  "berberine-plus": {
    italicHeadlineText: "What it does.",
    italicHeadlineWord: "does.",
    paragraphs: [
      "Berberine is a small alkaloid extracted from the goldenseal and barberry families. The literature on glucose handling, lipid profiles, and gut motility is robust enough that the molecule is sometimes called nature's metformin — which is overstated, but in the right ballpark.",
      "I prescribe it most often for patients with insulin resistance, PCOS, mild dyslipidemia, or stubborn weight that is not responding to dietary work alone. Paired with milk thistle to support the liver clearance pathway berberine relies on.",
      "Two capsules, twice daily, with the largest two meals. It is not a stimulant. It is a metabolic adjunct, and it works when the rest of the lifestyle work is also being done.",
    ],
    why: {
      headlineText: "Working dose only.",
      italicWord: "Working dose",
      paragraphs: [
        "The studied dose is 1,000–1,500mg per day, split. Most retail bottles dose at 200–500mg total, which will not move the labs. We dose at 500mg per capsule so two capsules twice daily lands in the working range.",
        "Berberine has interactions, particularly with metformin and certain blood-pressure medications. Talk to your doctor before adding it if you are on a regimen.",
      ],
    },
    facts: [
      { label: "Form", value: "Capsule" },
      { label: "Dose", value: "2 capsules twice daily, with meals" },
      { label: "Quantity", value: "120 capsules · 30-day supply" },
      { label: "Sourcing", value: "US-manufactured, GMP-certified" },
    ],
    ingredients: [
      "Berberine HCl — 500mg",
      "Milk thistle extract (silymarin) — 200mg",
      "BioPerine (black pepper extract) — 5mg",
    ],
  },
  ashwagandha: {
    italicHeadlineText: "What it does.",
    italicHeadlineWord: "does.",
    paragraphs: [
      "Ashwagandha is the adaptogen with the cleanest data. KSM-66 is the standardized extract that has been used in most of the trials worth reading. We dose at 600mg, which is the upper end of the range associated with measurable cortisol reduction and improvements in subjective stress and sleep quality.",
      "I prescribe it for patients who are wired-tired — cortisol-dysregulated, sleep that is technically long enough but not restorative, anxiety that has the texture of a stress response rather than a mood disorder.",
      "It is not a sedative. It does not work in an afternoon. Give it three to four weeks to see what it does.",
    ],
    why: {
      headlineText: "The adaptogen worth keeping.",
      italicWord: "worth keeping.",
      paragraphs: [
        "Of the dozen botanicals labeled adaptogen, ashwagandha is the one with replicated trials in stress, sleep, and even some markers of testosterone in men. Most others have a single study and a press release.",
        "Take it at night if it makes you sleepy, in the morning if it does not. Both work. The patient response varies.",
      ],
    },
    facts: [
      { label: "Form", value: "Capsule" },
      { label: "Dose", value: "1 capsule daily" },
      { label: "Quantity", value: "60 capsules · 60-day supply" },
      { label: "Sourcing", value: "US-manufactured, GMP-certified" },
    ],
    ingredients: [
      "Ashwagandha root extract (KSM-66, standardized) — 600mg",
      "Organic rice flour — carrier",
    ],
  },
  "re-grow": {
    italicHeadlineText: "What it does.",
    italicHeadlineWord: "does.",
    paragraphs: [
      "Hair density support, formulated for women — which means biotin at a dose that is high enough to matter, saw palmetto for the DHT pathway that drives androgenic thinning, and marine collagen for the structural protein the follicle uses to build a thicker shaft.",
      "The patients I formulated this for: women noticing thinning around the part line in their forties, women postpartum looking at their hairline in the mirror, and women coming off oral contraceptives who watched their density drop.",
      "Hair grows slowly. Three to four months is a fair window to judge. Pair it with a thyroid panel, ferritin, and vitamin D, because deficiency in any of those will undo any topical or oral protocol.",
    ],
    why: {
      headlineText: "What hair actually needs.",
      italicWord: "actually needs.",
      paragraphs: [
        "Most hair supplements are 90% biotin and 10% marketing. Biotin alone will not address androgenic thinning, which is what most women in perimenopause are facing.",
        "We added the saw palmetto and the collagen because the literature supports both, separately and together, in this population.",
      ],
    },
    facts: [
      { label: "Form", value: "Capsule" },
      { label: "Dose", value: "2 capsules daily" },
      { label: "Quantity", value: "60 capsules · 30-day supply" },
      { label: "Sourcing", value: "US-manufactured, GMP-certified" },
    ],
    ingredients: [
      "Biotin — 5,000mcg",
      "Saw palmetto extract — 320mg",
      "Marine collagen peptides — 500mg",
    ],
  },
  "bonyx-lc-rebo-serum": {
    italicHeadlineText: "What it does.",
    italicHeadlineWord: "does.",
    paragraphs: [
      "A regenerative leave-on serum from the Bonyx LC line. I started using it on my own face two years ago after a colleague handed me a bottle and refused to tell me what was in it until I tried it. It is now what I send patients home with after in-clinic regenerative treatments, and what I reach for in the morning before SPF.",
      "It is not a moisturizer in the conventional sense. It is a thin, fast-absorbing serum that sits cleanly under everything else.",
      "One pump, morning or evening, on clean skin. The full ingredient deck is on the label — there is more there than I am going to recap.",
    ],
    why: {
      headlineText: "What I use on my own face.",
      italicWord: "my own face.",
      paragraphs: [
        "I do not stock topicals on this shelf casually. This one is the exception, and it is here because patients kept asking what I use after they noticed my skin between visits.",
        "Bonyx is a clinician-only line. We carry the LC REBO serum specifically. Other items in the line are available in-clinic by request.",
      ],
    },
    facts: [
      { label: "Form", value: "Leave-on serum" },
      { label: "Use", value: "1 pump, morning and/or evening" },
      { label: "Quantity", value: "1 fl oz (30 mL)" },
      { label: "Sourcing", value: "Clinician-channel cosmeceutical line" },
    ],
    ingredients: [
      "1 fl oz leave-in serum",
      "See product label for full ingredient deck",
    ],
  },
};

function ItalicHeadline({
  text,
  italicWord,
  tone = "light",
}: {
  text: string;
  italicWord: string;
  tone?: "light" | "dark";
}) {
  const idx = text.indexOf(italicWord);
  if (idx === -1) return <>{text}</>;
  const pre = text.slice(0, idx);
  const post = text.slice(idx + italicWord.length);
  const emColor = tone === "dark" ? "#f4a3aa" : "#8a3a44";
  return (
    <>
      {pre}
      <em style={{ color: emColor, fontStyle: "italic" }}>{italicWord}</em>
      {post}
    </>
  );
}

function relatedFor(current: Supplement): Supplement[] {
  const sameCategory = ALL.filter(
    (p) => p.slug !== current.slug && p.category === current.category,
  );
  const others = ALL.filter(
    (p) => p.slug !== current.slug && p.category !== current.category,
  );
  return [...sameCategory, ...others].slice(0, 3);
}

export default function ProductClient({ slug }: { slug: string }) {
  const product = ALL.find((p) => p.slug === slug);
  if (!product) return null;
  const detail = DETAILS[slug];
  const related = relatedFor(product);

  return (
    <section className="wf" data-id="E">
      <MeshGradient
        aria-hidden="true"
        colors={["#fff5f1", "#ffeae0", "#f4d4d4", "#f4a3aa"]}
        speed={0.6}
        distortion={0.6}
        swirl={0.4}
        width="100vw"
        height="100vh"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* 1. HERO — dark wine, product name */}
      <div
        className="e-rounded-section"
        style={{
          position: "relative",
          minHeight: "62vh",
          padding: "180px 6vw 100px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#fff5f1",
        }}
      >
        <SiteNav />
        <GrainGradient
          colors={["#a13a48", "#6a2230", "#1a0a10"]}
          colorBack="#1a0a10"
          shape="sphere"
          speed={1.2}
          scale={0.5}
          noise={0.5}
          softness={0.7}
          intensity={0.35}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 10, maxWidth: 980 }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, ease: EASE }}
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              fontSize: 11,
              color: "#f4a3aa",
              marginBottom: 28,
            }}
          >
            Berman Supplements · {product.category}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            style={{
              fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
              fontWeight: 400,
              fontSize: "clamp(48px, 7.4vw, 104px)",
              lineHeight: 1.02,
              letterSpacing: "-0.015em",
              color: "#fff5f1",
              margin: 0,
            }}
          >
            <ItalicHeadline
              text={product.name}
              italicWord={product.italicWord}
              tone="dark"
            />
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.65, delay: 0.22, ease: EASE }}
            style={{
              fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
              fontWeight: 400,
              fontSize: "clamp(20px, 1.6vw, 24px)",
              lineHeight: 1.5,
              color: "rgba(255,245,241,0.88)",
              maxWidth: 720,
              margin: "32px auto 0",
            }}
          >
            {product.tagline}
          </motion.p>
        </div>
      </div>

      {/* 2. DETAIL — image left, copy right */}
      <div
        style={{
          position: "relative",
          padding: "120px 6vw 80px",
          color: "#4a1c26",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1280,
            margin: "0 auto",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.8, delay: 0.05, ease: EASE }}
            className="detail-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 80,
              alignItems: "start",
              maxWidth: 1180,
              margin: "0 auto",
            }}
          >
            <div
              className="product-detail-media"
              style={{
                position: "sticky",
                top: 100,
                aspectRatio: "4 / 5",
                borderRadius: 24,
                overflow: "hidden",
                background: WINE_GLASS_BG,
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: "1px solid rgba(244,163,170,0.28)",
                boxShadow:
                  "0 40px 80px -30px rgba(74,28,38,0.55), 0 12px 28px -12px rgba(74,28,38,0.3)",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(circle at 50% 55%, rgba(244,163,170,0.24) 0%, rgba(244,163,170,0) 60%)",
                  pointerEvents: "none",
                }}
              />
              <div aria-hidden="true" className="product-detail-shadow" />
              <img
                src={floatingSupplementImage(product.image)}
                alt={product.name}
                style={{
                  width: "90%",
                  height: "90%",
                  objectFit: "contain",
                  display: "block",
                  position: "relative",
                  zIndex: 1,
                  margin: "5% auto",
                }}
                className="product-detail-img"
              />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'DM Mono', ui-monospace, monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  fontSize: 11,
                  color: "#8a3a44",
                  marginBottom: 24,
                }}
              >
                {product.category}
              </div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
                  fontWeight: 400,
                  fontSize: "clamp(34px, 4vw, 52px)",
                  lineHeight: 1.06,
                  letterSpacing: "-0.005em",
                  color: "#4a1c26",
                  margin: "0 0 32px",
                }}
              >
                <ItalicHeadline
                  text={detail.italicHeadlineText}
                  italicWord={detail.italicHeadlineWord}
                />
              </h2>
              {detail.paragraphs.map((para, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={{
                    duration: 0.55,
                    delay: 0.06 + i * 0.08,
                    ease: EASE,
                  }}
                  style={{
                    fontFamily:
                      "'Cormorant Garamond', 'Times New Roman', serif",
                    fontWeight: 400,
                    fontSize: "clamp(17px, 1.25vw, 20px)",
                    lineHeight: 1.6,
                    color: "#4a1c26",
                    margin: "0 0 20px",
                    opacity: 0.92,
                  }}
                >
                  {para}
                </motion.p>
              ))}

              <dl
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "14px 24px",
                  margin: "40px 0 40px",
                  paddingTop: 28,
                  borderTop: "1px solid rgba(74,28,38,0.18)",
                }}
              >
                {detail.facts.map((f) => (
                  <div key={f.label} style={{ display: "contents" }}>
                    <dt
                      style={{
                        fontFamily: "'DM Mono', ui-monospace, monospace",
                        textTransform: "uppercase",
                        letterSpacing: "0.2em",
                        fontSize: 10,
                        color: "#8a3a44",
                        paddingTop: 4,
                      }}
                    >
                      {f.label}
                    </dt>
                    <dd
                      style={{
                        fontFamily:
                          "'Cormorant Garamond', 'Times New Roman', serif",
                        fontSize: 18,
                        lineHeight: 1.45,
                        color: "#4a1c26",
                        margin: 0,
                      }}
                    >
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 18,
                  marginBottom: 28,
                }}
              >
                <span
                  style={{
                    fontFamily:
                      "'Cormorant Garamond', 'Times New Roman', serif",
                    fontStyle: "italic",
                    fontSize: 36,
                    color: "#4a1c26",
                  }}
                >
                  {product.price}
                </span>
                <span
                  style={{
                    fontFamily: "'DM Mono', ui-monospace, monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    fontSize: 10,
                    color: "rgba(74,28,38,0.55)",
                  }}
                >
                  USD · single bottle
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 20,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <AddToCartButton
                  productSlug={product.slug}
                  name={product.name}
                  price={priceToNumber(product.price)}
                  image={product.image}
                />
                <span
                  style={{
                    fontFamily: "'DM Mono', ui-monospace, monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    fontSize: 10,
                    color: "rgba(74,28,38,0.6)",
                  }}
                >
                  Free US shipping over $150
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 3. WHY THIS EXISTS — short editorial */}
      <div
        className="e-rounded-section"
        style={{
          position: "relative",
          padding: "140px 6vw",
          color: "#fff5f1",
          overflow: "hidden",
        }}
      >
        <NeuroNoise
          colorBack="#1a0a10"
          colorMid="#2a1018"
          colorFront="#4a1c26"
          brightness={0.32}
          contrast={0.45}
          scale={1.1}
          speed={0.3}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 880,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, ease: EASE }}
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              fontSize: 11,
              color: "#f4a3aa",
              marginBottom: 28,
            }}
          >
            Why this exists
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
            style={{
              fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
              fontWeight: 400,
              fontSize: "clamp(34px, 4.4vw, 56px)",
              lineHeight: 1.08,
              letterSpacing: "-0.005em",
              color: "#fff5f1",
              margin: "0 0 40px",
            }}
          >
            <ItalicHeadline
              text={detail.why.headlineText}
              italicWord={detail.why.italicWord}
              tone="dark"
            />
          </motion.h2>
          {detail.why.paragraphs.map((para, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{
                duration: 0.55,
                delay: 0.14 + i * 0.08,
                ease: EASE,
              }}
              style={{
                fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
                fontWeight: 400,
                fontSize: "clamp(18px, 1.35vw, 22px)",
                lineHeight: 1.6,
                color: "rgba(255,245,241,0.88)",
                margin: "0 auto 22px",
                maxWidth: 760,
              }}
            >
              {para}
            </motion.p>
          ))}
        </div>
      </div>

      {/* 4. WHAT'S INSIDE — ingredient list */}
      <div
        style={{
          position: "relative",
          padding: "140px 6vw 100px",
          color: "#4a1c26",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 720,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, ease: EASE }}
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              fontSize: 11,
              color: "#8a3a44",
              marginBottom: 24,
            }}
          >
            What&apos;s inside
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
            style={{
              fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
              fontWeight: 400,
              fontSize: "clamp(32px, 4vw, 48px)",
              lineHeight: 1.08,
              letterSpacing: "-0.005em",
              color: "#4a1c26",
              margin: "0 0 48px",
            }}
          >
            <ItalicHeadline
              text="The full ingredient deck."
              italicWord="ingredient deck."
            />
          </motion.h2>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              textAlign: "left",
            }}
          >
            {detail.ingredients.map((line, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={VIEWPORT}
                transition={{
                  duration: 0.5,
                  delay: 0.08 + i * 0.06,
                  ease: EASE,
                }}
                style={{
                  fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
                  fontSize: "clamp(17px, 1.25vw, 20px)",
                  lineHeight: 1.55,
                  color: "#4a1c26",
                  padding: "16px 0",
                  borderBottom: "1px solid rgba(74,28,38,0.15)",
                  display: "flex",
                  gap: 18,
                  alignItems: "baseline",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    fontStyle: "italic",
                    color: "#8a3a44",
                    fontSize: 22,
                    minWidth: 24,
                  }}
                >
                  ✦
                </span>
                <span>{line}</span>
              </motion.li>
            ))}
          </ul>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontSize: 10,
              color: "rgba(74,28,38,0.55)",
              marginTop: 32,
              textAlign: "center",
            }}
          >
            Sample formulation · See product label for current values
          </motion.p>
        </div>
      </div>

      {/* 5. RELATED PRODUCTS — 3 cards */}
      <div
        style={{
          position: "relative",
          padding: "60px 6vw 140px",
          color: "#4a1c26",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1280,
            margin: "0 auto",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, ease: EASE }}
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              fontSize: 11,
              color: "#8a3a44",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            Also on the shelf
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
            style={{
              fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
              fontWeight: 400,
              fontSize: "clamp(30px, 3.6vw, 44px)",
              lineHeight: 1.08,
              letterSpacing: "-0.005em",
              color: "#4a1c26",
              margin: "0 0 56px",
              textAlign: "center",
            }}
          >
            <ItalicHeadline
              text="Often paired with this."
              italicWord="paired with this."
            />
          </motion.h3>
          <div
            className="related-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 28,
            }}
          >
            {related.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{
                  duration: 0.6,
                  delay: 0.08 + i * 0.08,
                  ease: EASE,
                }}
                whileHover={{ y: -6 }}
                className="related-card"
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 24,
                  overflow: "hidden",
                  background: "rgba(255,245,241,0.7)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  border: "1px solid rgba(217,155,161,0.3)",
                  transition: "box-shadow 0.4s ease",
                }}
              >
                <Link
                  href={`/services/supplements/${p.slug}`}
                  aria-label={`View ${p.name} details`}
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 1,
                    textDecoration: "none",
                    color: "inherit",
                  }}
                />
                <div
                  className="related-media"
                  style={{
                    position: "relative",
                    aspectRatio: "1 / 1",
                    background: WINE_GLASS_BG,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    borderBottom: "1px solid rgba(244,163,170,0.18)",
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "radial-gradient(circle at 50% 55%, rgba(244,163,170,0.22) 0%, rgba(244,163,170,0) 60%)",
                      pointerEvents: "none",
                    }}
                  />
                  <div aria-hidden="true" className="related-product-shadow" />
                  <img
                    src={floatingSupplementImage(p.image)}
                    alt={p.name}
                    style={{
                      width: "88%",
                      height: "88%",
                      objectFit: "contain",
                      transition: "transform 0.6s cubic-bezier(0.2,0.7,0.2,1)",
                      position: "relative",
                      zIndex: 1,
                    }}
                    className="related-img"
                  />
                </div>
                <div
                  style={{
                    padding: "28px 26px 26px",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    position: "relative",
                    zIndex: 2,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'DM Mono', ui-monospace, monospace",
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                      fontSize: 10,
                      color: "#8a3a44",
                      marginBottom: 12,
                    }}
                  >
                    {p.category}
                  </div>
                  <h4
                    style={{
                      fontFamily:
                        "'Cormorant Garamond', 'Times New Roman', serif",
                      fontWeight: 400,
                      fontSize: 28,
                      lineHeight: 1.05,
                      color: "#4a1c26",
                      margin: "0 0 12px",
                    }}
                  >
                    <ItalicHeadline text={p.name} italicWord={p.italicWord} />
                  </h4>
                  <p
                    style={{
                      fontFamily:
                        "'Cormorant Garamond', 'Times New Roman', serif",
                      fontSize: 16,
                      lineHeight: 1.5,
                      color: "#4a1c26",
                      margin: "0 0 20px",
                      opacity: 0.85,
                      flex: 1,
                    }}
                  >
                    {p.tagline}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: 18,
                      borderTop: "1px solid rgba(74,28,38,0.15)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily:
                          "'Cormorant Garamond', 'Times New Roman', serif",
                        fontStyle: "italic",
                        fontSize: 22,
                        color: "#4a1c26",
                      }}
                    >
                      {p.price}
                    </span>
                    <span
                      style={{
                        fontFamily: "'DM Mono', ui-monospace, monospace",
                        textTransform: "uppercase",
                        letterSpacing: "0.2em",
                        fontSize: 10,
                        color: "#8a3a44",
                      }}
                    >
                      View →
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <PageTail />
      <SiteFooter />

      <style jsx global>{`
        .product-detail-media,
        .related-media {
          isolation: isolate;
        }

        .product-detail-media::after,
        .related-media::after {
          content: "";
          position: absolute;
          left: 16%;
          right: 16%;
          bottom: 13%;
          height: 28px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.26);
          filter: blur(16px);
          transform: perspective(800px) rotateX(64deg);
          z-index: 0;
        }

        .product-detail-shadow,
        .related-product-shadow {
          position: absolute;
          left: 20%;
          right: 20%;
          bottom: 17%;
          height: 20px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.24);
          filter: blur(14px);
          z-index: 0;
        }

        .product-detail-img,
        .related-img {
          filter: drop-shadow(0 26px 28px rgba(0, 0, 0, 0.26));
        }

        .related-card:hover {
          box-shadow:
            0 30px 60px -20px rgba(74, 28, 38, 0.4),
            0 8px 20px -8px rgba(74, 28, 38, 0.22);
        }
        .related-card:hover .related-img {
          transform: scale(1.06);
        }
        @media (max-width: 980px) {
          .detail-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
        @media (max-width: 880px) {
          .related-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
