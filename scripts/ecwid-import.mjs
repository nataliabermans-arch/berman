// One-shot catalog import into Ecwid.
//
//   ECWID_STORE_ID=12345678 ECWID_SECRET_TOKEN=secret_xxx node scripts/ecwid-import.mjs
//
// Creates the 9 supplement products and attaches each product image from the
// live site. Idempotent-ish: it matches on SKU and updates instead of
// duplicating. Alternative (no code): Ecwid dashboard -> Catalog -> Products
// -> Import, using the CSV feed we generated.

const STORE = process.env.ECWID_STORE_ID?.trim();
const TOKEN = process.env.ECWID_SECRET_TOKEN?.trim();
if (!STORE || !TOKEN) {
  console.error("Set ECWID_STORE_ID and ECWID_SECRET_TOKEN.");
  process.exit(1);
}
const API = `https://app.ecwid.com/api/v3/${STORE}`;
const H = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };
const IMG = "https://bermansexualhealth.com/images/supplements";

const PRODUCTS = [
  { sku: "hormone-balance-essentials", name: "Hormone Balance Essentials", price: 156.90, img: "hormone-balance-essentials.webp", desc: "DIM, Vitamin D+K, and Probiotic Plus — the starter stack we hand to women in perimenopause and beyond. Three bottles, one foundation." },
  { sku: "dim-plus", name: "DIM +", price: 80.0, img: "dim-plus.webp", desc: "Cleaner estrogen metabolism. The classic perimenopause adjunct — and the most-asked-about bottle on this shelf." },
  { sku: "libido-enhance", name: "Libido Enhance", price: 80.0, img: "libido-enhance.webp", desc: "Maca, tribulus, and fenugreek formulated together — for the women who actually notice the difference." },
  { sku: "vitamin-d-plus-k", name: "Vitamin D Plus K", price: 60.0, img: "vitamin-d-plus-k.webp", desc: "The two vitamins everyone tests low for — paired in the active forms your body actually uses." },
  { sku: "probiotic-plus", name: "Probiotic Plus", price: 75.0, img: "probiotic-plus.webp", desc: "Multi-strain, shelf-stable, clinical doses. The bottle we hand to every patient finishing a course of antibiotics." },
  { sku: "berberine-plus", name: "Berberine +", price: 80.0, img: "berberine-plus.webp", desc: "Glucose, lipids, and gut motility — the small molecule frequently called nature's metformin." },
  { sku: "ashwagandha", name: "Ashwagandha", price: 75.0, img: "ashwagandha.webp", desc: "An adaptogen for the cortisol-dysregulated. Sleep, mood, recovery — without sedation." },
  { sku: "re-grow", name: "Re:Grow", price: 75.0, img: "re-grow.webp", desc: "Hair density support — biotin, saw palmetto, and marine collagen for thinning post-40 or postpartum." },
  { sku: "bonyx-lc-rebo-serum", name: "Bonyx LC REBO Serum", price: 450.0, img: "bonyx-lc-rebo-serum.webp", desc: "A regenerative topical from the Bonyx line — for the patients asking what we use on our own faces." },
];

async function findBySku(sku) {
  const r = await fetch(`${API}/products?sku=${encodeURIComponent(sku)}`, { headers: H });
  if (!r.ok) return null;
  const j = await r.json();
  return j.items?.[0]?.id ?? null;
}

for (const p of PRODUCTS) {
  const body = JSON.stringify({ sku: p.sku, name: p.name, price: p.price, enabled: true, description: `<p>${p.desc}</p>` });
  const existing = await findBySku(p.sku);
  let id = existing;
  if (existing) {
    const r = await fetch(`${API}/products/${existing}`, { method: "PUT", headers: H, body });
    console.log(`${r.ok ? "updated" : "FAILED update"}  ${p.name}`);
  } else {
    const r = await fetch(`${API}/products`, { method: "POST", headers: H, body });
    const j = await r.json().catch(() => ({}));
    id = j.id;
    console.log(`${r.ok ? "created" : "FAILED create"}  ${p.name}  ${id ?? JSON.stringify(j).slice(0, 120)}`);
  }
  if (id) {
    const ri = await fetch(`${API}/products/${id}/image?externalUrl=${encodeURIComponent(`${IMG}/${p.img}`)}`, { method: "POST", headers: { Authorization: `Bearer ${TOKEN}` } });
    console.log(`   image ${ri.ok ? "ok" : "FAILED " + ri.status}`);
  }
  await new Promise((r) => setTimeout(r, 300));
}
console.log("done — check Ecwid dashboard -> Catalog -> Products");
