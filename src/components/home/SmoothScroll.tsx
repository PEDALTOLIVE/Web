"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// Per explicit request: every scroll action still gets a smooth, eased
// glide instead of moving 1:1 with the input, but simpler than the first
// pass — that one amplified the distance per scroll (wheelMultiplier/
// touchMultiplier at 1.5, a longer 1.4s duration, a custom easeOutCubic
// curve) and it ended up sliding noticeably further than intended. This
// version drops all of that: no multiplier overrides (so scroll distance
// matches the input again, 1x), a shorter, closer-to-default duration, and
// Lenis's own built-in easing (already an ease-out curve, no custom
// function to maintain) instead of a hand-picked one. Still real smoothing
// via Lenis rather than a hand-rolled loop, for the same reasons as before
// (see globals.css's scroll-behavior override next to the Lenis rules).
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
