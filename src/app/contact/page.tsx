import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Contact from "@/components/contact/Contact";

export const metadata: Metadata = {
  title: "Contact — Pedaltolive",
  description:
    "Questions about a route kit, a guided trip, or a sponsorship idea? Send a message and Aleix Mayor will get back to you himself.",
};

export default function ContactPage() {
  return (
    <>
      {/* variant="light" — this page's hero has a light background, same as
          shop-kits/news, so the header needs dark text/logo. */}
      {/* No <Footer /> here — the root layout (src/app/layout.tsx) already
          renders it once after every page's children, so adding it here too
          was rendering it twice. */}
      <Header variant="light" />
      <Contact />
    </>
  );
}
