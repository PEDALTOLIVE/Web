import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Hero from "@/components/shop-trips/Hero";
import TripsGrid from "@/components/shop-trips/TripsGrid";
import HowItWorks from "@/components/shop-trips/HowItWorks";

export const metadata: Metadata = {
  title: "Guided Trips — Pedaltolive",
  description:
    "Small-group, fully-guided bikepacking trips through the countries Aleix Mayor has already ridden himself. Everything included.",
};

export default function ShopTripsPage() {
  return (
    <>
      {/* Default (dark) variant — this page opens on a dark hero. */}
      <Header />
      <Hero />
      <TripsGrid />
      <HowItWorks />
    </>
  );
}
