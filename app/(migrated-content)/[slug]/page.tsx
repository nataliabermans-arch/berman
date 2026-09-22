import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import { SERVICE_BY_SLUG } from "@/lib/services/content";

import { getAllSlugs, getArticleBySlug } from "@/lib/journal/articles";
import { getRelatedArticles } from "@/lib/journal/related";
import {
  getLegacyPageAliasByPath,
  LEGACY_SINGLE_SEGMENT_ALIASES,
  legacyAliasPathToSlug,
  type LegacyPageAlias,
} from "@/lib/legacy-pages";
import LegacySimplePage from "@/components/legacy/LegacySimplePage";
import PrivacyClient from "@/app/privacy/_privacy-client";
import TermsClient from "@/app/terms/_terms-client";
import ServiceDetailPage from "@/app/services/_service-detail-renderer";
import ArticleClient from "@/app/journal/[slug]/_article-client";

const SITE = siteUrl;

export async function generateStaticParams() {
  const slugs = new Set(getAllSlugs());
  for (const alias of LEGACY_SINGLE_SEGMENT_ALIASES) {
    slugs.add(legacyAliasPathToSlug(alias));
  }

  return Array.from(slugs).map((slug) => ({ slug }));
}

function legacyAliasMetadata(alias: LegacyPageAlias): Metadata {
  return {
    title: alias.title,
    description: alias.description,
    robots:
      alias.type === "thank-you"
        ? {
            index: false,
            follow: false,
          }
        : undefined,
    openGraph: {
      title: alias.title,
      description: alias.description,
      url: alias.path,
      type: "website",
    },
    alternates: {
      // A legacy service URL and its /services/<slug>/ twin render the same
      // page. Point the legacy URL's canonical at the /services/ version so
      // Google consolidates the duplicates onto one master instead of ranking
      // both.
      canonical:
        alias.type === "service" && alias.serviceSlug
          ? `/services/${alias.serviceSlug}/`
          : alias.path,
    },
  };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);
  if (!article) {
    const alias = getLegacyPageAliasByPath(`/${params.slug}/`);
    return alias ? legacyAliasMetadata(alias) : {};
  }

  const url = article.originalUrl || `${SITE}/${article.slug}/`;
  const heroImage = article.featuredImage
    ? article.featuredImage.startsWith("http")
      ? article.featuredImage
      : `${SITE}${article.featuredImage}`
    : `${SITE}/images/dr-berman/headshot-portrait.webp`;

  return {
    // Keep the browser/SEO title to just the article's own (keyword-rich)
    // title so it isn't truncated in results — the template would otherwise
    // append " — The Berman Brief | Berman Women's Wellness" and blow past the
    // ~60-character display limit. Brand context still lives in the OG title.
    title: { absolute: article.title },
    description: article.excerpt,
    openGraph: {
      title: `${article.title} — The Berman Brief`,
      description: article.excerpt,
      url,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      authors: ["Dr. Jennifer Berman, MD"],
      images: [
        { url: heroImage, width: 1200, height: 1500, alt: article.title },
      ],
    },
    alternates: {
      canonical: url,
    },
  };
}

function LegacyAliasPage({ alias }: { alias: LegacyPageAlias }) {
  if (alias.type === "service" && alias.serviceSlug) {
    // Legacy service URLs are duplicates of the canonical /services/<slug>/
    // page. Permanently redirect them there (308) so search engines consolidate
    // onto one URL per service. Retired services go to the services overview.
    const service = SERVICE_BY_SLUG[alias.serviceSlug];
    permanentRedirect(
      service && !service.hidden
        ? `/services/${alias.serviceSlug}/`
        : "/services/",
    );
  }

  if (alias.type === "privacy") {
    return (
      <main data-active="E">
        <PrivacyClient />
      </main>
    );
  }

  if (alias.type === "terms") {
    return (
      <main data-active="E">
        <TermsClient />
      </main>
    );
  }

  return (
    <LegacySimplePage
      title={alias.title}
      description={alias.description}
      eyebrow={
        alias.type === "media"
          ? "Media"
          : "Berman Women's Wellness"
      }
      ctaHref={alias.type === "thank-you" ? "/" : "/contact/"}
      ctaLabel={alias.type === "thank-you" ? "Return home" : "Request a consult"}
    />
  );
}

export default function MigratedArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = getArticleBySlug(params.slug);
  if (!article) {
    const alias = getLegacyPageAliasByPath(`/${params.slug}/`);
    if (!alias) notFound();
    return <LegacyAliasPage alias={alias} />;
  }

  // Show up to 8: the top-6 by relevance plus any low-traffic articles the
  // coverage pass adopts into this list (appended at slots 7-8). Displaying
  // only 6 would hide those adopted links and leave the tail orphaned.
  const related = getRelatedArticles(article.slug, 8);

  const pageUrl = article.originalUrl || `${SITE}/${article.slug}/`;
  const heroImage = article.featuredImage
    ? article.featuredImage.startsWith("http")
      ? article.featuredImage
      : `${SITE}${article.featuredImage}`
    : `${SITE}/images/dr-berman/headshot-portrait.webp`;

  const breadcrumbList = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Women's Health Blog",
        item: `${SITE}/womens-health-blog/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: pageUrl,
      },
    ],
  };

  const wordCount =
    article.wordCount || article.body.split(/\s+/).filter(Boolean).length;
  const keywords = [article.category, ...(article.tags ?? [])].join(", ");

  const blogPosting = {
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author ?? "Dr. Jennifer Berman, MD",
      url: `${SITE}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "Berman Women's Wellness",
      url: SITE,
    },
    image: heroImage,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    articleSection: article.category,
    articleBody: article.body.slice(0, 500),
    wordCount,
    keywords,
    url: pageUrl,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [breadcrumbList, blogPosting],
  };

  return (
    <main data-active="E">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleClient article={article} related={related} />
    </main>
  );
}
