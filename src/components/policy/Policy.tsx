"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";
import RevealLines from "@/components/ui/RevealLines";

const TOPO_IMAGE = "/images/hover-topo2.svg";

// Fixed tile size for the topo background — repeated (not scaled to
// cover) so a single consistent pattern density tiles across the whole
// section instead of one image stretching/growing to fit it, and so it
// reaches every edge (including behind the header and any boxes on top)
// with no gaps, per explicit request.
const TOPO_TILE_SIZE = "1092px"; // 910px + 20% further, per explicit request

type Section = {
  heading: string;
  body: ReactNode;
};

// Static legal copy — content as given, only the two unbracketed fields
// (the controller's name and the contact email) filled in with real site
// values; everything else reproduced as-is.
const sections: Section[] = [
  {
    heading: "Data Controller",
    body: (
      <>
        <p>
          In compliance with Regulation (EU) 2016/679 (GDPR) and Organic Law
          3/2018 (LOPDGDD), users are informed that personal data provided
          through this website will be processed by:
        </p>
        <p className="mt-2 font-medium text-dark">Aleix Mayor — Pedaltolive</p>
      </>
    ),
  },
  {
    heading: "Purpose of Processing",
    body: (
      <>
        <p>
          The personal data you provide through the contact form will be
          used solely to:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Respond to your inquiries.</li>
          <li>Manage requests for information or first-session bookings.</li>
          <li>Maintain communications related to the services requested.</li>
        </ul>
        <p className="mt-3">
          Your data will not be used for other purposes without your prior
          consent.
        </p>
      </>
    ),
  },
  {
    heading: "Legal Basis",
    body: (
      <p>
        The legal basis for processing your data is the consent you give by
        submitting the contact form and accepting this Privacy Policy.
      </p>
    ),
  },
  {
    heading: "Data Retention",
    body: (
      <p>
        Data will be retained for as long as necessary to handle your
        request and, where a professional relationship exists, for the
        periods legally established.
      </p>
    ),
  },
  {
    heading: "Recipients",
    body: (
      <p>
        Your data will not be shared with third parties, except where
        legally required or necessary for the proper provision of the
        service.
      </p>
    ),
  },
  {
    heading: "Your Rights",
    body: (
      <>
        <p>You may exercise your rights at any time, including:</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Access</li>
          <li>Rectification</li>
          <li>Erasure</li>
          <li>Objection</li>
          <li>Restriction of processing</li>
          <li>Portability</li>
        </ul>
        <p className="mt-3">To do so, you can write to:</p>
        <a href="mailto:hello@pedaltolive.com" className="mt-1 block underline">
          hello@pedaltolive.com
        </a>
        <p className="mt-3">
          You also have the right to file a complaint with the Spanish Data
          Protection Agency (AEPD) if you believe the processing of your
          data does not comply with current regulations.
        </p>
      </>
    ),
  },
];

// Same light bg-neutral-100 + cursor-following "hover-topo2" spotlight used
// on every other light-variant page (shop-kits, news, contact), for
// consistency, even though this page is plain text rather than a hero.
export default function Policy() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let initialized = false;
    let rafId = 0;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
      if (!initialized) {
        current.x = target.x;
        current.y = target.y;
        initialized = true;
      }
    };
    const handleEnter = () => setActive(true);
    const handleLeave = () => setActive(false);

    const ease = 0.1;
    const tick = () => {
      current.x += (target.x - current.x) * ease;
      current.y += (target.y - current.y) * ease;
      el.style.setProperty("--mx", `${current.x}px`);
      el.style.setProperty("--my", `${current.y}px`);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseenter", handleEnter);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseenter", handleEnter);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-neutral-100 px-6 pb-24 pt-24 text-dark md:px-8 md:pt-28"
    >
      {/* Topographic-line background — same cursor-following spotlight as
          the other light-variant pages, sitting behind everything else. */}
      {/* Always-visible faint base layer — was ONLY revealed inside the
          cursor spotlight below, which (per explicit request, backed by a
          screenshot) left most of the page showing no pattern at all
          whenever the cursor wasn't right there. This low-opacity, unmasked
          copy keeps the topo texture visible across the entire section at
          all times; the spotlight layers below still add a stronger,
          sharper reveal right around the cursor on top of it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-center opacity-[0.15]"
        style={{
          backgroundImage: `url(${TOPO_IMAGE})`,
          backgroundRepeat: "repeat",
          backgroundSize: TOPO_TILE_SIZE,
        }}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 ${
          active ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-center opacity-70 blur-2xl"
          style={{
            backgroundImage: `url(${TOPO_IMAGE})`,
            backgroundRepeat: "repeat",
            backgroundSize: TOPO_TILE_SIZE,
            WebkitMaskImage:
              "radial-gradient(circle 320px at var(--mx, 50%) var(--my, 50%), black 0%, black 40%, transparent 100%)",
            maskImage:
              "radial-gradient(circle 320px at var(--mx, 50%) var(--my, 50%), black 0%, black 40%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 bg-center"
          style={{
            backgroundImage: `url(${TOPO_IMAGE})`,
            backgroundRepeat: "repeat",
            backgroundSize: TOPO_TILE_SIZE,
            WebkitMaskImage:
              "radial-gradient(circle 160px at var(--mx, 50%) var(--my, 50%), black 0%, black 55%, transparent 100%)",
            maskImage:
              "radial-gradient(circle 160px at var(--mx, 50%) var(--my, 50%), black 0%, black 55%, transparent 100%)",
          }}
        />
      </div>

      {/* w-full (was max-w-lg, i.e. 512px at every breakpoint) so this
          fills the whole available width on tablet/mobile per explicit
          request; lg:max-w-[800px] then caps it at exactly 800px on
          desktop only. */}
      <div className="relative z-10 w-full lg:max-w-[800px]">
        {/* Sized at the base text-h1 (52px) — no lg:text-display-2
            escalation like the other pages' hero titles, since this is a
            dense document page rather than a hero moment. */}
        <RevealLines as="h1" immediate delay={0} className="font-serif text-h1">
          Privacy policy
        </RevealLines>
        <RevealLines as="p" immediate delay={80} className="mt-3 text-body-xs text-dark/50">
          Last updated: September 17, 2026
        </RevealLines>

        <div className="mt-10 flex flex-col">
          {sections.map((section, i) => (
            <Reveal
              key={section.heading}
              delay={120 + i * 60}
              // border-t (not border-b) so the divider sits *between*
              // sections without adding one above the first or below the
              // last, matching the attached design.
              className={i === 0 ? "pb-8" : "border-t border-dark/10 py-8"}
            >
              <h2 className="text-body-m font-medium text-dark">{section.heading}</h2>
              <div className="mt-3 text-body-s text-dark/70">{section.body}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
