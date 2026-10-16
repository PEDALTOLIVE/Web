import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import ArticleDetail from "@/components/news/ArticleDetail";
import { allArticles, getAdjacentArticles, getArticleBySlug } from "@/lib/news";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return allArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: `${article.title} — Pedaltolive`,
    description: article.description,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const { previous, next } = getAdjacentArticles(slug);

  return (
    <>
      {/* variant="light" — same light-background treatment as shop-kits,
          news, contact, policy and product-page. */}
      <Header variant="light" />
      <ArticleDetail article={article} previous={previous} next={next} />
    </>
  );
}
