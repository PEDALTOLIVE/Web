"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { SHOW_GUIDED_TRIPS, SHOW_KITS, SHOW_NEWS } from "@/lib/features.mjs";

type Variant = "dark" | "light";

// Full nav as designed; sections switched off in src/lib/features.mjs are
// filtered out below (and an empty "Shop" drops out entirely).
const allNavLinks = [
  { label: "Home", href: "/" },
  {
    label: "Shop",
    children: [
      { label: "Guided Trips", href: "/shop-trips" },
      { label: "Trip Kits", href: "/shop-kits" },
    ],
  },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
];

const hiddenHrefs = new Set<string>([
  ...(SHOW_GUIDED_TRIPS ? [] : ["/shop-trips"]),
  ...(SHOW_KITS ? [] : ["/shop-kits"]),
  ...(SHOW_NEWS ? [] : ["/news"]),
]);

const navLinks = allNavLinks
  .map((link) =>
    link.children
      ? { ...link, children: link.children.filter((c) => !hiddenHrefs.has(c.href)) }
      : link
  )
  .filter((link) => (link.children ? link.children.length > 0 : !link.href || !hiddenHrefs.has(link.href)));

// `variant` lets pages with a light background pass variant="light" so both
// the top bar and the full-screen mobile menu switch to dark-on-light. Home's
// hero is dark, so that stays the default.
export default function Header({ variant = "dark" }: { variant?: Variant }) {
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Starts true (was false) — per explicit request, the mobile menu's Shop
  // sub-menu is expanded by default instead of collapsed.
  const [mobileShopOpen, setMobileShopOpen] = useState(true);
  const shopRef = useRef<HTMLDivElement>(null);

  // "top" — within the first 80px, header stays in its original plain
  // look (no pill), overlapping the hero as before. "up" — scrolled past
  // 80px and the user is scrolling up: the header reappears with the
  // translucent pill background per the attached design, so it's reachable
  // without scrolling all the way back to the top. "down" — scrolled past
  // 80px and still scrolling down: header slides out of view. Runs on every
  // page since Header is shared, per explicit request.
  const [scrollState, setScrollState] = useState<"top" | "up" | "down">("top");
  const lastY = useRef(0);

  useEffect(() => {
    const TOP_THRESHOLD = 80;
    const initY = window.scrollY;
    lastY.current = initY;
    setScrollState(initY < TOP_THRESHOLD ? "top" : "down");

    let rafId = 0;
    const update = () => {
      rafId = 0;
      const y = window.scrollY;
      if (y < TOP_THRESHOLD) {
        setScrollState("top");
      } else if (y < lastY.current) {
        setScrollState("up");
      } else if (y > lastY.current) {
        setScrollState("down");
      }
      lastY.current = y;
    };
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!shopOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) setShopOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [shopOpen]);

  // Lock page scroll while the full-screen mobile menu is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Reset the inline Shop sub-menu back to its default *open* state (was
  // false/collapsed) whenever the mobile menu is closed, so it starts
  // expanded again the next time the menu opens — per explicit request.
  useEffect(() => {
    if (!mobileOpen) setMobileShopOpen(true);
  }, [mobileOpen]);

  const isDark = variant === "dark";
  const headerText = isDark ? "text-light" : "text-dark";
  // The logo files are named after their own ink color, not the page: the
  // white lockup goes on dark backgrounds, the dark lockup on light ones.
  const logoSrc = isDark ? "/images/logo-light.svg" : "/images/logo-dark.svg";

  const overlayBg = isDark ? "bg-dark" : "bg-light";
  const overlayText = isDark ? "text-light" : "text-dark";
  const overlayDivider = isDark ? "border-light/15" : "border-dark/10";
  const overlaySubText = isDark ? "text-light/60" : "text-dark/50";

  // Pill styling for the floating scrolled-up state — white on every page
  // (was black-at-10% on light-variant pages; corrected per explicit
  // request: light-background pages now get a white box with black text,
  // which happens to match what dark-variant pages already had, so this is
  // no longer conditional on isDark). Opacity bumped from 10% to 40% (+30
  // points) per explicit request — was too faint to read as a distinct box
  // on light-variant pages.
  const showPill = scrollState === "up";
  const pillBg = "bg-light/40";
  // Always #1B1F1A (text-dark) while the pill is showing, on every page —
  // was briefly forced to white per an earlier request, then corrected: now
  // explicitly dark regardless of page variant (was tracking isDark/
  // headerText before that, which could render dark-on-dark on light-
  // variant pages). The Shop flyout sub-menu keeps its own isDark-based
  // background/text pairing below, unaffected.
  const pillText = "text-dark";

  return (
    // Was `absolute` (scrolled away with the page, only ever visible over
    // the hero). Now `fixed` so it can be a real scroll-aware floating nav:
    // -translate-y-full hides it while scrolling down past the first 80px,
    // per explicit request; it reappears (with the pill background applied
    // to the Reveal row below) the moment the user scrolls up again.
    <header
      id="site-header"
      // pointer-events-none on the full-width fixed bar itself, re-enabled
      // only on the real controls (nav, links, buttons): the bar's empty
      // area used to sit invisibly on top of whatever was under it and
      // swallow clicks — e.g. most of the globe country card's close button.
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 transition-transform duration-300 [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_nav]:pointer-events-auto ${headerText} ${
        scrollState === "down" ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* No extra transition-* classes here — this reuses Reveal's own
          `transition-all duration-700 ease-out` (already in its base
          className) to animate the pill's background/margin/radius/padding
          too, instead of fighting it with a second, conflicting duration.
          h-[73px] dropped in pill mode (was a fixed height sized for the
          logo) in favor of px-6 py-[18px] (24px sides, 18px top/bottom —
          2px less than the previous 20px, per a further explicit request)
          — the pill is now sized by its own content + padding instead of a
          fixed row height. w-fit + mx-auto (was mx-4, which just inset a still-
          full-width box) — per explicit request the pill now hugs its own
          links instead of spanning the page, centered under the fixed
          header. gap-8 matches the nav's own internal link spacing so
          mobile's hugged row (now the same all-links layout as desktop,
          see the nav below) isn't jammed together either. pillText forces
          dark (#1B1F1A) text on every descendant that doesn't set its own
          color (e.g. the Shop toggle, whose chevron uses currentColor). */}
      <Reveal
        immediate
        delay={0}
        className={`flex items-center ${
          showPill
            ? `relative mx-auto mt-3 w-fit flex-wrap justify-center gap-8 px-6 py-[18px] ${pillText}`
            : "h-[73px] justify-between px-6 md:px-8"
        }`}
      >
        {/* Frosted pill background as its own absolutely-positioned layer
            (was bg-light/40 + backdrop-blur-md directly on this flex row,
            the same row that contains the Shop dropdown further down as a
            DOM descendant). Two nested backdrop-filter elements — this row
            AND the dropdown's own boxes — is a known cross-browser
            compositing bug: the descendant's blur can silently fail to
            render (Safari included) even though its computed style still
            reports the filter as applied. Splitting the pill's own frosted
            look into this separate sibling layer means the Shop dropdown is
            no longer nested inside any backdrop-filter ancestor at all, so
            its own blur renders correctly everywhere, per explicit request
            after the previous isolate-only fix still wasn't visible.
            -z-10 keeps it behind this row's own links/logo/button. */}
        {showPill && (
          <div aria-hidden className={`absolute inset-0 -z-10 rounded-2xl backdrop-blur-md ${pillBg}`} />
        )}

        {/* Logo — hidden entirely while the pill is showing, on mobile too
            (was md:hidden only, leaving the logo + burger button on mobile;
            per explicit request mobile's scroll-pill now matches desktop:
            a plain "Home" link takes its place in the nav below instead).
            Still visible at the top of the page (not showPill), where the
            row keeps its original logo + Menu/Close layout. */}
        <Link href="/" className={`items-center ${showPill ? "hidden" : "flex"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="Pedaltolive" className="h-8 w-auto sm:h-9" />
        </Link>

        {/* flex (was hidden md:flex) once the pill is showing — per explicit
            request, the mobile scroll-pill now shows the same all-links row
            as desktop instead of collapsing to a separate burger menu;
            flex-wrap on the Reveal above lets it wrap to a second line on
            narrow screens rather than overflow. Reverts to hidden md:flex
            at the top of the page, unchanged. */}
        <nav className={`items-center gap-8 ${showPill ? "flex flex-wrap justify-center" : "hidden md:flex"}`}>
          {/* Home stays out of the normal top nav (the logo already links
              there), but joins the row once the pill is showing and the
              logo is hidden, so every link sits inline together as one
              flat row per explicit request. */}
          {(showPill ? navLinks : navLinks.filter((link) => link.label !== "Home")).map((link) =>
              link.children ? (
                // onMouseLeave closes the Shop tab automatically once the
                // cursor leaves it (button + its flyout) — per explicit
                // request, applies in both the top-bar and scroll-pill
                // states since they share this same markup.
                <div
                  key={link.label}
                  ref={shopRef}
                  className="relative"
                  onMouseLeave={() => setShopOpen(false)}
                >
                  <button
                    onClick={() => setShopOpen((v) => !v)}
                    className="group flex items-center gap-1 font-mono text-detail-m uppercase"
                  >
                    {/* Hover underline: grows in from the left (origin-left
                        while hovered), and on mouse-leave collapses back
                        toward the right (origin-right, the default/rest
                        state) so it visually sweeps away left-to-right too,
                        instead of retreating the way it came. ease-out on
                        both directions per explicit request. */}
                    <span className="relative inline-block">
                      {link.label}
                      <span className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-px origin-right scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:origin-left group-hover:scale-x-100" />
                    </span>
                    <svg
                      viewBox="0 0 12 12"
                      className={`h-3 w-3 transition-transform ${shopOpen ? "rotate-180" : ""}`}
                      fill="currentColor"
                    >
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" fill="none" />
                    </svg>
                  </button>
                  {/* will-change-[backdrop-filter] previously added here to
                      fix a late-blur-pop-in quirk ended up breaking the
                      boxes' backdrop-blur entirely in real testing — removed
                      per explicit request; the boxes are blurred again, at
                      the cost of that same minor pop-in on open. Always
                      mounted so opening/closing fades instead of popping
                      instantly. pt-[22px] while the pill is showing (18px of
                      that is the pill's own bottom padding, which this
                      absolutely-positioned dropdown sits underneath and so
                      doesn't inherit — the remaining 4px is the actual gap
                      from the pill's visible edge, per explicit request);
                      pt-4 unchanged in the plain top-bar state, which has no
                      such padding to clear. */}
                  {/* gap-1 (4px) only while the pill is showing (was gap-2
                      /8px in every state) — per explicit request, the
                      plain top-bar state keeps its original 8px gap. */}
                  <div
                    className={`absolute left-0 top-full flex w-44 flex-col transition-all duration-200 ${
                      showPill ? "gap-1 pt-[22px]" : "gap-2 pt-4"
                    } ${
                      shopOpen
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none -translate-y-1 opacity-0"
                    }`}
                  >
                    {/* border removed (was border border-light/40, a visible
                        stroke around every box) and the label color no
                        longer hardcoded to text-dark — it now follows the
                        exact same color the rest of the menu's own text
                        uses in each state (pillText while the pill is
                        showing, headerText otherwise, so it still varies
                        with the page's variant) — both per explicit
                        request. Note: on a dark-variant page's plain top-bar
                        state, this now puts text-light text on the
                        light-tinted bg-light/25 box below, which reads with
                        less contrast than the previous always-dark text did
                        — flagged here in case that combination needs
                        revisiting. backdrop-blur-md (matching the scroll-menu pill's own blur, see its bg layer above) + the box's own
                        background/hover tint (bg-light/40 while the pill is
                        showing, isDark-based otherwise) and shadow-sm are
                        unchanged — a backdrop blur is only visible where
                        there's real contrast directly behind it, so the
                        shadow is what keeps the box reading as a distinct
                        surface over this site's own flat backgrounds. */}
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setShopOpen(false)}
                        className={`isolate rounded-lg px-4 py-2.5 text-left font-mono text-detail-m uppercase shadow-sm backdrop-blur-md transition-colors duration-300 ${
                          showPill ? pillText : headerText
                        } ${
                          showPill
                            ? "bg-light/40 hover:bg-light/50"
                            : isDark
                              ? "bg-light/25 hover:bg-light/35"
                              : "bg-dark/15 hover:bg-dark/25"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative inline-block font-mono text-detail-m uppercase"
                >
                  {link.label}
                  {/* Same grow-in-from-left / sweep-away-to-the-right
                      underline as the Shop trigger above. */}
                  <span className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-px origin-right scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:origin-left group-hover:scale-x-100" />
                </Link>
              )
            )}
        </nav>

        {/* Mobile trigger — text label instead of a hamburger icon, matching
            the Figma spec: "MENU" collapsed, "CLOSE" while the full-screen
            overlay is open. Hidden while the pill is showing (mobile then
            shows the full link row directly, like desktop, so there's
            nothing left for this button to open). */}
        <button
          className={`font-mono text-detail-m uppercase md:hidden ${showPill ? "hidden" : ""}`}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </Reveal>

      {/* Full-screen mobile menu — covers 100% of the viewport, themed dark
          or light to match the header/page it was opened from. Always
          mounted (instead of conditionally rendered) so open/close fades
          rather than popping instantly. */}
      <div
        aria-hidden={!mobileOpen}
        className={`fixed inset-0 z-[100] flex h-[100dvh] w-full flex-col ${overlayBg} ${overlayText} transition-opacity duration-300 md:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
          <div className="flex h-[73px] flex-none items-center justify-between px-6">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} alt="Pedaltolive" className="h-8 w-auto" />
            </Link>
            <button
              className="font-mono text-detail-m uppercase"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              Close
            </button>
          </div>

          <nav className="flex flex-1 flex-col overflow-y-auto px-6 pt-4">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className={`border-b ${overlayDivider} py-5`}>
                  <button
                    onClick={() => setMobileShopOpen((v) => !v)}
                    className="flex w-full items-center justify-between font-sans text-h4"
                  >
                    {link.label}
                    <svg
                      viewBox="0 0 16 16"
                      className={`h-6 w-6 flex-none transition-transform ${mobileShopOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 6l4 4 4-4" />
                    </svg>
                  </button>
                  {/* Always mounted, expands/fades instead of popping. */}
                  <div
                    className={`flex flex-col gap-4 overflow-hidden transition-all duration-300 ${
                      mobileShopOpen ? "mt-4 max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className={`text-body-l ${overlaySubText}`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`border-b ${overlayDivider} py-5 font-sans text-h4`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </div>
    </header>
  );
}
