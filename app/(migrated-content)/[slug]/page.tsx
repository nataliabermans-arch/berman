import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";

import {
  getAllArticles,
  getAllSlugs,
  getArticleBySlug,
} from "@/lib/journal/articles";
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
    openGraph: {
      title: alias.title,
      description: alias.description,
      url: alias.path,
      type: "website",
    },
    alternates: {
      canonical: alias.path,
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
    title: `${article.title} — The Berman Brief`,
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
    return (
      <ServiceDetailPage
        slug={alias.serviceSlug}
        canonicalPath={alias.path}
      />
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
          : "The Berman Women's Wellness Center"
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

  const allArticles = getAllArticles();
  const related = allArticles
    .filter((a) => a.category === article.category && a.slug !== article.slug)
    .slice(0, 3);

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
      name: "The Berman Women's Wellness Center",
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
