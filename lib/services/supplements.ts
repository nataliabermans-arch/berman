/**
 * Supplements catalog — Dr. Berman's physician-formulated line.
 * External shop is hosted at drjenniferberman.gethealthy.store.
 */

export interface Supplement {
  slug: string;
  name: string;
  italicWord: string;
  tagline: string;
  category:
    | "Hormone"
    | "Libido"
    | "Gut"
    | "Foundational"
    | "Stress"
    | "Hair"
    | "Metabolic"
    | "Skincare";
  price: string;
  image: string;
  shopUrl: string;
}

const SHOP_BASE = "https://drjenniferberman.gethealthy.store";

export const SUPPLEMENT_BUNDLE: Supplement = {
  slug: "hormone-balance-essentials",
  name: "Hormone Balance Essentials",
  italicWord: "Essentials",
  tagline:
    "DIM, Vitamin D+K, and Probiotic Plus — the starter stack we hand to women in perimenopause and beyond.",
  category: "Foundational",
  price: "$156.90",
  image: "/images/supplements/hormone-balance-essentials.webp",
  shopUrl: `${SHOP_BASE}/pl-drjenniferberman-foundationalpack.html`,
};

export const SUPPLEMENTS: Supplement[] = [
  {
    slug: "dim-plus",
    name: "DIM +",
    italicWord: "DIM",
    tagline:
      "Cleaner estrogen metabolism. The classic perimenopause adjunct — and the most-asked-about bottle on this shelf.",
    category: "Hormone",
    price: "$80.00",
    image: "/images/supplements/dim-plus.webp",
    shopUrl: `${SHOP_BASE}/dim.html`,
  },
  {
    slug: "libido-enhance",
    name: "Libido Enhance",
    italicWord: "Libido",
    tagline:
      "Maca, tribulus, and fenugreek formulated together — for the women who actually notice the difference.",
    category: "Libido",
    price: "$80.00",
    image: "/images/supplements/libido-enhance.webp",
    shopUrl: `${SHOP_BASE}/libido-enhance.html`,
  },
  {
    slug: "vitamin-d-plus-k",
    name: "Vitamin D Plus K",
    italicWord: "Vitamin D",
    tagline:
      "The two vitamins everyone tests low for — paired in the active forms your body actually uses.",
    category: "Foundational",
    price: "$60.00",
    image: "/images/supplements/vitamin-d-plus-k.webp",
    shopUrl: `${SHOP_BASE}/vitamin-d-plus-k.html`,
  },
  {
    slug: "probiotic-plus",
    name: "Probiotic Plus",
    italicWord: "Probiotic",
    tagline:
      "Multi-strain, shelf-stable, clinical doses. The bottle we hand to every patient finishing a course of antibiotics.",
    category: "Gut",
    price: "$75.00",
    image: "/images/supplements/probiotic-plus.webp",
    shopUrl: `${SHOP_BASE}/probiotic-plus.html`,
  },
  {
    slug: "berberine-plus",
    name: "Berberine +",
    italicWord: "Berberine",
    tagline:
      "Glucose, lipids, and gut motility — the small molecule frequently called nature's metformin.",
    category: "Metabolic",
    price: "$80.00",
    image: "/images/supplements/berberine-plus.webp",
    shopUrl: `${SHOP_BASE}/berberine.html`,
  },
  {
    slug: "ashwagandha",
    name: "Ashwagandha",
    italicWord: "Ashwagandha",
    tagline:
      "An adaptogen for the cortisol-dysregulated. Sleep, mood, recovery — without sedation.",
    category: "Stress",
    price: "$75.00",
    image: "/images/supplements/ashwagandha.webp",
    shopUrl: `${SHOP_BASE}/ashwagandha.html`,
  },
  {
    slug: "re-grow",
    name: "Re:Grow",
    italicWord: "Re:Grow",
    tagline:
      "Hair density support — biotin, saw palmetto, and marine collagen for thinning post-40 or postpartum.",
    category: "Hair",
    price: "$75.00",
    image: "/images/supplements/re-grow.webp",
    shopUrl: `${SHOP_BASE}/re-grow.html`,
  },
  {
    slug: "bonyx-lc-rebo-serum",
    name: "Bonyx LC REBO Serum",
    italicWord: "REBO",
    tagline:
      "A regenerative topical from the Bonyx line — for the patients asking what we use on our own faces.",
    category: "Skincare",
    price: "$450.00",
    image: "/images/supplements/bonyx-lc-rebo-serum.webp",
    shopUrl: `${SHOP_BASE}/bonyx-lc-rebo-serum.html`,
  },
];

export const SUPPLEMENTS_HERO = {
  eyebrow: "Practitioner-grade · Physician-formulated",
  headline: "Supplements built\nlike medicine.",
  italicWord: "medicine.",
  sub: "A small line of bottles I actually prescribe — formulated to clinical doses, third-party tested, and chosen because the literature says they work.",
};

export const SUPPLEMENTS_PHILOSOPHY = {
  eyebrow: "Three rules",
  headline: "How I choose what makes the shelf.",
  italicWord: "what makes the shelf.",
  rules: [
    {
      num: "01",
      title: "Clinical dose or it doesn't ship.",
      italicWord: "Clinical dose",
      body: "If the studied effective dose is 600mg, the bottle is 600mg — not the 50mg sprinkle most retail brands use to put the ingredient on the label.",
    },
    {
      num: "02",
      title: "Bioavailable form, every time.",
      italicWord: "Bioavailable form,",
      body: "Methylated B12, K2 MK-7, magnesium glycinate — we use the forms your body actually absorbs. Cheaper isomers are not on this shelf.",
    },
    {
      num: "03",
      title: "Third-party tested. No proprietary blends.",
      italicWord: "Third-party tested.",
      body: "Every batch is tested for purity and potency by an independent lab. Every ingredient is listed by exact dose, not hidden inside a 'proprietary blend.'",
    },
  ],
};
