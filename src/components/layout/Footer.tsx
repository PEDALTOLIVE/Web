"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { placeholderImage } from "@/lib/placeholder";
import Reveal from "@/components/ui/Reveal";
import RevealLines from "@/components/ui/RevealLines";

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  // "Blind" reveal: an opaque layer the color of the page itself sits over
  // the whole footer until it's scrolled into view, then opens like a
  // roller shutter — anchored at the top (origin-top) and scaling its
  // height down to 0, so the opening edge is the bottom, sweeping upward —
  // instead of the footer just fading/sliding in like every other module.
  // Reads as the footer having been there behind the page all along, only
  // just uncovered. Resets (per explicit request) whenever the footer
  // scrolls back out of view, so leaving and returning replays the whole
  // open animation instead of it staying permanently open after the first
  // time. ease-out per explicit request.
  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setRevealed(entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px -20% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Background parallax: the photo layer drifts at a different speed than
  // the footer's own text while you scroll through it, instead of the
  // previous fixed/overlap "reveal" attempts (see layout.tsx) — this is a
  // plain in-flow footer now, so there's no risk of it ever covering
  // earlier content, but it still has a bit of motion to it.
  //
  // The bg layer is sized taller than the footer itself (see its
  // -top-[15%]/-bottom-[15%] className below) so it has room to slide
  // without ever exposing an empty edge; the translateY offset is derived
  // from how far scrolled-through the footer is (0 = just entering the
  // bottom of the viewport, 1 = fully scrolled past the top) and clamped
  // to stay within that extra 15%, so it can never run out of image.
  useEffect(() => {
    const el = footerRef.current;
    const bg = bgRef.current;
    if (!el || !bg) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId = 0;
    const update = () => {
      rafId = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Skip work while the footer is nowhere near the viewport.
      if (rect.bottom < 0 || rect.top > vh) return;
      const total = vh + rect.height;
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / total));
      const maxShift = rect.height * 0.12;
      const offset = (progress - 0.5) * 2 * maxShift;
      bg.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <footer ref={footerRef} className="relative overflow-hidden bg-dark text-light">
      {/* The blind itself — bg-neutral-100 (gray), matching the site's
          section-background gray (see RouteKits.tsx) rather than the
          page's white base, per design. z-20 keeps it above the bg photo,
          the gradient, AND the real content below, all of which are
          already fully visible/animated underneath it by the time it
          finishes opening (see each block's own Reveal/RevealLines
          above). */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-20 origin-top bg-neutral-100 transition-transform duration-[1100ms] ease-out ${
          revealed ? "scale-y-0" : "scale-y-100"
        }`}
      />
      {/* Placeholder photo — replace with public/images/footer-bg.jpg.
          Extends 15% beyond the footer's own top/bottom edges to give the
          parallax translate above room to move without exposing a gap. */}
      <div
        ref={bgRef}
        className="absolute inset-x-0 -top-[15%] -bottom-[15%] bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${placeholderImage("pedaltolive-footer", 1600, 1000)})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-dark/20" />

      {/* gap-16 (was on this flex-col, applying uniformly to every gap) is
          gone in favor of per-block margins, since the contact→title gap
          now needs to be very different from the title→copyright one:
          112px on mobile, 300px at sm+ (tablet/desktop), set directly on
          the title block below, while the title→copyright gap keeps the
          original 64px (gap-16) as its own explicit mt-16 on the last
          block. */}
      {/* px-8 (32px), no max-w-content cap — matches the convention used by
          Shop/Sponsors/GuidedTrips on the home page: the 32px is measured
          straight from the true screen edge, not from the edge of a
          centered 1280px box. Previously this div also had `mx-auto
          max-w-content`, which centered a 1280px-wide box and put the 32px
          padding *inside* that box — on any screen wider than ~1344px that
          added extra empty space beyond the 32px (e.g. ~352px total on a
          1920px screen), which is why this looked like a different, much
          bigger margin than the rest of the site. */}
      <div className="relative flex w-full flex-col px-6 py-14 md:px-8">
        {/* Email/Sponsorship columns and the "Socials" eyebrow label are
            gone — just the "Know more about me" CTA + Instagram icon,
            stacked (icon below the text, was side by side), per explicit
            request. Only Instagram remains (X removed), linking out to the
            real profile. */}
        {/* repeat — the footer sits at the very bottom of the page, so its
            fade-ins (which by default fire once and never re-observe) can
            end up looking disabled: with `repeat` each block now fades out
            when the footer scrolls out of view and replays the reveal the
            next time it scrolls back in. rootMargin loosened to -20px (was
            the site-wide default -60px) since the footer has no page
            content below it to keep scrolling into — the same -20px used by
            HowItWorks/TripsGrid just above it. */}
        <Reveal delay={0} repeat rootMargin="0px 0px -20px 0px" className="flex flex-col gap-4 font-mono text-[14px]">
          <a
            href="https://www.instagram.com/pedaltolive/#"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-fit flex-col items-start gap-4"
          >
            <span className="text-detail-m uppercase text-light transition-colors duration-300 group-hover:text-secondary">
              Know more about me
            </span>
            {/* Real Instagram glyph (uploaded asset), was a generic outline
                circle icon — per explicit request. fill="currentColor" (was
                fill="white" in the uploaded file) so it still follows
                text-light / the hover tint like every other icon here. No
                circular border box (removed per explicit request); 20px ->
                30px (+50%) to still read clearly on its own. */}
            <span className="flex shrink-0 items-center justify-center text-light transition-colors duration-300 group-hover:text-secondary">
              <svg viewBox="0 0 24 24" className="h-[30px] w-[30px]" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M4 0C1.79086 0 0 1.79086 0 4V20C0 22.2091 1.79086 24 4 24H20C22.2091 24 24 22.2091 24 20V4C24 1.79086 22.2091 0 20 0H4ZM15.2327 5.48809C14.3891 5.4496 14.1361 5.44147 12 5.44147C9.86388 5.44147 9.61088 5.4496 8.76728 5.48809C7.98732 5.52369 7.56373 5.65401 7.28183 5.76354C6.90841 5.90867 6.64188 6.08205 6.36195 6.36198C6.08202 6.64191 5.90863 6.90844 5.76354 7.28183C5.65398 7.56376 5.52366 7.98735 5.48806 8.76735C5.44957 9.61091 5.44144 9.86391 5.44144 12C5.44144 14.1361 5.44957 14.3891 5.48806 15.2327C5.52366 16.0127 5.65398 16.4363 5.76354 16.7182C5.90863 17.0916 6.08202 17.3581 6.36195 17.638C6.64188 17.918 6.90841 18.0914 7.28183 18.2365C7.56373 18.346 7.98732 18.4763 8.76731 18.5119C9.61075 18.5504 9.86375 18.5586 12 18.5586C14.1362 18.5586 14.3892 18.5504 15.2327 18.5119C16.0126 18.4763 16.4362 18.346 16.7182 18.2365C17.0916 18.0914 17.3581 17.918 17.638 17.638C17.9179 17.3581 18.0913 17.0916 18.2364 16.7182C18.346 16.4363 18.4763 16.0127 18.5119 15.2327C18.5504 14.3891 18.5585 14.1361 18.5585 12C18.5585 9.86391 18.5504 9.61091 18.5119 8.76731C18.4763 7.98735 18.346 7.56376 18.2364 7.28183C18.0913 6.90844 17.9179 6.64191 17.638 6.36198C17.3581 6.08205 17.0916 5.90867 16.7182 5.76354C16.4362 5.65401 16.0126 5.52369 15.2327 5.48809ZM8.70161 4.04814C9.5549 4.00921 9.8273 4 12 4C14.1727 4 14.4451 4.00921 15.2984 4.04814C16.1499 4.08701 16.7314 4.22223 17.2403 4.42001C17.7664 4.62445 18.2125 4.898 18.6573 5.34274C19.102 5.78748 19.3755 6.23363 19.58 6.7597C19.7778 7.26859 19.913 7.8501 19.9519 8.70164C19.9908 9.5549 20 9.82733 20 12C20 14.1727 19.9908 14.4451 19.9519 15.2984C19.913 16.1499 19.7778 16.7314 19.58 17.2403C19.3755 17.7664 19.102 18.2125 18.6573 18.6573C18.2125 19.102 17.7664 19.3756 17.2403 19.58C16.7314 19.7778 16.1499 19.913 15.2984 19.9519C14.4451 19.9908 14.1727 20 12 20C9.8273 20 9.5549 19.9908 8.70161 19.9519C7.85007 19.913 7.26856 19.7778 6.75966 19.58C6.23359 19.3756 5.78745 19.102 5.34271 18.6573C4.89797 18.2125 4.62442 17.7664 4.41997 17.2403C4.2222 16.7314 4.08698 16.1499 4.04811 15.2984C4.00918 14.4451 4 14.1727 4 12C4 9.82733 4.00918 9.5549 4.04811 8.70164C4.08698 7.8501 4.2222 7.26859 4.41997 6.7597C4.62442 6.23363 4.89797 5.78748 5.34271 5.34274C5.78745 4.898 6.23359 4.62445 6.75966 4.42001C7.26856 4.22223 7.85007 4.08701 8.70161 4.04814ZM7.89186 12C7.89186 9.73117 9.73114 7.89189 12 7.89189C14.2688 7.89189 16.1081 9.73117 16.1081 12C16.1081 14.2689 14.2688 16.1081 12 16.1081C9.73114 16.1081 7.89186 14.2689 7.89186 12ZM9.3333 12C9.3333 13.4728 10.5272 14.6667 12 14.6667C13.4727 14.6667 14.6667 13.4728 14.6667 12C14.6667 10.5273 13.4727 9.33333 12 9.33333C10.5272 9.33333 9.3333 10.5273 9.3333 12ZM16.2704 8.68961C16.8006 8.68961 17.2304 8.25979 17.2304 7.72959C17.2304 7.19939 16.8006 6.7696 16.2704 6.7696C15.7402 6.7696 15.3104 7.19939 15.3104 7.72959C15.3104 8.25979 15.7402 8.68961 16.2704 8.68961Z" />
              </svg>
            </span>
          </a>
        </Reveal>

        {/* Per explicit request, "Some roads you fly over." and "Others
            you have to ride." always sit on their own separate line —
            never sharing a row, at any breakpoint. Two independent
            RevealLines, one per sentence, each doing its own normal
            auto-measured wrapping (rather than one forced 2-line array
            for the whole phrase) is what guarantees that split without
            reintroducing the earlier bug this replaced: forcing a single
            fixed line that's wider than a narrow phone's screen used to
            get clipped by RevealLines' own overflow-hidden mask instead
            of wrapping. Each sentence here still wraps onto a second line
            by itself if it doesn't fit — it just never merges with the
            other sentence on the same line, and never overflows either.
            md:max-w-none removes the mobile width cap at desktop, where
            each full sentence has room to stay on one line, same as
            before. delay=190 on the second sentence continues the same
            stagger the single-line version used to have between its two
            forced lines (100ms + one lineDelay of 90ms). */}
        <h2 className="mt-28 font-serif text-h1 leading-[1.05] md:max-w-none md:text-display-2 sm:mt-[300px] lg:mt-[150px] max-w-3xl">
          <RevealLines as="div" delay={100} repeat rootMargin="0px 0px -20px 0px">
            Some roads you fly over.
          </RevealLines>
          <RevealLines as="div" delay={190} repeat rootMargin="0px 0px -20px 0px">
            Others you have to ride.
          </RevealLines>
        </h2>

        {/* Back to Inter Medium 16px (text-body-xs — sans is already the
            page default, so no font-* override needed) for just this row,
            per explicit request — every other footer text stays mono/14px. */}
        <Reveal delay={200} repeat rootMargin="0px 0px -20px 0px" className="mt-16 flex flex-col gap-4 border-t border-light/15 pt-6 text-body-xs text-secondary/70 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Pedaltolive. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/policy">Privacy &amp; policy</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
