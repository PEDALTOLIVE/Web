"use client";

import { useEffect, useRef, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in ms — pass index * 100 for items inside a grid/list. */
  delay?: number;
  /**
   * For content that's already on screen when the page loads (e.g. inside
   * the Hero). Skips the IntersectionObserver — which can miss elements
   * sitting right at the edge of the viewport, like text pinned to the
   * bottom of a full-height section — and just fades it in on mount.
   */
  immediate?: boolean;
  /**
   * IntersectionObserver threshold — how much of the element must be
   * visible before it fires. Defaults to the site-wide 0.15.
   */
  threshold?: number;
  /**
   * IntersectionObserver rootMargin — shrinks/grows the trigger area.
   * Defaults to the site-wide "0px 0px -60px 0px" (fires just before the
   * element reaches the very bottom edge). A more negative bottom value
   * pushes the trigger point further up into the viewport, so the fade
   * plays out while the element is more comfortably in view instead of
   * right at the edge.
   */
  rootMargin?: string;
  /**
   * By default a Reveal fires once and stays visible forever after. Set
   * `repeat` to instead toggle visible on/off every time the element
   * crosses the trigger point, so the fade-in plays again each time it
   * scrolls back into view.
   */
  repeat?: boolean;
  /**
   * Controlled mode: pass a boolean (from your own IntersectionObserver,
   * typically on a shared parent/section) to drive visibility directly —
   * `delay` still staggers the transition, but this Reveal no longer
   * observes itself. Use this when several Reveals need to animate/reset
   * together as a group (e.g. the whole module fading in as one, instead
   * of each element triggering independently at its own scroll position).
   */
  show?: boolean;
}

// Dynamic fade-up-on-scroll used across the whole site: elements start
// noticeably lower, slightly scaled down and transparent, then snap into
// place with a fast expo-out curve the first time they enter the viewport
// (or immediately on mount, with `immediate`). The bigger travel distance +
// scale pop + snappy easing (vs. a slow linear ease-out) is what reads as
// "dynamic" rather than a gentle drift. Runs once per element (unobserves
// after it fires) and is skipped entirely for people with
// prefers-reduced-motion set.
export default function Reveal({
  children,
  className = "",
  delay = 0,
  immediate = false,
  threshold = 0.15,
  rootMargin = "0px 0px -60px 0px",
  repeat = false,
  show,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [internalVisible, setInternalVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const controlled = show !== undefined;

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    // In controlled mode a parent drives visibility via `show` — this
    // instance doesn't observe anything itself.
    if (controlled || reducedMotion) return;

    // Double rAF, not a single one: a single rAF only guarantees "before
    // the NEXT paint" — it doesn't guarantee the hidden (opacity-0) state
    // was ever actually painted first. If this element is already in the
    // viewport the instant the observer starts (common on client-side
    // page navigation), or a same-tick microtask resolves before the
    // first paint, the very first frame the user sees can already be the
    // fully-revealed end state, with no motion to perceive. Waiting a
    // full extra frame (raf inside raf) guarantees a real hidden frame
    // was painted first, so the CSS transition always has something to
    // animate from. See RevealLines.tsx / useSectionVisible.ts for the
    // same fix applied to this same race elsewhere on the site.
    let raf1 = 0;
    let raf2 = 0;
    const apply = (next: boolean) => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setInternalVisible(next));
      });
    };

    if (immediate) {
      apply(true);
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (repeat) {
          apply(entry.isIntersecting);
        } else if (entry.isIntersecting) {
          apply(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [immediate, threshold, rootMargin, repeat, controlled, reducedMotion]);

  const visible = reducedMotion ? true : controlled ? !!show : internalVisible;

  return (
    <div
      ref={ref}
      className={`transition-all duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-10 scale-[0.96] opacity-0"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
