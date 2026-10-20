import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { KITS_COMING_SOON } from "@/lib/features.mjs";
import Header from "@/components/layout/Header";
import Checkout from "@/components/product-page/Checkout";
import { kits } from "@/lib/countries";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return kits.map((kit) => ({ slug: kit.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const kit = kits.find((k) => k.slug === slug);
  if (!kit) return {};
  return {
    title: `Checkout — ${kit.country} route kit — Pedaltolive`,
    description: `Complete your purchase of the ${kit.country} route kit.`,
  };
}

export default async function CheckoutPage({ params }: Props) {
  const { slug } = await params;
  const kit = kits.find((k) => k.slug === slug);
  if (!kit) notFound();
  // Kits aren't purchasable yet (see KITS_COMING_SOON).
  if (KITS_COMING_SOON) redirect("/shop-kits");

  return (
    <>
      {/* variant="light" — same light-background treatment as the rest of
          the light-variant pages. */}
      <Header variant="light" />
      <Checkout kit={kit} />
    </>
  );
}
