import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { SHOW_GUIDED_TRIPS, SHOW_KITS } from "@/lib/features.mjs";
import Header from "@/components/layout/Header";
import KitDetail from "@/components/product-page/Detail";
import TripDetail from "@/components/shop-trips/Detail";
import { guidedTrips, kits } from "@/lib/countries";

type Props = {
  params: Promise<{ slug: string }>;
};

// Both kits and guided trips live under the same /product-page/[slug] route
// (TripsGrid.tsx already links each trip card here), so params covers both
// slug sets.
export function generateStaticParams() {
  return [
    ...kits.map((kit) => ({ slug: kit.slug })),
    ...guidedTrips.map((trip) => ({ slug: trip.slug })),
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const kit = kits.find((k) => k.slug === slug);
  if (kit) {
    return {
      title: `${kit.country} route kit — Pedaltolive`,
      description: kit.description,
    };
  }
  const trip = guidedTrips.find((t) => t.slug === slug);
  if (trip) {
    return {
      title: `${trip.title} — Pedaltolive`,
      description: trip.about,
    };
  }
  return {};
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const kit = kits.find((k) => k.slug === slug);
  if (kit) {
    if (!SHOW_KITS) redirect("/");
    return (
      <>
        {/* variant="light" — same light-background treatment as shop-kits,
            news, contact and policy. */}
        <Header variant="light" />
        <KitDetail kit={kit} />
      </>
    );
  }

  const trip = guidedTrips.find((t) => t.slug === slug);
  if (trip) {
    if (!SHOW_GUIDED_TRIPS) redirect("/");
    return (
      <>
        {/* Default (dark) Header variant — this page follows the Guided
            trips pages' own dark bg-dark/text-light treatment. */}
        <Header />
        <TripDetail trip={trip} />
      </>
    );
  }

  notFound();
}
