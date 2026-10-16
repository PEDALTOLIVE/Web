"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import RevealLines from "@/components/ui/RevealLines";

const TOPO_IMAGE = "/images/hero-topo.svg";

// Now a full-screen hero, same cursor-following "hero-topo" spotlight as the
// homepage Hero (see home/Hero.tsx for the full rationale) — no background
// photo for now (removed per explicit request), just the dark base with the
// topo pattern revealed around the pointer.
export default function Hero() {
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
      className="relative flex h-screen min-h-[600px] flex-col items-center justify-center overflow-hidden bg-dark px-6 text-center text-light md:px-8"
    >
      {/* Topographic-line background — invisible by default, revealed only
          inside a soft circular spotlight that follows the cursor. Same two
          stacked/masked layers as the homepage Hero. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
          active ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70 blur-2xl"
          style={{
            backgroundImage: `url(${TOPO_IMAGE})`,
            WebkitMaskImage:
              "radial-gradient(circle 320px at var(--mx, 50%) var(--my, 50%), black 0%, black 40%, transparent 100%)",
            maskImage:
              "radial-gradient(circle 320px at var(--mx, 50%) var(--my, 50%), black 0%, black 40%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${TOPO_IMAGE})`,
            WebkitMaskImage:
              "radial-gradient(circle 160px at var(--mx, 50%) var(--my, 50%), black 0%, black 55%, transparent 100%)",
            maskImage:
              "radial-gradient(circle 160px at var(--mx, 50%) var(--my, 50%), black 0%, black 55%, transparent 100%)",
          }}
        />
      </div>

      {/* gap-4 (uniform 16px between every child) is gone in favor of
          per-block margins, since title→text and text→arrow now need their
          own 36px while badge→title stays at the original 16px. */}
      <div className="relative flex flex-col items-center">
        <Reveal immediate delay={0}>
          <span className="inline-block rounded-full bg-primary px-3 py-1 font-mono text-detail-s uppercase text-light">
            Guided trips
          </span>
        </Reveal>
        {/* Young Serif (font-serif) — text-h3/text-h1 (40px mobile,
            52px desktop) instead of the old sans text-[40px]/lg:text-h2,
            since those baked in a 500 weight that Young Serif doesn't
            ship (Google Fonts only serves it at 400); h3/h1 both bake in
            400, matching the same visual sizes correctly. */}
        <RevealLines
          as="h1"
          immediate
          delay={120}
          className="mt-4 max-w-2xl font-serif text-h3 lg:text-h1"
        >
          Guided trips the Pedaltolive way
        </RevealLines>
        {/* mt-9 = 36px, per explicit request (was part of the uniform
            gap-4/16px above). */}
        <RevealLines
          as="p"
          immediate
          delay={240}
          className="mt-9 max-w-xl text-body-s text-secondary"
        >
          Small-group, fully-guided bikepacking trips through the countries
          I&rsquo;ve already ridden myself: Indonesia, Thailand, Gambia,
          Colombia, Oman, Morocco, Cambodia, and more to come. Everything
          included.
        </RevealLines>
        {/* Scroll-down cue — per the attached design, now a static (no
            bounce) small orange arrow inside its own circular badge with an
            orange stroke, matching the site's other circular-icon pattern
            (e.g. the RouteKits nav buttons). mt-9 = 36px (was mt-2), per
            explicit request. */}
        <Reveal immediate delay={360} className="mt-9">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-primary">
            <img src="/images/arrow-down.svg" alt="" aria-hidden className="h-[18px] w-4" />
          </span>
        </Reveal>
      </div>
    </section>
  );
}
