"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import dynamic from "next/dynamic";
import type { CountryTrip } from "@/lib/countries";

// The globe is pure WebGL (three.js / react-three-fiber) — it must never run
// during SSR/RSC rendering, which is what triggers the well-known
// "ReactCurrentOwner" crash when a Canvas ends up in the server render path
// under Next.js App Router. ssr: false forces it to mount client-only.
const Globe = dynamic(() => import("@/components/home/Globe"), { ssr: false });

const LINES = [
  "For nearly 12 years, my job has kept me in the air.",
  "Off duty, I leave the plane behind",
  "and get on two wheels.",
  "Road, gravel, mountain, self-supported, no plan B.",
  "What started as an Instagram page",
  "has grown into Pedaltolive:",
  "Talks, sponsors, and a community",
  "that follows every mile.",
];

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// A gentler cousin of smoothstep (Perlin's "smootherstep"): zero velocity
// *and* zero acceleration at both ends, so the start and end of a fade feel
// soft instead of catching the eye — used for the stage1 → stage2 crossfade,
// which was feeling a bit abrupt with plain smoothstep.
function smootherstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

// Same fade-up language as the Hero's <Reveal>: opacity plus a small lift,
// just driven by scroll progress instead of an IntersectionObserver.
function applyFade(el: HTMLElement | null, opacity: number, distance = 22) {
  if (!el) return;
  el.style.opacity = String(opacity);
  el.style.transform = `translateY(${(1 - opacity) * distance}px)`;
}

type Star = {
  left: number;
  top: number;
  size: number;
  opMax: number;
  opMin: number;
  duration: number;
  delay: number;
};

// Deterministic PRNG (mulberry32) instead of Math.random(): this component
// is server-rendered then hydrated, and Math.random() would draw different
// star layouts on the server vs. the client, which React's hydration flags
// as a mismatch (attributes that "don't match" between SSR HTML and the
// client render). Seeding it fixed makes every render — server and client
// alike — produce the exact same "random-looking" layout.
function mulberry32(seed: number) {
  let t = seed;
  return function rand() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Full-bleed background starfield for the whole scrollytelling module — a
// plain CSS layer (not the WebGL Stars inside Globe.tsx, which only cover
// the small globe canvas itself) so the sky reads as one continuous
// backdrop behind the text *and* the globe, in every stage, instead of
// stars only existing in the little square around the sphere. Generated
// once (useMemo, empty deps) so positions don't reshuffle on re-render.
function generateStars(count: number): Star[] {
  const rand = mulberry32(1337);
  return Array.from({ length: count }, () => {
    const opMax = 0.25 + rand() * 0.55;
    return {
      left: rand() * 100,
      top: rand() * 100,
      size: 1 + rand() * 1.6,
      opMax,
      opMin: opMax * 0.3,
      duration: 3 + rand() * 5,
      delay: rand() * -8, // negative delay so they're mid-twinkle from first paint
    };
  });
}

// "About" and the world map used to be two separate sections; now they're
// one pinned scrollytelling module: the section is 5 screens tall, but its
// content stays fixed in the viewport (position: sticky) while the text
// (and the globe itself) crossfade through three beats as the user scrolls
// through that height — most of it spent on the middle "reading" beat, so
// the line-by-line reveal keeps pace with someone actually reading it.
// Everything here is driven by scroll position, not by React state, so it
// stays smooth — state is only used for which country card is open, which
// changes rarely.
export default function AboutWorld() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const stage1Ref = useRef<HTMLDivElement>(null);
  const stage2Ref = useRef<HTMLDivElement>(null);
  const stage3Ref = useRef<HTMLDivElement>(null);
  const globeSizeRef = useRef<HTMLDivElement>(null);
  // 0 (stage 1/2 rest) -> 1 (stage 3, fully grown), read every frame by
  // Globe's own render loop to dolly its camera — see the size comment
  // inside the scroll `update()` effect below for why this replaced the
  // old CSS-width growth.
  const globeZoomRef = useRef(0);
  const lineRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const interactiveRef = useRef(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const globeDraggingRef = useRef(false);
  const hoveringPointRef = useRef(false);

  const [active, setActive] = useState<CountryTrip | null>(null);
  // Keeps rendering the last-selected trip's content while the panel below
  // fades out, instead of the content popping out instantly with `active`
  // going straight to null (the panel itself stays mounted at all times so
  // its open/close is a transition, not a mount/unmount).
  const [displayActive, setDisplayActive] = useState<CountryTrip | null>(null);
  const [interactive, setInteractive] = useState(false);
  const stars = useMemo(() => generateStars(190), []);

  useEffect(() => {
    if (active) setDisplayActive(active);
  }, [active]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;

      // How much of the section has scrolled into view *before* it pins —
      // fades the globe up gently, same as the Hero, instead of the content
      // just snapping into place the instant it sticks.
      const entrance = rect.top > 0 ? Math.min(1, Math.max(0, 1 - rect.top / (vh * 0.6))) : 1;
      // The headline text waits for the globe to be mostly in already, so the
      // two never appear as one simultaneous block — the globe reads first,
      // then the words follow it in.
      const textEntrance = smoothstep(0.45, 1, entrance);

      // Each beat now gets its own clean in/out window with a short silent
      // gap before the next one starts, so one piece of text is always fully
      // gone before the next fades in instead of the two crossfading over
      // each other. The section is still 500vh tall, so the reading beat
      // (stage 2) keeps its generous ~300vh window for the 8 lines. The
      // stage1 → stage2 crossfade specifically uses the gentler
      // smootherstep curve, and a slightly wider window, so it reads as a
      // soft dissolve rather than a brisk cut.
      const stage1 = textEntrance * (1 - smootherstep(0, 0.09, p));
      const stage2 = smootherstep(0.12, 0.19, p) * (1 - smoothstep(0.75, 0.8, p));
      const stage3 = smoothstep(0.83, 0.88, p);

      applyFade(stage1Ref.current, stage1, 16);
      applyFade(stage2Ref.current, stage2, 16);
      applyFade(stage3Ref.current, stage3);
      if (globeSizeRef.current) {
        globeSizeRef.current.style.opacity = String(entrance);
        globeSizeRef.current.style.transform = `translateY(${(1 - entrance) * 22}px)`;
      }
      // The globe's own container no longer changes CSS size at all — it
      // used to grow via a --gscale custom property, but resizing a WebGL
      // canvas is a discrete, non-interpolatable operation (a fresh
      // resolution, a fresh framebuffer each time), so no matter how
      // smoothly that CSS value changed, the rendered globe could only
      // ever snap between whatever sizes the browser's resize-observer
      // happened to report — reading as a sudden jump rather than a
      // gradual grow, and, since the canvas isn't centered inside its own
      // (already-resized) container while it catches up, briefly
      // off-center too. `globeZoomRef` instead drives a camera dolly-zoom
      // inside Globe's own render loop (see Globe.tsx), which re-projects
      // the same fixed-size canvas fresh every frame — a continuous
      // number, nothing to reallocate, so it reads as an actual smooth
      // "inflate" and stays centered throughout.
      // It still rides its own wider window rather than `stage3` directly:
      // `stage3` (used for the text/marker fade-in) only ramps across p
      // 0.83→0.88, a mere 5% of the scroll — spreading the grow itself
      // across 0.72→0.88 (~3x the distance) is what makes it read as a
      // steady, progressive grow through the 2→3 transition, shrinking
      // back exactly as smoothly the other way (3→2), since it's just a
      // function of p either direction.
      globeZoomRef.current = smoothstep(0.72, 0.88, p);

      // A single moving spotlight inside the stage-2 reading window: only the
      // line currently under the "reading position" is fully lit, everything
      // else sits dimmed off — with a smooth crossfade as the spotlight moves
      // from one line to the next, rather than a hard on/off cut.
      const local = smoothstep(0.19, 0.75, p);
      const n = lineRefs.current.length;
      lineRefs.current.forEach((el, i) => {
        if (!el) return;
        const center = (i + 0.5) / n;
        const dist = Math.min(1, Math.abs(local - center) * n);
        const brightness = 1 - dist;
        const eased = brightness * brightness * (3 - 2 * brightness);
        el.style.opacity = String(0.4 + 0.6 * eased);
      });

      const shouldInteract = stage3 > 0.7;
      if (shouldInteract !== interactiveRef.current) {
        interactiveRef.current = shouldInteract;
        setInteractive(shouldInteract);
        if (!shouldInteract && tooltipRef.current) tooltipRef.current.style.opacity = "0";
      }
      if (stage3 < 0.4) {
        setActive((prev) => (prev ? null : prev));
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // "Drag to discover" as a tooltip that follows the cursor anywhere over
  // this module (not just while hovering the globe itself), once stage 3 is
  // active — hidden while the user is actually dragging the globe or
  // hovering one of its country points.
  useEffect(() => {
    const container = stickyRef.current;
    if (!container) return;

    const hide = () => {
      const tooltip = tooltipRef.current;
      if (tooltip) tooltip.style.opacity = "0";
    };

    const onMove = (e: PointerEvent) => {
      if (!interactiveRef.current || globeDraggingRef.current || hoveringPointRef.current) {
        hide();
        return;
      }
      const tooltip = tooltipRef.current;
      if (!tooltip) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      tooltip.style.transform = `translate(${x + 14}px, ${y + 14}px)`;
      tooltip.style.opacity = "1";
    };

    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", hide);
    return () => {
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", hide);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-dark text-light" style={{ height: "500vh" }}>
      <div
        ref={stickyRef}
        className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden"
      >
        {/* Background starfield — behind everything, present through every
            stage since it isn't wired to any stage's fade. */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          {stars.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={
                {
                  left: `${s.left}%`,
                  top: `${s.top}%`,
                  width: s.size,
                  height: s.size,
                  animation: `star-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
                  "--op-max": s.opMax,
                  "--op-min": s.opMin,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div
          className={`transition-transform duration-500 ease-out ${
            active ? "sm:-translate-x-20 md:-translate-x-28 lg:-translate-x-36" : ""
          }`}
        >
          <div
            ref={globeSizeRef}
            // Static per-breakpoint size (no longer scroll-driven): resizing
            // a WebGL canvas is a discrete GPU-framebuffer reallocation, not
            // something that can ever look smooth under a CSS transition.
            // The "growth" between stage 2 and stage 3 is done by dollying
            // the Three.js camera closer instead (see `zoomRef` below and
            // the camera-position logic inside Globe.tsx's useFrame) — a
            // cheap per-frame number update with no reallocation, so it can
            // genuinely animate continuously ("hinchándose") on every
            // scroll frame instead of jumping between a couple of discrete
            // canvas resolutions. No `overflow-hidden` here: the camera
            // distance at full zoom is deliberately kept inside the safe
            // margin where the whole sphere always stays inside the frame
            // on its own, so nothing needs cropping.
            className="relative z-0 w-[374px] sm:w-[390px] md:w-[468px] lg:w-[546px]"
          >
            <Globe
              interactive={interactive}
              onSelect={setActive}
              onDraggingChange={(dragging) => {
                globeDraggingRef.current = dragging;
                if (dragging && tooltipRef.current) tooltipRef.current.style.opacity = "0";
              }}
              onPointHoverChange={(hovering) => {
                hoveringPointRef.current = hovering;
                if (hovering && tooltipRef.current) tooltipRef.current.style.opacity = "0";
              }}
              zoomRef={globeZoomRef}
            />
          </div>
        </div>

        {/* "Drag to discover" cursor tooltip — visible anywhere over this
            module while stage 3 is active, not just while hovering the globe
            itself. Subtle: small padding, 10% white fill, 8px corners. */}
        <div
          ref={tooltipRef}
          className="pointer-events-none absolute left-0 top-0 z-30 whitespace-nowrap rounded-[8px] bg-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-light backdrop-blur-sm transition-opacity duration-150"
          style={{ opacity: 0 }}
        >
          Drag to discover
        </div>

        {/* Stage 1 */}
        <div
          ref={stage1Ref}
          className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-6 text-center"
        >
          <p className="eyebrow !text-light">Who is behind the handlebars</p>
          <h2 className="max-w-2xl font-serif text-h1 leading-none md:text-display-2">
            Aleix Mayor, wanderer by choice
          </h2>
          <p className="max-w-lg text-body-s text-secondary">Always chasing the next horizon.</p>
        </div>

        {/* Stage 2 — lines light up one by one as you scroll through this beat.
            Sized so each line fits on a single row instead of wrapping: a
            wide, near-edge-to-edge container plus a font scale that only
            grows once there's actually room for it. */}
        <div
          ref={stage2Ref}
          className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-2 text-center sm:px-6"
          style={{ opacity: 0 }}
        >
          <div className="w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
            {LINES.map((line, i) => (
              <p
                key={line}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                className="text-[18px] leading-[23px] text-secondary sm:whitespace-nowrap sm:text-body-s sm:leading-relaxed md:text-body-m lg:text-body-l xl:text-body-xl"
                style={{ opacity: 0.4 }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Stage 3 */}
        <div
          ref={stage3Ref}
          className="pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-20 sm:px-10 sm:pt-24"
          style={{ opacity: 0 }}
        >
          <p className="eyebrow !text-light">Everywhere I&rsquo;ve ridden</p>
          <h2 className="mt-3 max-w-md font-serif text-[40px] font-normal tracking-[-0.02em] leading-none lg:text-h1">
            The world, one country at a time.
          </h2>
        </div>

        {/* Detail card, opened by clicking a marker on the globe. `absolute`
            (anchored to the sticky wrapper above, not the viewport) so that
            once the user keeps scrolling past this module's last stage, the
            card scrolls away together with the globe — same as everything
            else in this sticky section — instead of staying pinned to the
            screen and getting cut off against the next section (Upcoming
            trips) underneath it. While the sticky wrapper is actually
            "stuck" (top: 0, full viewport height) this still reads as a
            fixed full-height/full-screen panel, exactly as before.
            - Mobile: a near-fullscreen sheet — the viewport minus a small
              margin on every side (inset-4).
            - Desktop (sm+): a right-hand panel spanning nearly the full
              viewport height (inset-y-6), fixed width, with the globe
              shifted left (see the wrapper above) so it stays visible
              beside it. */}
        {/* Always mounted so open/close is a fade transition rather than an
            instant mount/unmount — content comes from `displayActive`, which
            holds the last selection so it doesn't blank out mid-fade. */}
        <div
          className={`absolute inset-4 z-20 overflow-y-auto overscroll-contain rounded-2xl bg-light text-dark shadow-2xl transition-opacity duration-300 sm:inset-y-6 sm:inset-x-auto sm:right-8 sm:w-[420px] md:w-[460px] lg:w-[500px] ${
            active ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {displayActive && (
            <>
              <div className="flex items-start justify-between px-5 pt-5">
                <p className="eyebrow">{displayActive.date || displayActive.name}</p>
                <button
                  onClick={() => setActive(null)}
                  aria-label="Close"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dark text-light"
                >
                  ✕
                </button>
              </div>
              <div className="px-5 pt-3">
                <h3 className="font-serif text-h3 leading-tight">{displayActive.title}</h3>
              </div>
              {/* Placeholder photo — replace at public{active.image} once you add real trip photos */}
              <div
                className="mx-5 mt-5 aspect-video rounded-xl bg-cover bg-center bg-neutral-100"
                style={{ backgroundImage: `url(${displayActive.image})` }}
              />
              <div className="grid grid-cols-3 gap-2 px-5 pt-5 font-mono text-detail-s">
                <div>
                  <p className="text-dark/50">Distance</p>
                  <p className="font-sans text-body-xs">{displayActive.distance ?? "Coming soon"}</p>
                </div>
                <div>
                  <p className="text-dark/50">Duration</p>
                  <p className="font-sans text-body-xs">{displayActive.duration ?? "Coming soon"}</p>
                </div>
                <div>
                  <p className="text-dark/50">Terrain</p>
                  <p className="font-sans text-body-xs">{displayActive.terrain ?? "Coming soon"}</p>
                </div>
              </div>
              <p className="px-5 pb-5 pt-5 text-body-s leading-relaxed text-dark/70">
                {displayActive.description}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
