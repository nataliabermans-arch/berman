import { notFound } from "next/navigation";
import type { Metadata } from "next";

import LegacySimplePage from "@/components/legacy/LegacySimplePage";
import {
  getLegacyPageAliasByPath,
  LEGACY_MEDIA_ALIASES,
} from "@/lib/legacy-pages";

export async function generateStaticParams() {
  return LEGACY_MEDIA_ALIASES.flatMap((alias) => {
    const slug = alias.path.replace(/^\/media\/|\/+$/g, "");
    return slug && !slug.includes("/") ? [{ slug }] : [];
  });
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const alias = getLegacyPageAliasByPath(`/media/${params.slug}/`);
  if (!alias) return {};

  return {
    title: alias.title,
    description: alias.description,
    alternates: {
      canonical: alias.path,
    },
    openGraph: {
      title: alias.title,
      description: alias.description,
      url: alias.path,
      type: "website",
    },
  };
}

export default function MediaSlugPage({ params }: { params: { slug: string } }) {
  const alias = getLegacyPageAliasByPath(`/media/${params.slug}/`);
  if (!alias) notFound();

  return (
    <LegacySimplePage
      title={alias.title}
      description={alias.description}
      eyebrow="Media"
      ctaHref="/contact/"
      ctaLabel="Request a consult"
    />
  );
}
