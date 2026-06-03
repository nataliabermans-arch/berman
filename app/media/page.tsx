import type { Metadata } from "next";

import LegacySimplePage from "@/components/legacy/LegacySimplePage";
import { getLegacyPageAliasByPath } from "@/lib/legacy-pages";

const alias = getLegacyPageAliasByPath("/media/");

export async function generateMetadata(): Promise<Metadata> {
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

export default function MediaPage() {
  return (
    <LegacySimplePage
      title={alias?.title ?? "Media"}
      description={
        alias?.description ??
        "Media, press, and television features from Dr. Jennifer Berman."
      }
      eyebrow="Media"
      ctaHref="/contact/"
      ctaLabel="Request a consult"
    />
  );
}
