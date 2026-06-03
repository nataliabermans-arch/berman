import { notFound } from "next/navigation";
import type { Metadata } from "next";

import JournalClient from "../../../journal/_journal-client";
import {
  getAllArticleSummaries,
  getArticlesByPage,
} from "@/lib/journal/articles";

export async function generateStaticParams() {
  const { totalPages } = getArticlesByPage(1);
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => ({
    page: String(index + 2),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { page: string };
}): Promise<Metadata> {
  const page = Number(params.page);
  if (!Number.isInteger(page) || page < 2) return {};

  const path = `/womens-health-blog/page/${page}/`;
  return {
    title: `Women's Health Blog — Page ${page} — Dr. Jennifer Berman`,
    description:
      "Women's health articles from Dr. Jennifer Berman on hormones, sexual health, pelvic medicine, regenerative care, and patient questions.",
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `Women's Health Blog — Page ${page} — Dr. Jennifer Berman`,
      description:
        "Women's health articles from Dr. Jennifer Berman on hormones, sexual health, pelvic medicine, regenerative care, and patient questions.",
      url: path,
      type: "website",
    },
  };
}

export default function WomensHealthBlogPageNumber({
  params,
}: {
  params: { page: string };
}) {
  const page = Number(params.page);
  if (!Number.isInteger(page) || page < 2) notFound();

  const { articles, totalPages, total } = getArticlesByPage(page);
  if (page > totalPages) notFound();

  const allSummaries = getAllArticleSummaries();

  return (
    <main data-active="E">
      <JournalClient
        pageArticles={articles}
        totalPages={totalPages}
        total={total}
        currentPage={page}
        allArticleSummaries={allSummaries}
      />
    </main>
  );
}
