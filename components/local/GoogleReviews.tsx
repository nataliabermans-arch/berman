// Live reviews from the practice's Google Business Profile, via the Google
// Places API (New). Server component: fetched at build/revalidate time, so no
// third-party script loads in the visitor's browser.
//
// Env (Vercel):
//   GOOGLE_PLACES_API_KEY  — required for live reviews (Places API (New) enabled)
//   GOOGLE_PLACE_ID        — optional; resolved by text search when missing
//
// Without a key (or if Google errors) it renders a plain link to the reviews on
// Google — never placeholder ratings.

const SEARCH_QUERY =
  "Jennifer R. Berman, MD, 415 N Crescent Dr #355, Beverly Hills, CA 90210";
const REVIEWS_FALLBACK_HREF = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  SEARCH_QUERY,
)}`;
const REVALIDATE_SECONDS = 6 * 60 * 60;

const SERIF = "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif";
const MONO = "var(--font-dm-mono), ui-monospace, monospace";
const SANS = "var(--font-inter), system-ui, sans-serif";
const WINE = "#4a1c26";
const DEEP = "#7a2233";
const GOLD = "#c9962c";

interface PlaceReview {
  rating?: number;
  relativePublishTimeDescription?: string;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
}

interface PlaceDetails {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlaceReview[];
}

async function resolvePlaceId(key: string): Promise<string | null> {
  const fromEnv = process.env.GOOGLE_PLACE_ID?.trim();
  if (fromEnv) return fromEnv;
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.id",
    },
    body: JSON.stringify({ textQuery: SEARCH_QUERY }),
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { places?: { id?: string }[] };
  return data.places?.[0]?.id ?? null;
}

async function getPlaceDetails(): Promise<PlaceDetails | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key) return null;
  try {
    const placeId = await resolvePlaceId(key);
    if (!placeId) return null;
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=en`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
        },
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );
    if (!res.ok) return null;
    return (await res.json()) as PlaceDetails;
  } catch {
    return null;
  }
}

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const full = Math.round(value);
  return (
    <span
      aria-label={`${value.toFixed(1)} out of 5 stars`}
      style={{ color: GOLD, fontSize: size, letterSpacing: 2 }}
    >
      {"★".repeat(full)}
      <span style={{ color: "rgba(201,150,44,0.3)" }}>{"★".repeat(5 - full)}</span>
    </span>
  );
}

function truncate(text: string, max = 280) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

const sectionStyle = {
  position: "relative",
  zIndex: 2,
  background: "#fbeee9",
  padding: "clamp(56px, 8vw, 96px) 20px",
} as const;

const eyebrowStyle = {
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: DEEP,
  margin: "0 0 12px",
} as const;

const headingStyle = {
  fontFamily: SERIF,
  fontWeight: 400,
  fontSize: "clamp(30px, 3.6vw, 44px)",
  lineHeight: 1.1,
  color: WINE,
  margin: 0,
} as const;

const linkButtonStyle = {
  display: "inline-block",
  padding: "12px 22px",
  borderRadius: 999,
  border: `1px solid ${WINE}`,
  color: WINE,
  fontFamily: MONO,
  fontSize: 12,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  textDecoration: "none",
} as const;

export default async function GoogleReviews() {
  const place = await getPlaceDetails();
  const reviews = (place?.reviews ?? []).filter(
    (r) => (r.text?.text || r.originalText?.text)?.trim(),
  );
  const allReviewsHref = place?.googleMapsUri || REVIEWS_FALLBACK_HREF;

  if (!place || reviews.length === 0) {
    return (
      <section aria-labelledby="google-reviews-heading" style={sectionStyle}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <p style={eyebrowStyle}>Patient reviews</p>
          <h2 id="google-reviews-heading" style={{ ...headingStyle, marginBottom: 22 }}>
            What patients say on Google
          </h2>
          <a href={allReviewsHref} target="_blank" rel="noopener noreferrer" style={linkButtonStyle}>
            Read our Google reviews →
          </a>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="google-reviews-heading" style={sectionStyle}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 18,
            marginBottom: 28,
          }}
        >
          <div>
            <p style={eyebrowStyle}>Patient reviews</p>
            <h2 id="google-reviews-heading" style={headingStyle}>
              What patients say on Google
            </h2>
          </div>
          {typeof place.rating === "number" && (
            <div style={{ fontFamily: SANS, color: WINE, textAlign: "right" }}>
              <div style={{ fontFamily: SERIF, fontSize: 40, lineHeight: 1 }}>
                {place.rating.toFixed(1)}
              </div>
              <Stars value={place.rating} size={18} />
              {typeof place.userRatingCount === "number" && (
                <div style={{ fontSize: 13, marginTop: 4 }}>
                  {place.userRatingCount} Google reviews
                </div>
              )}
            </div>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 18,
          }}
        >
          {reviews.slice(0, 5).map((r, i) => {
            const author = r.authorAttribution?.displayName || "Google user";
            const body = (r.text?.text || r.originalText?.text || "").trim();
            return (
              <figure
                key={`${author}-${i}`}
                style={{
                  margin: 0,
                  background: "#fff7f3",
                  border: "1px solid rgba(217,155,161,0.4)",
                  borderRadius: 16,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {typeof r.rating === "number" && <Stars value={r.rating} />}
                <blockquote
                  style={{
                    margin: 0,
                    fontFamily: SANS,
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: WINE,
                    flex: 1,
                  }}
                >
                  {truncate(body)}
                </blockquote>
                <figcaption
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontFamily: SANS,
                    fontSize: 13,
                    color: "#6b5b5e",
                  }}
                >
                  {r.authorAttribution?.photoUri && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.authorAttribution.photoUri}
                      alt=""
                      width={28}
                      height={28}
                      referrerPolicy="no-referrer"
                      style={{ borderRadius: 999 }}
                    />
                  )}
                  <span>
                    {r.authorAttribution?.uri ? (
                      <a
                        href={r.authorAttribution.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: WINE, fontWeight: 600 }}
                      >
                        {author}
                      </a>
                    ) : (
                      <strong style={{ color: WINE }}>{author}</strong>
                    )}
                    {r.relativePublishTimeDescription ? ` · ${r.relativePublishTimeDescription}` : ""}
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 26,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <span style={{ fontFamily: SANS, fontSize: 12, color: "#6b5b5e" }}>
            Reviews from Google
          </span>
          <a href={allReviewsHref} target="_blank" rel="noopener noreferrer" style={linkButtonStyle}>
            Read all reviews on Google →
          </a>
        </div>
      </div>
    </section>
  );
}
