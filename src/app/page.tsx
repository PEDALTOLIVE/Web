import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import AboutWorld from "@/components/home/AboutWorld";
import UpcomingTrips from "@/components/home/UpcomingTrips";
import GuidedTrips from "@/components/home/GuidedTrips";
import RouteKits from "@/components/home/RouteKits";
import Shop from "@/components/home/Shop";
import Sponsors from "@/components/home/Sponsors";
import StickyBookCta from "@/components/home/StickyBookCta";
import SmoothScroll from "@/components/home/SmoothScroll";
import { SHOW_GUIDED_TRIPS, SHOW_KITS } from "@/lib/features.mjs";

// The CSS scroll-snap tried just before this was removed per explicit
// request — trying a different approach. SmoothScroll (see its own file)
// now drives every scroll action on this page instead: a big, eased glide
// per wheel/touch input via Lenis, rather than snapping to a module
// boundary. Plain component, no wrapper markup needed on the modules below.
export default function Home() {
  return (
    <>
      <SmoothScroll />
      {/* Default (dark) variant — this page opens on a dark hero. */}
      <Header />
      <Hero />
      <AboutWorld />
      <UpcomingTrips />
      {/* Hidden/shown via src/lib/features.mjs. */}
      {SHOW_GUIDED_TRIPS && <GuidedTrips />}
      {SHOW_KITS && <RouteKits />}
      <Shop />
      <Sponsors />
      {/* Small "Book your trip" CTA, fixed at the bottom of the viewport
          for the whole home page — not just the hero. */}
      {SHOW_GUIDED_TRIPS && <StickyBookCta />}
    </>
  );
}
