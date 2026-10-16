import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Hero from "@/components/news/Hero";
import NewsGrid from "@/components/news/NewsGrid";

export const metadata: Metadata = {
  title: "News — Pedaltolive",
  description:
    "Trip reports, new route kits and honest lessons from the road — posted whenever there's something worth sharing.",
};

export default function NewsPage() {
  return (
    <>
      {/* variant="light" — this page's Hero has a light background, same as
          shop-kits, so the header needs dark text/logo. */}
      <Header variant="light" />
      <Hero />
      <NewsGrid />
    </>
  );
}
