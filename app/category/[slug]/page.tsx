import type { Metadata } from "next";

import LegacySimplePage from "@/components/legacy/LegacySimplePage";

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const title = titleFromSlug(params.slug);
  const path = `/category/${params.slug}/`;
  return {
    title: `${title} — Dr. Jennifer Berman`,
    description: `Articles and resources in ${title} from Dr. Jennifer Berman.`,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${title} — Dr. Jennifer Berman`,
      description: `Articles and resources in ${title} from Dr. Jennifer Berman.`,
      url: path,
      type: "website",
    },
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const title = titleFromSlug(params.slug);

  return (
    <LegacySimplePage
      title={title}
      description={`Articles and resources in ${title} from Dr. Jennifer Berman.`}
      eyebrow="Category"
      ctaHref="/womens-health-blog/"
      ctaLabel="Visit the blog"
    />
  );
}
