"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import RevealLines from "@/components/ui/RevealLines";

const TOPO_IMAGE = "/images/hero-topo.svg";
// Pre-blurred raster of the same pattern for the spotlight's soft "halo"
// layer. Replaces a live CSS blur(40px) on a full-screen layer, which older
// Macs/Safari had to re-render on every mouse move (very slow there).
const TOPO_BLUR_IMAGE = "/images/hero-topo-blur.webp";
const HERO_VIDEO = "/videos/hero.mp4";
const HERO_POSTER = "/videos/hero-poster.jpg";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  // Track the cursor so the topo background can be revealed in a circular
  // spotlight around it. The mask doesn't snap straight to the pointer —
  // a requestAnimationFrame loop eases the rendered position toward the
  // real one every frame (like the trailing cursor on tbwahakuhodo.co.jp),
  // which is what gives it that fluid, slightly-lagging "chase" feel.
  // Position is written straight to CSS custom properties on the section
  // (no React state per frame), so this runs at full frame rate without
  // re-rendering.
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
    const ease = 0.1;
    const tick = () => {
      current.x += (target.x - current.x) * ease;
      current.y += (target.y - current.y) * ease;
      el.style.setProperty("--mx", `${current.x}px`);
      el.style.setProperty("--my", `${current.y}px`);
      rafId = requestAnimationFrame(tick);
    };
    // Only runs while actively hovered — this used to call
    // requestAnimationFrame(tick) unconditionally right here on mount,
    // meaning every section with this cursor spotlight (Hero, Route kits,
    // Guided trips, Shop, Sponsors — five of them, all mounted at once on
    // the home page) kept its own chase-easing loop running forever,
    // whether or not anyone was ever hovering it or it was even on
    // screen. That's several perpetual per-frame loops permanently
    // competing for the same frame budget as everything else on the page,
    // including the module-to-module scroll glide — which is exactly
    // where that extra, mostly-wasted cost showed up as visible stutter
    // during the glide itself. Starting/stopping it on hover removes that
    // cost entirely for the (very common) case of nobody hovering a given
    // section right now.
    const handleEnter = () => {
      setActive(true);
      if (!rafId) rafId = requestAnimationFrame(tick);
    };
    const handleLeave = () => {
      setActive(false);
      cancelAnimationFrame(rafId);
      rafId = 0;
    };

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
      id="home-hero"
      // h-screen (100vh, a fixed unit sized to the LARGEST possible
      // viewport) was the bug behind the "Book your trip" button getting
      // cut off at the bottom on mobile Safari/Chrome: on first load, with
      // the address bar and bottom toolbar both still showing, the actual
      // visible area is shorter than 100vh, so the bottom row of content
      // sits underneath that browser chrome instead of inside the visible
      // screen. h-dvh (100dvh, the *dynamic* viewport height) tracks the
      // real, currently-visible viewport instead, so this section — and
      // everything pinned to its bottom edge — always fits inside what the
      // user can actually see, toolbar or no toolbar. Per explicit request.
      className="relative flex h-dvh min-h-[600px] flex-col overflow-hidden bg-dark text-light"
    >
      {/* Background video — bottom-most layer, underneath the hero-topo
          spotlight below (per explicit request). Muted + playsInline so
          mobile browsers allow autoplay; the poster shows instantly while
          the clip buffers. The source clip is vertical, so object-cover
          crops it to a band on wide screens — object-position keeps the
          rider (around the middle of the frame) in view. A dark overlay
          on top keeps the title and button readable over bright desert. */}
      <video
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "center 55%" }}
        src={HERO_VIDEO}
        poster={HERO_POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-dark/55" />

      {/* Topographic-line background — invisible by default, revealed only
          inside a soft circular spotlight that follows the cursor. Two
          stacked copies of the same image, each masked with a radial
          gradient pinned to the pointer via --mx/--my: a wider blurred
          "halo" layer plus a smaller crisp inner layer. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
          active ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{
            backgroundImage: `url(${TOPO_BLUR_IMAGE})`,
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

      {/* Main content — centered in the space left between the header and
          the bottom row, so everything fits on one screen at any device
          height/width instead of relying on a fixed pixel height. */}
      <div className="relative flex w-full flex-1 flex-col justify-center gap-[8px] px-6 pt-24 sm:gap-0 md:px-8 md:pt-28">
        {/* Mobile doubled per explicit request — from 80px (double the
            last flat size that was confirmed to fit on one line, 40px),
            not from the width-fitted clamp() formula that was here a
            moment ago: that formula was specifically calibrated to keep
            "Pedal to Live" on a single line without overflowing, so
            doubling its output would just overflow/clip again the same
            way the flat px values before it did. Instead, whitespace-
            nowrap is dropped on mobile so the line can wrap onto two
            (the serif at this size no longer fits in one line on a phone
            width, by design) — safe by construction, no fitting math
            needed. sm+ keeps the original single-line sizing and its own
            whitespace-nowrap, unchanged: 64px from sm up, 102.4px from
            lg up.
            RevealLines (not plain Reveal) so the title slides in line by
            line out of a mask — per explicit site-wide request. Mobile
            naturally gets 2 lines since it wraps here; sm+ stays 1. */}
        <RevealLines
          as="h1"
          immediate
          delay={0}
          className="font-serif text-[80px] leading-none sm:whitespace-nowrap sm:text-[64px] lg:text-[102.4px]"
        >
          Pedal to Live
        </RevealLines>
        {/* Swapped with the CTA button, which now lives in the bottom row
            instead — per explicit request. Mobile now carries an explicit
            8px gap (via the parent flex's gap-[8px]) back per a later
            explicit request; sm+ keeps gap-0 (no separation), as set when
            the gap was first removed entirely. Manually broken onto two
            lines after "for" (rather than left to wrap wherever max-w-xl
            happens to cut it). 8px smaller on mobile (16px, was a flat
            24px/text-body-m) per explicit request; sm+ keeps the original
            24px. */}
        <RevealLines
          as="p"
          immediate
          delay={120}
          className="max-w-xl text-[16px] font-medium leading-[1.4] text-light sm:text-body-m"
        >
          {["Discover bikepacking journeys made for", "those who want to go further."]}
        </RevealLines>
      </div>

      {/* Bottom row — part of the normal flow (not absolutely positioned),
          so it always lands inside the viewport and stacks on narrow screens
          instead of overflowing. */}
      <div className="relative flex w-full flex-col gap-3 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between sm:pb-8 md:px-8">
        <Reveal immediate delay={360} className="w-fit">
          {/* Swapped with the "Discover bikepacking..." text, which now
              lives under the title instead — per explicit request.
              `btn-outline`'s default fill (bg-light/10) is nearly
              transparent, which is fine against a plain dark background but
              let the topo spotlight lines glow right through and sit behind
              the label here — a backdrop blur plus a more opaque dark fill
              keeps the button readable wherever the cursor-following topo
              pattern happens to be underneath it. The original hover state
              (bg-light/10 -> bg-light/20) was a subtle brighten that read
              fine against a fully transparent button, but against this
              darker fill the same two-dark-shades change was barely
              perceptible — so hover now swaps to a solid primary fill
              instead, which both reads as an obvious, clearly-interactive
              state change and (being fully opaque) blocks the topo lines
              completely too. */}
          <a
            href="/shop-trips"
            className="btn-outline w-fit !bg-dark/60 backdrop-blur-md hover:!border-primary hover:!bg-primary hover:!text-dark"
          >
            Book your trip
            <svg viewBox="0 0 12 12" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 2l4 4-4 4" />
            </svg>
          </a>
        </Reveal>
        <Reveal immediate delay={420} className="hidden sm:block">
          <div className="flex items-center gap-2 text-detail-s text-secondary/80">
            <svg viewBox="0 0 24 24" className="h-4 w-4 animate-bounce" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 4v16m0 0l-5-5m5 5l5-5" />
            </svg>
            Scroll to discover
          </div>
        </Reveal>
      </div>
    </section>
  );
}
