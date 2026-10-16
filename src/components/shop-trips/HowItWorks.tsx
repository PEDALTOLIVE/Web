"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import RevealLines from "@/components/ui/RevealLines";
import { useSectionVisible } from "@/hooks/useSectionVisible";

const steps = [
  { label: "Step one", title: "Reach out", description: "Where and when." },
  { label: "Step two", title: "We plan", description: "Route, dates, group." },
  { label: "Step three", title: "Your ride", description: "Everything, handled." },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  // Fires once and stops observing — same fix as TripsGrid.tsx used to
  // need manually: the previous version set moduleVisible back to false
  // whenever this section's own intersection ratio dropped below the
  // threshold in either direction, which would have made these step
  // cards fade back out and disappear once scrolled further down toward
  // the footer. "once" mode is exactly this behaviour — see
  // useSectionVisible's own comment for the race-condition fix it now
  // also carries (reveal not playing / not resetting between pages,
  // reported live, especially on mobile).
  const moduleVisible = useSectionVisible(sectionRef, { mode: "once" });

  return (
    // bg-neutral-100 added so the white step cards actually stand out
    // against the section — previously both the section and the cards were
    // plain white/bg-light, so the cards had no visible contrast at all.
    // pb-[75px] (was pb-8/32px) — gap from the "Get in touch" button down to
    // the footer, per explicit request.
    <section ref={sectionRef} className="bg-neutral-100 px-6 pb-[75px] md:px-8">
      {/* pt-[76px] — the exact requested gap from TripsGrid's last card up
          to this title (TripsGrid no longer contributes any bottom padding
          of its own, see its pb-0). No mx-auto/max-w-content (was `mx-auto
          max-w-content`) — same fix as TripsGrid: the section's own px-8
          already gives the true 32px screen-edge margin, matching the home
          page's Shop/Sponsors convention instead of centering a 1280px box
          inside that padded area. */}
      <div className="pt-[76px]">
        <Reveal delay={0} show={moduleVisible}>
          <p className="eyebrow text-dark">Guided trips</p>
        </Reveal>
        {/* Bumped from h4 (40px) to h2 (52px) per the attached design —
            this title reads notably larger there than the rest of the
            page's h4-scale headings. mt-6 -> mt-3 (24px -> 12px) matches
            the eyebrow-to-heading gap used by the home page's own
            "Guided trips" / "Guided trips the Pedaltolive way" pairing,
            per explicit request. */}
        <RevealLines
          as="h2"
          delay={120}
          show={moduleVisible}
          className="mt-3 text-[40px] font-medium tracking-[-0.02em] text-dark lg:text-h2"
        >
          How it works
        </RevealLines>

        {/* Each step now sits in its own white card (rounded-2xl, p-8) per
            the attached design — previously plain text in a 3-column row
            with no card background. gap-6 (was gap-8) matches the tighter
            spacing measured between cards in the reference. */}
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={240 + i * 120} show={moduleVisible}>
              <div className="rounded-2xl bg-light p-8">
                <p className="font-mono text-detail-m uppercase text-dark/50">{step.label}</p>
                {/* Serif title (Young Serif, 400) — stepped down from h1
                    (52px) to h3 (40px), one size smaller, per explicit
                    request. Young Serif only ships at weight 400 (Google
                    Fonts has no lighter weight to load), so h3 shares h1's
                    own weight — this was a size reduction, not a weight
                    one. mt-6 (24px) -> mt-3.5 (14px, a 40% cut) tightens
                    the gap to the STEP ONE/TWO/THREE label above it. */}
                <RevealLines as="h3" show={moduleVisible} className="mt-3.5 font-serif text-h3 text-dark">
                  {step.title}
                </RevealLines>
                {/* text-body-l (28px/500) — was text-body-xl (32px) with
                    its weight overridden down to 400; per explicit
                    request the weight is back to its original 500 and
                    the size is reduced one step instead (32px -> 28px). */}
                <RevealLines as="p" show={moduleVisible} delay={60} className="mt-10 text-body-l text-dark/70">
                  {step.description}
                </RevealLines>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={600} show={moduleVisible} className="mt-8 w-fit">
          <Link
            href="/contact"
            className="btn-primary w-fit hover:bg-[#A9B89C] active:bg-[#657755]"
          >
            Get in touch
            <svg viewBox="0 0 12 12" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 2l4 4-4 4" />
            </svg>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
