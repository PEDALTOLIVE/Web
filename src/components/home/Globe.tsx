"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, PerformanceMonitor, Preload, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { countries, type CountryTrip } from "@/lib/countries";

interface GlobeProps {
  /** Only clickable (and fully visible) once the parent scroll stage says so. */
  interactive: boolean;
  /**
   * Whether the parent's own section is anywhere near the viewport right
   * now. Defaults to true so nothing else that renders <Globe /> without
   * passing it changes behavior. When false, the Canvas's render loop is
   * paused entirely (see the `frameloop` prop below) instead of just
   * sitting there rendering an unseen globe every frame forever — see
   * AboutWorld.tsx for where this is actually computed, off the same
   * scroll math it already tracks.
   */
  active?: boolean;
  onSelect: (country: CountryTrip) => void;
  /** Lets the parent hide its own "drag to discover" tooltip while dragging. */
  onDraggingChange?: (dragging: boolean) => void;
  /** Lets the parent hide its own tooltip while a country point is hovered. */
  onPointHoverChange?: (hovering: boolean) => void;
  /**
   * 0 (resting, stage 1/2) -> 1 (fully grown, stage 3), updated every
   * scroll frame by the parent as a ref (not React state) so it can be
   * read straight inside the render loop below with no re-render at all —
   * same pattern as `rotationState`. See the camera dolly-zoom comment in
   * Scene's useFrame for why this drives the camera instead of the
   * canvas's own CSS size.
   */
  zoomRef?: { current: number };
}

// `rotation` = spin around the vertical axis (left/right drag),
// `tilt` = pitch around the horizontal axis (up/down drag), clamped in
// onMove below so the globe can't be dragged past looking at its own
// pole (which would flip disorientingly).
type RotationState = { rotation: number; tilt: number; dragging: boolean; hovering: boolean };

const RADIUS = 1;
const START_ROTATION = (24 * Math.PI) / 180; // start slightly turned, same as before

// Camera distance at rest (stage 1/2) vs. fully grown (stage 3), dollied
// smoothly between the two every frame via `zoomRef` — see the comment in
// Scene's useFrame. FULL is as close as the camera can safely get: the
// globe's silhouette can't exceed the camera's own field of view (see the
// <Canvas> comment below) without part of the sphere clipping against the
// edge of the canvas — a hard, flat cut, very visible against the dark
// background. That hard limit caps how much bigger stage 3 can ever look
// to about +30% over REST with a real, comfortable margin (an earlier
// attempt at cropping the canvas down from something larger, to reach a
// full +50%, technically worked but meant the globe's own edge was
// deliberately cut off at full zoom — rejected once we saw it live, since
// the goal is the globe always reading as a complete sphere, never
// masked).
const CAMERA_Z_REST = 4;
const CAMERA_Z_FULL = 3.24;

// Real-world lat/lon from lib/countries.ts, flattened onto each point so
// the rest of this file can keep reading `country.lat` / `country.lon`.
// Earth textures. Declared once so the same list drives both the module-level
// preload just below and the useTexture() call inside Scene. clouds is a
// grayscale JPG (was a 1.4MB PNG) — an alphaMap only reads one channel, so
// nothing is lost, and it downloads in well under half the time.
// "Lite" mode for modest machines (e.g. an older MacBook): detected once,
// up front, from the CPU core count (and RAM where the browser reports it —
// Safari doesn't). In lite mode the globe uses a 2K instead of 4K Earth
// texture (~4x less GPU memory/upload), fewer sphere segments and stars,
// no antialiasing, and renders at 1x pixel density. It looks almost the
// same at the globe's on-screen size but is far cheaper to draw. Machines
// that pass this check but still struggle are caught at runtime by the
// <PerformanceMonitor> further down, which drops the pixel density.
const LITE =
  typeof navigator !== "undefined" &&
  ((navigator.hardwareConcurrency ?? 8) <= 4 ||
    ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4);
const SPHERE_SEGMENTS = LITE ? 64 : 96;
const STAR_COUNT = LITE ? 1200 : 3200;

const TEXTURE_URLS = [
  LITE ? "/textures/earth/albedo-2k.jpg" : "/textures/earth/albedo.jpg",
  "/textures/earth/bump.jpg",
  "/textures/earth/roughness.jpg",
  "/textures/earth/night-lights.jpg",
  "/textures/earth/clouds.jpg",
];

// Start downloading the textures the moment this module is loaded (which
// AboutWorld now triggers right after page load, while the hero is still on
// screen) instead of only when the globe first renders mid-entrance — that
// late, all-at-once download + GPU upload was a big part of the stuttery
// first appearance.
useTexture.preload(TEXTURE_URLS);

const POINTS = countries.map((c) => ({
  ...c,
  lat: c.coords.lat,
  lon: c.coords.lon,
}));

function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

// Very soft white halo behind the globe: a billboarded sprite (always
// faces the camera) using a small radial-gradient texture generated once
// on a <canvas>, rather than a custom GLSL shader — much lower-risk, and
// because it's real geometry at the globe's own position, it dollies with
// the camera exactly like the sphere does, so it stays the same
// proportion around the globe at every zoom level instead of drifting out
// of sync the way a fixed-size CSS glow behind the canvas would as the
// globe grows. Renders early (see `renderOrder` below) so the opaque
// globe drawn after it naturally covers the middle, leaving only a soft
// rim visible around the edge.
function useGlowTexture() {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, "rgba(255,255,255,0.8)");
      gradient.addColorStop(0.4, "rgba(255,255,255,0.34)");
      gradient.addColorStop(0.75, "rgba(255,255,255,0.08)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);
}

function Marker({
  country,
  interactive,
  onSelect,
  onPointHoverChange,
  rotationState,
  wrapRef,
}: {
  country: (typeof POINTS)[number];
  interactive: boolean;
  onSelect: (c: CountryTrip) => void;
  onPointHoverChange?: (hovering: boolean) => void;
  rotationState: { current: RotationState };
  wrapRef: RefObject<HTMLDivElement | null>;
}) {
  const pos = useMemo(() => latLonToVector3(country.lat, country.lon, RADIUS * 1.001), [country]);
  const groupRef = useRef<THREE.Group>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const { camera } = useThree();
  const interactiveRef = useRef(interactive);
  interactiveRef.current = interactive;

  // drei's <Html occlude> (raycast-based) turned out to collapse every
  // marker to 0x0 with this fiber/drei version combo, so occlusion is done
  // by hand here instead: each frame, check whether this marker's point on
  // the sphere currently faces the camera (vs. the far side of the globe)
  // and hide it via direct style writes — cheap, and avoids a re-render.
  useFrame(() => {
    const group = groupRef.current;
    const btn = btnRef.current;
    if (!group || !btn) return;
    const worldPos = group.getWorldPosition(new THREE.Vector3());
    const facing = camera.position.clone().normalize().dot(worldPos.normalize()) > 0.05;
    const show = interactiveRef.current && facing;
    btn.style.opacity = show ? "1" : "0";
    btn.style.pointerEvents = show ? "auto" : "none";
  });

  // Trips don't all carry a `date` yet (many are still just "" — see
  // lib/countries.ts) — only pull a year out when one is actually there,
  // same idea for `distance`, so the hover card below only ever shows real
  // data instead of a blank/placeholder line.

  return (
    <group ref={groupRef} position={pos}>
      <Html
        center
        distanceFactor={4.5}
        // drei's Html types `portal` as RefObject<HTMLElement> (non-null),
        // but a real DOM ref is always `T | null` until mount — safe to
        // cast, since Html never dereferences it before mount either.
        portal={wrapRef as RefObject<HTMLElement>}
        style={{ transition: "opacity .3s" }}
      >
        <button
          ref={btnRef}
          onClick={() => onSelect(country)}
          onPointerEnter={() => {
            rotationState.current.hovering = true;
            onPointHoverChange?.(true);
          }}
          onPointerLeave={() => {
            rotationState.current.hovering = false;
            onPointHoverChange?.(false);
          }}
          aria-label={country.name}
          className="group relative flex h-7 w-7 items-center justify-center opacity-0"
          style={{ pointerEvents: "none" }}
        >
          {/* Dot: shrinks/fades away on hover as the photo (below) grows in
              exactly on top of it, so the dot reads as *becoming* the photo
              rather than the photo appearing as a separate label next to
              it. */}
          <span className="block h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-primary/25 transition-all duration-300 group-hover:scale-0 group-hover:opacity-0" />

          {/* Photo: centered on the exact same point as the dot above
              (left-1/2 top-1/2 + -translate-x/y-1/2, not the dot's own
              flex-centering, so it's independent of the dot's box) and
              scaled down + transparent at rest, growing to full size and
              opacity on hover. Because it shares the dot's center and ends
              up larger than it, it visually covers/replaces the dot as it
              grows instead of appearing as a separate element nearby. */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2 scale-[0.2] rounded-full bg-cover bg-center opacity-0 shadow-[0_0_10px_3px_rgba(255,255,255,0.175)] transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
            style={{ backgroundImage: `url(${country.image})` }}
          />

          {/* Name/stats: positioned beside the photo's *full-size* footprint
              (left-1/2 + a fixed margin equal to half the photo's width
              plus the gap — margins aren't affected by the photo's scale
              transform, so this stays put through the grow animation)
              rather than being part of the same flex row as the photo, so
              it doesn't shift as the photo scales up. */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 ml-[16.8px] flex -translate-y-1/2 flex-col items-start gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {/* pb reduced 1px below pt (was a symmetric py-[1.2px]) — bottom
                padding only, per the explicit request. */}
            <span className="whitespace-nowrap rounded-[2px] bg-light px-[2.4px] pt-[1.2px] pb-[0.2px] font-mono text-[4.8px] font-normal uppercase text-dark">
              {country.name}
            </span>
            {/* Name + distance/elevation only — the year ("in 2024") was
                removed per explicit request, it was too much here. */}
            {country.distance && (
              <span className="whitespace-nowrap font-mono text-[4.8px] font-normal leading-tight text-light">
                <span className="block">{country.distance}</span>
              </span>
            )}
          </div>
        </button>
      </Html>
    </group>
  );
}

function Scene({
  interactive,
  onSelect,
  onPointHoverChange,
  rotationState,
  zoomRef,
  wrapRef,
}: GlobeProps & { rotationState: { current: RotationState }; wrapRef: RefObject<HTMLDivElement | null> }) {
  const groupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const glowTexture = useGlowTexture();

  const [albedo, bump, roughness, nightLights, clouds] = useTexture(TEXTURE_URLS);

  albedo.colorSpace = THREE.SRGBColorSpace;
  nightLights.colorSpace = THREE.SRGBColorSpace;
  [albedo, bump, roughness, nightLights, clouds].forEach((t) => {
    t.anisotropy = LITE ? 4 : 8;
  });

  useFrame((_, delta) => {
    if (!rotationState.current.dragging && !rotationState.current.hovering) {
      rotationState.current.rotation += delta * 0.045; // slow ambient auto-rotate
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = rotationState.current.rotation;
      // Vertical drag pitches the whole group (markers included, since
      // they're children of it) around the horizontal axis — dragging
      // down tips the near side down, like pulling the globe toward you.
      groupRef.current.rotation.x = rotationState.current.tilt;
    }
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.015; // independent cloud drift

    // "Grow" the globe by dollying the camera in, not by resizing the
    // <canvas>. Resizing a WebGL canvas reallocates its drawing buffer —
    // a discrete, non-interpolatable jump to a new resolution — so no
    // matter how smoothly the surrounding CSS box changed size, the
    // rendered globe itself could only ever snap between whatever handful
    // of sizes the browser's resize-observer happened to report, which is
    // exactly what read as a sudden jump instead of a gradual grow.
    // Moving the camera instead re-projects the same fixed-resolution
    // canvas fresh every frame — a plain number lerped straight from
    // scroll position, nothing to reallocate — so it reads as a genuinely
    // continuous "inflate", and since the camera dollies straight in
    // along its own view axis toward the sphere sitting at the world
    // origin, the grow is inherently centered too.
    if (zoomRef) {
      camera.position.z = CAMERA_Z_REST + (CAMERA_Z_FULL - CAMERA_Z_REST) * zoomRef.current;
    }
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 2, 4]} intensity={1.6} />

      {/* Distant starfield — sits far behind the globe (radius 60 vs. the
          globe's own radius ~1 and a camera that never gets closer than
          ~3.2), so it stays essentially fixed in apparent size through the
          whole zoom range instead of dollying with the globe, exactly like
          a real background would. */}
      <Stars radius={60} depth={35} count={STAR_COUNT} factor={2.4} saturation={0} fade speed={0.25} />

      {/* Soft halo — see the comment on useGlowTexture above. Drawn before
          the globe (negative renderOrder) so the opaque sphere painted
          after it covers the middle, leaving only the rim visible. */}
      <sprite renderOrder={-1} scale={[2.2, 2.2, 1]}>
        <spriteMaterial
          map={glowTexture}
          transparent
          opacity={0.72}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS]} />
          <meshStandardMaterial
            map={albedo}
            bumpMap={bump}
            bumpScale={0.025}
            roughnessMap={roughness}
            metalness={0.15}
            emissiveMap={nightLights}
            emissive={new THREE.Color("#ffe9b0")}
            emissiveIntensity={0.55}
          />
        </mesh>

        <group ref={cloudsRef}>
          <mesh scale={1.008}>
            <sphereGeometry args={[RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS]} />
            <meshStandardMaterial
              alphaMap={clouds}
              color="#ffffff"
              transparent
              depthWrite={false}
              opacity={0.7}
              roughness={1}
            />
          </mesh>
        </group>

        {POINTS.map((c) => (
          <Marker
            key={c.slug}
            country={c}
            interactive={interactive}
            onSelect={onSelect}
            onPointHoverChange={onPointHoverChange}
            rotationState={rotationState}
            wrapRef={wrapRef}
          />
        ))}
      </group>
    </>
  );
}

// A real WebGL globe (react-three-fiber / three.js): the Earth sphere uses
// Aleix's own textures (albedo, bump, land/ocean roughness mask, night
// lights) plus a separate slightly-larger cloud shell — no atmosphere glow
// shell (removed by request, it read as a blue halo around the globe).
// Auto-rotates ambiently; dragging spins it directly (same drag-to-spin
// feel as the old CSS version). Markers are placed with real
// lat/lon-on-sphere projection and rendered as HTML overlays, with
// hand-rolled front/back occlusion (see Marker above).
// Rendered inside the same <Suspense> as Scene, so its effect only fires once
// every texture has loaded and <Preload all /> has uploaded them / compiled
// the shaders. Two animation frames later (so the first real frame has been
// drawn) it tells the wrapper to fade the canvas in.
function ReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    let id2 = 0;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(onReady);
    });
    return () => {
      cancelAnimationFrame(id1);
      cancelAnimationFrame(id2);
    };
  }, [onReady]);
  return null;
}

export default function Globe({ interactive, onSelect, onDraggingChange, onPointHoverChange, zoomRef, active = true }: GlobeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rotationState = useRef<RotationState>({ rotation: START_ROTATION, tilt: 0, dragging: false, hovering: false });
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  const interactiveRef = useRef(interactive);
  interactiveRef.current = interactive;
  // Canvas stays invisible until textures + shaders are fully ready, then
  // fades in — so the first thing anyone sees is a finished globe, never a
  // half-loaded one popping in mid-animation.
  const [ready, setReady] = useState(false);
  // Pixel density: 1x in lite mode, up to 2x (retina) otherwise — lowered
  // to 1x at runtime if the frame rate drops (see <PerformanceMonitor>).
  const [dpr, setDpr] = useState<number>(() =>
    LITE ? 1 : Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1),
  );
  const handleReady = useMemo(() => () => setReady(true), []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onDown = (e: PointerEvent) => {
      if (!interactiveRef.current) return;
      // Marker buttons live inside this same wrapper (drei's <Html> portals
      // them as DOM siblings of the canvas), so a pointerdown on one of them
      // bubbles up here too. Without this guard we'd unconditionally start
      // a drag and capture the pointer on *every* marker press, which
      // hijacks the browser's normal pointerdown→pointerup→click sequence
      // on the button — the click event never reaches it, so tapping a
      // country silently did nothing. Ignore drag-start when the press
      // began on a button so marker clicks work normally.
      if ((e.target as HTMLElement).closest("button")) return;
      rotationState.current.dragging = true;
      lastXRef.current = e.clientX;
      lastYRef.current = e.clientY;
      el.setPointerCapture(e.pointerId);
      onDraggingChange?.(true);
    };
    // Max pitch away from level, either direction — stops a vertical drag
    // just short of looking straight down/up at a pole, which is where a
    // free-spinning tilt starts to feel disorientating (the horizontal
    // drag has no such limit since spinning all the way around is exactly
    // the intended feel there).
    const MAX_TILT = 1.1; // ~63 degrees
    const onMove = (e: PointerEvent) => {
      if (!rotationState.current.dragging) return;
      const dx = e.clientX - lastXRef.current;
      const dy = e.clientY - lastYRef.current;
      lastXRef.current = e.clientX;
      lastYRef.current = e.clientY;
      const radPerPx = (Math.PI * 1.4) / el.offsetWidth;
      rotationState.current.rotation += dx * radPerPx;
      const nextTilt = rotationState.current.tilt + dy * radPerPx;
      rotationState.current.tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, nextTilt));
    };
    const onUp = () => {
      if (!rotationState.current.dragging) return;
      rotationState.current.dragging = false;
      onDraggingChange?.(false);
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [onDraggingChange]);

  return (
    <div
      ref={wrapRef}
      // `[&_canvas]:...` reaches into react-three-fiber's own internal
      // wrapper divs to pin the actual <canvas> element centered (via
      // absolute + inset-0 + margin-auto — a position change only, no
      // scale(), so it can't confuse R3F/drei's size measurement the way a
      // CSS transform does — see the comment on the <Canvas> camera below).
      // R3F sets the canvas's CSS pixel size explicitly from a
      // ResizeObserver reading of this container, which updates a frame
      // behind the container's own (smoothly, continuously scroll-driven)
      // width; without this, that one-frame-behind canvas — smaller than
      // its already-grown parent and not centered by default — sits flush
      // in the parent's top-left corner while it's catching up, which is
      // exactly what made the globe look like it was growing outward from
      // its upper-left edge instead of from its own center.
      className="relative aspect-square w-full cursor-grab touch-none select-none active:cursor-grabbing [&_canvas]:!absolute [&_canvas]:!inset-0 [&_canvas]:!m-auto"
    >
      {/* Soft blurred floor shadow beneath the sphere. */}
      <div
        className="pointer-events-none absolute left-1/2 top-[92%] h-[16%] w-[70%] -translate-x-1/2 rounded-[50%] opacity-40 blur-2xl"
        style={{ background: "radial-gradient(closest-side, rgba(20,30,35,0.55), transparent 75%)" }}
      />
      <Canvas
        // Camera pulled back enough that the globe (Earth + cloud shell,
        // radius ~1.008) always fits inside the frustum with margin to
        // spare — at a shorter distance the sphere's silhouette can end up
        // *larger* than the camera's field of view, so it gets hard-cropped
        // by the canvas edges (looks like a square "mask" cutting the
        // globe, especially over lighter/land textures where the cut is
        // obvious against the dark page background).
        camera={{ position: [0, 0, CAMERA_Z_REST], fov: 40 }}
        // Main fix for the choppy first appearance: AboutWorld scales the
        // globe's parent in from scale(0) with a CSS transform during the
        // entrance. R3F measures its container with getBoundingClientRect
        // (transform included) and re-measures on every scroll, so all the
        // way through that entrance it kept resizing the WebGL canvas —
        // reallocating (and clearing) the framebuffer every ~50ms while it
        // grew, starting from 0x0. offsetSize makes it measure the real,
        // un-transformed layout size instead (constant, so the canvas is
        // sized once and the CSS scale just scales the finished image), and
        // scroll: false stops the pointless re-measure on every scroll.
        resize={{ scroll: false, offsetSize: true }}
        style={{ opacity: ready ? 1 : 0, transition: "opacity 0.6s ease-out" }}
        dpr={dpr}
        gl={{ alpha: true, antialias: !LITE, powerPreference: "high-performance" }}
        // "always" (r3f's default) keeps this rendering every frame for as
        // long as the Canvas is mounted, whether or not anyone can
        // actually see it. This component stays mounted for the whole
        // home page, so without this gate it never stops rendering, even
        // scrolled all the way down at the footer — a continuous, wasted
        // GPU cost that stacks on top of every other scroll-driven effect
        // on the page. "never" freezes it on its current frame instantly,
        // no unmount/remount (and no WebGL re-init flash) required.
        frameloop={active ? "always" : "never"}
      >
        <Suspense fallback={null}>
          <Scene
            interactive={interactive}
            onSelect={onSelect}
            onDraggingChange={onDraggingChange}
            onPointHoverChange={onPointHoverChange}
            rotationState={rotationState}
            zoomRef={zoomRef}
            wrapRef={wrapRef}
          />
          {/* Uploads every texture to the GPU and compiles every shader up
              front, in one go, instead of lazily on the first frames the
              globe is on screen (which is exactly when it's animating in). */}
          <Preload all />
          {/* If the frame rate keeps falling short, render at 1x pixel
              density from then on (a one-off switch, not a back-and-forth). */}
          <PerformanceMonitor onDecline={() => setDpr(1)} />
          <ReadySignal onReady={handleReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}
