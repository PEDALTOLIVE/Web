"use client";

import Link from "next/link";
import type { GuidedTrip } from "@/lib/countries";
import RevealLines from "@/components/ui/RevealLines";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 12 12" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2l4 4-4 4" />
    </svg>
  );
}

// Shared guided-trip card — used on the homepage teaser (home/GuidedTrips.tsx),
// the full grid (shop-trips/TripsGrid.tsx) and the trip detail page's "You
// may also like" (shop-trips/Detail.tsx), so all three stay in sync instead
// of drifting from three separate copies of the same markup.
export default function TripCard({ trip }: { trip: GuidedTrip }) {
  return (
    <Link
      href={`/product-page/${trip.slug}`}
      className="group relative flex h-[420px] flex-col justify-between overflow-hidden rounded-2xl bg-dark p-6 text-light"
    >
      {/* Placeholder photo — see src/lib/countries.ts to swap for a real one */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70 transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url(${trip.image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/30 to-transparent" />

      {/* Title + price now anchored at the TOP of the card (was at the
          bottom, grouped with the detail lines) — per the attached design,
          which reads title/price right under the top edge and leaves the
          bottom of the card to the detail lines + a new "Explore the trip"
          CTA row. The "Open"/"Coming soon" status pill that used to sit
          here is dropped, per the same attached design (it shows this exact
          trip, which has comingSoon: true, with no pill at all). */}
      <div className="relative">
        {/* Flat 36px at every breakpoint per explicit request — was
            text-h4 (40px). Same line-height/letter-spacing/weight as the
            h4 token (1.1 / -0.02em / 500), just the size dialed down,
            since there's no 36px token in the scale. This is the single
            shared TripCard used on the home teaser, the full Guided trips
            grid, and the trip detail page's "You may also like", so the
            change applies everywhere at once. */}
        <RevealLines
          as="h3"
          immediate
          className="w-full text-[36px] font-medium leading-[1.1] tracking-[-0.02em]"
        >
          {trip.title}
        </RevealLines>
        <p className="mt-4 text-body-s text-secondary">
          from <span className="font-semibold">€{trip.priceFrom.toLocaleString("en-US")}</span>
        </p>
      </div>

      {/* Detail lines + CTA row anchored at the bottom. */}
      <div className="relative flex flex-col gap-6">
        <div className="space-y-0.5 text-body-xs text-secondary/80">
          <p>Max {trip.maxRiders} riders</p>
          <p>Guided by Aleix or trusted local</p>
          <p>
            Difficulty{" "}
            {"★".repeat(trip.difficulty)}
            {"☆".repeat(5 - trip.difficulty)}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-detail-s uppercase text-light">
            Explore the trip
          </span>
          {/* rounded-[8px] (was rounded-full) per explicit request — a
              square corner-radius box, not a circle. group-active state
              added to match the rest of the site's primary-button
              interaction (hover sage, pressed olive). */}
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-primary text-light transition-colors duration-300 group-hover:bg-[#A9B89C] group-active:bg-[#657755]">
            <ArrowIcon />
          </span>
        </div>
      </div>
    </Link>
  );
}
