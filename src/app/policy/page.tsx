import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Policy from "@/components/policy/Policy";

export const metadata: Metadata = {
  title: "Privacy policy — Pedaltolive",
  description: "How Pedaltolive collects, uses and protects your personal data.",
};

export default function PolicyPage() {
  return (
    <>
      {/* variant="light" — same light-background treatment as shop-kits,
          news and contact. */}
      {/* No <Footer /> here — the root layout (src/app/layout.tsx) already
          renders it once after every page's children, so adding it here too
          was rendering it twice. */}
      <Header variant="light" />
      <Policy />
    </>
  );
}
