"use client";

import { useEffect, useState, type RefObject } from "react";

type Mode = "toggle" | "edgeGuardedReset" | "once";

interface Options {
  threshold?: number;
  rootMargin?: string;
  /**
   * "toggle" (default): the returned boolean simply mirrors
   * entry.isIntersecting, replaying every time the section scrolls back
   * into view — the pattern RouteKits/Shop/GuidedTrips/Sponsors/Contact's
   * Instagram strip all use.
   * "edgeGuardedReset": only resets to false when the section is leaving
   * through the TOP of the viewport (boundingClientRect.top >= 0) — stays
   * visible if the user keeps scrolling past it further down. TripsGrid's
   * own asymmetric behaviour.
   * "once": fires true a single time then stops observing entirely, same
   * as HowItWorks.tsx — for content that should never fade back out.
   */
  mode?: Mode;
}

/**
 * Shared "is this section visible" driver for the site's card-grid /
 * title-group modules. Takes an existing section ref (most of these
 * components already have one, used for a cursor-spotlight effect or
 * similar, and a DOM node can only take one `ref` prop) rather than
 * creating its own, and just adds this observer on top of it.
 *
 * Every one of these modules used to hand-roll an almost identical
 * IntersectionObserver effect toggling a `moduleVisible` boolean — each
 * with the same latent race: if the observed element is ALREADY inside
 * the viewport the instant `observer.observe()` runs (very common on
 * client-side navigation between pages, where a module can already be
 * on-screen the moment the new page mounts, or simply for anything
 * positioned within the first viewport height), the very first
 * IntersectionObserver callback can fire before the browser has painted
 * even a single frame of the hidden entrance state — so the first frame
 * the user's eye can actually see is already the fully-revealed end
 * state, with no motion to perceive. Reported live, repeatedly, as "the
 * reveal doesn't play" / "doesn't reset moving between pages", especially
 * on mobile (matches the same class of race already fixed for
 * RevealLines' own `immediate` trigger — see RevealLines.tsx).
 *
 * Fix: defer flipping the returned boolean by two animation frames (an
 * rAF nested inside another) every time the observer's callback fires.
 * Two real frames are guaranteed to have painted the PREVIOUS value
 * first, so the CSS transition this drives always has a real hidden
 * frame to animate from, regardless of how fast the observer resolves
 * relative to mount.
 */
export function useSectionVisible<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { threshold = 0.05, rootMargin = "0px 0px -20px 0px", mode = "toggle" }: Options = {}
) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    let raf1 = 0;
    let raf2 = 0;
    const apply = (next: boolean) => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setVisible(next));
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          apply(true);
          if (mode === "once") observer.unobserve(el);
        } else if (mode === "toggle" || (mode === "edgeGuardedReset" && entry.boundingClientRect.top >= 0)) {
          apply(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, threshold, rootMargin, mode]);

  return visible;
}
