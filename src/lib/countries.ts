import { placeholderImage } from "@/lib/placeholder";

export type CountryTrip = {
  slug: string;
  name: string;
  date: string;
  title: string;
  description: string;
  distance?: string;
  duration?: string;
  terrain?: string;
  image: string;
  /** Real-world coordinates used to place the marker on the 3D globe. */
  coords: { lat: number; lon: number };
};

// Countries Aleix has bikepacked through (from Pedaltolive trip history).
// Placement values are approximate and only used for the flat teaser globe
// on the homepage — replace with real lat/lng once the 3D globe (three-globe
// / react-globe.gl) is wired up. Images are placeholder photos for now —
// see src/lib/placeholder.ts — swap `image` for a local `/images/...` path
// once you drop in the real ones.
export const countries: CountryTrip[] = [
  {
    slug: "vietnam-cambodia",
    name: "Vietnam & Cambodia",
    date: "November 2024",
    title: "Vietnam & Cambodia — Bikepacking the Origins",
    description:
      "Drenched in rain, fueled by noodles, chasing sunsets on wild beaches, and exploring temples for 30 unforgettable days.",
    distance: "1,900 km",
    duration: "30 days",
    terrain: "Rice fields & coast",
    image: placeholderImage("vietnam-cambodia", 800, 600),
    coords: { lat: 13.0, lon: 105.5 },
  },
  {
    slug: "indonesia",
    name: "Indonesia",
    date: "May 2025",
    title: "Indonesia — Volcanoes & Island Hopping",
    description:
      "Ferry-hopping between islands, climbing volcanoes at dawn, and riding through rice terraces from Java to the Lesser Sundas.",
    image: placeholderImage("indonesia", 800, 600),
    coords: { lat: -8.3, lon: 116.0 },
  },
  {
    slug: "iceland",
    name: "Iceland",
    date: "July 2025",
    title: "Iceland — The Rift Gravel Race",
    description:
      "200 km of gravel across black sand and lava fields in the land of fire and ice.",
    image: placeholderImage("iceland", 800, 600),
    coords: { lat: 64.9, lon: -18.5 },
  },
  {
    slug: "oman",
    name: "Oman",
    date: "October 2025",
    title: "Oman — Desert & 50°C Heat",
    description:
      "Self-sufficient across the desert, chasing shade and water in some of the hardest heat of any trip yet.",
    image: placeholderImage("oman", 800, 600),
    coords: { lat: 20.5, lon: 56.0 },
  },
  {
    slug: "colombia",
    name: "Colombia",
    date: "",
    title: "Colombia",
    description: "Climbing through the Andes and the coffee region.",
    image: placeholderImage("colombia", 800, 600),
    coords: { lat: 4.8, lon: -75.7 },
  },
  {
    slug: "usa",
    name: "USA",
    date: "",
    title: "USA — Washington & Virginia",
    description: "East coast miles between two very different worlds.",
    image: placeholderImage("usa", 800, 600),
    coords: { lat: 38.3, lon: -78.0 },
  },
  {
    slug: "spain",
    name: "Spain",
    date: "",
    title: "Spain",
    description: "Home roads — where it all started.",
    image: placeholderImage("spain", 800, 600),
    coords: { lat: 41.7, lon: 1.8 },
  },
  {
    slug: "morocco",
    name: "Morocco",
    date: "",
    title: "Morocco",
    description: "Atlas passes and desert tracks.",
    image: placeholderImage("morocco", 800, 600),
    coords: { lat: 31.1, lon: -7.9 },
  },
  {
    slug: "sri-lanka",
    name: "Sri Lanka",
    date: "",
    title: "Sri Lanka",
    description: "Tea country climbs and tropical coastline.",
    image: placeholderImage("sri-lanka", 800, 600),
    coords: { lat: 6.9, lon: 80.8 },
  },
  {
    slug: "jordan",
    name: "Jordan",
    date: "",
    title: "Jordan Bike Trail",
    description: "Desert canyons and ancient trails end to end.",
    image: placeholderImage("jordan", 800, 600),
    coords: { lat: 30.5, lon: 35.8 },
  },
  {
    slug: "thailand",
    name: "Thailand",
    date: "",
    title: "Thailand",
    description: "Jungle roads and street food fuel.",
    image: placeholderImage("thailand", 800, 600),
    coords: { lat: 16.0, lon: 101.5 },
  },
  {
    slug: "laos",
    name: "Laos",
    date: "",
    title: "Laos",
    description: "Quiet mountain roads through Southeast Asia.",
    image: placeholderImage("laos", 800, 600),
    coords: { lat: 19.5, lon: 102.5 },
  },
  {
    slug: "timor-leste",
    name: "Timor-Leste",
    date: "",
    title: "Timor-Leste",
    description: "Remote island climbs, end of the road.",
    image: placeholderImage("timor-leste", 800, 600),
    coords: { lat: -8.8, lon: 125.7 },
  },
  {
    slug: "gambia",
    name: "Gambia",
    date: "",
    title: "Gambia",
    description: "River roads through West Africa.",
    image: placeholderImage("gambia", 800, 600),
    coords: { lat: 13.45, lon: -15.5 },
  },
  {
    slug: "sao-tome-and-principe",
    name: "São Tomé and Príncipe",
    date: "",
    title: "São Tomé and Príncipe",
    description: "Tiny island nation, big climbs.",
    image: placeholderImage("sao-tome-and-principe", 800, 600),
    coords: { lat: 0.3, lon: 6.7 },
  },
  {
    slug: "nepal",
    name: "Nepal",
    date: "May 2024",
    title: "Nepal",
    description:
      "Seven days of wild MTB adventure on Nepal\u2019s legendary Annapurna Circuit, tackling rugged trails and high mountain passes beneath the Annapurnas, Dhaulagiri and other 8000s. A journey of raw landscapes, local culture, and unforgettable Himalayan panoramas.",
    image: "/images/countries/nepal.jpg",
    distance: "400 km · +13,000 m",
    duration: "7 days",
    // 5 out of 5 stars.
    terrain: "★★★★★",
    coords: { lat: 28.0, lon: 84.0 },
  },
];

export type UpcomingTrip = {
  slug: string;
  name: string;
  image: string;
};

// Countries on the horizon — shown in the "Upcoming trips" module between
// the interactive globe and the guided trips grid. Real photos live in
// `public/images/` (same flat folder as the rest of the site's images).
export const upcomingTrips: UpcomingTrip[] = [
  { slug: "pakistan", name: "Pakistan", image: "/images/upcoming-pakistan.jpg" },
  { slug: "afghanistan", name: "Afghanistan", image: "/images/IMG_9486.JPG" },
  { slug: "mexico", name: "Mexico", image: "/images/upcoming-mexico.jpg" },
  { slug: "western-sahara", name: "Western Sahara", image: "/images/upcoming-western-sahara.jpg" },
  { slug: "mauritania", name: "Mauritania", image: "/images/IMG_9489.JPG" },
  { slug: "ethiopia", name: "Ethiopia", image: "/images/upcoming-ethiopia.jpg" },
  { slug: "balkans", name: "Balkans", image: "/images/upcoming-balkans.jpg" },
];

export type KitIncludedIconKey = "route" | "guide" | "photos" | "logistics";

export type Kit = {
  slug: string;
  country: string;
  /** Broad region, used to power the /shop-kits filter chips. */
  region: string;
  days: number;
  price: number;
  description: string;
  image: string;
  /** Longer copy for the kit's own detail page (/product-page/[slug]) — the
   *  card-length `description` above is reused there when this is omitted. */
  longDescription?: string;
  /** The 3 "label / info data" specs shown on the detail page. */
  distance?: string;
  terrain?: string;
  difficulty?: string;
  /** "What's included in this kit" list on the detail page. */
  included?: { icon: KitIncludedIconKey; text: string }[];
  /** Extra photos for the detail page's thumbnail gallery, alongside
   *  `image` (the main photo). */
  gallery?: string[];
};

export const kits: Kit[] = [
  {
    slug: "vietnam-cambodia",
    country: "Vietnam and Cambodia",
    region: "Asia",
    days: 36,
    price: 49,
    description:
      "Temples, rice fields, and rain-soaked roads. The route that started it all.",
    longDescription:
      "This is the route that started it all: 36 days threading rice paddies, colonial towns and rain-soaked coast roads between Vietnam and Cambodia. Expect friendly locals, endless noodle stops, and a few properly soaked nights. The kit includes the exact GPS track I rode, a day-by-day written guide, real photos from the road, and honest notes on visas, water, and where to sleep.",
    distance: "1,900 km",
    terrain: "Rice fields & coast",
    difficulty: "Moderate",
    included: [
      { icon: "route", text: "The exact GPS track I rode, ready to load onto your device" },
      { icon: "guide", text: "A day-by-day written guide" },
      { icon: "photos", text: "Real photos from the road" },
      { icon: "logistics", text: "Honest notes on visas, water, and where to sleep" },
    ],
    image: placeholderImage("kit-vietnam-cambodia", 800, 600),
    gallery: [
      placeholderImage("kit-vietnam-cambodia-2", 600, 450),
      placeholderImage("kit-vietnam-cambodia-3", 600, 450),
      placeholderImage("kit-vietnam-cambodia-4", 600, 450),
    ],
  },
  {
    slug: "iceland",
    country: "Iceland",
    region: "Europe",
    days: 12,
    price: 39,
    description: "Gravel, wind, and endless daylight across the highlands.",
    longDescription:
      "Gravel, relentless wind and endless daylight across the Icelandic highlands — a short, hard route for riders who want big landscapes packed into a small number of days. The kit includes the exact GPS track I rode, a short written guide, real photos from the road, and honest notes on weather windows, river crossings, and where to resupply.",
    distance: "800 km",
    terrain: "Gravel & highlands",
    difficulty: "Hard",
    included: [
      { icon: "route", text: "The exact GPS track I rode, ready to load onto your device" },
      { icon: "guide", text: "A short written guide" },
      { icon: "photos", text: "Real photos from the road" },
      { icon: "logistics", text: "Honest notes on weather windows, river crossings, and resupply" },
    ],
    image: placeholderImage("kit-iceland", 800, 600),
    gallery: [
      placeholderImage("kit-iceland-2", 600, 450),
      placeholderImage("kit-iceland-3", 600, 450),
      placeholderImage("kit-iceland-4", 600, 450),
    ],
  },
  {
    slug: "oman",
    country: "Oman",
    region: "Middle East",
    days: 14,
    price: 39,
    description: "Desert self-sufficiency in the heat of the Empty Quarter.",
    longDescription:
      "Self-sufficient across the Empty Quarter, chasing shade and water through some of the hardest heat of any route I've ridden. The kit includes the exact GPS track I rode, a short written guide, real photos from the road, and honest notes on water caches, heat management, and border logistics.",
    distance: "950 km",
    terrain: "Desert & wadis",
    difficulty: "Hard",
    included: [
      { icon: "route", text: "The exact GPS track I rode, ready to load onto your device" },
      { icon: "guide", text: "A short written guide" },
      { icon: "photos", text: "Real photos from the road" },
      { icon: "logistics", text: "Honest notes on water caches, heat management, and border logistics" },
    ],
    image: placeholderImage("kit-oman", 800, 600),
    gallery: [
      placeholderImage("kit-oman-2", 600, 450),
      placeholderImage("kit-oman-3", 600, 450),
      placeholderImage("kit-oman-4", 600, 450),
    ],
  },
  {
    slug: "morocco",
    country: "Morocco",
    region: "Africa",
    days: 18,
    price: 42,
    description: "Atlas passes and desert tracks, from coast to canyon.",
    longDescription:
      "Atlas passes and desert tracks, from the coast to the canyon — a route that swings from cold mountain nights to hot lowland afternoons in the same week. The kit includes the exact GPS track I rode, a short written guide, real photos from the road, and honest notes on passes, water, and where to sleep.",
    distance: "1,100 km",
    terrain: "Mountain passes & desert",
    difficulty: "Moderate",
    included: [
      { icon: "route", text: "The exact GPS track I rode, ready to load onto your device" },
      { icon: "guide", text: "A short written guide" },
      { icon: "photos", text: "Real photos from the road" },
      { icon: "logistics", text: "Honest notes on passes, water, and where to sleep" },
    ],
    image: placeholderImage("kit-morocco", 800, 600),
    gallery: [
      placeholderImage("kit-morocco-2", 600, 450),
      placeholderImage("kit-morocco-3", 600, 450),
      placeholderImage("kit-morocco-4", 600, 450),
    ],
  },
  {
    slug: "colombia",
    country: "Colombia",
    region: "South America",
    days: 21,
    price: 44,
    description: "Andean climbs and coffee-country switchbacks.",
    longDescription:
      "Andean climbs and coffee-country switchbacks, with altitude, thin air and some of the best roadside food of any trip so far. The kit includes the exact GPS track I rode, a short written guide, real photos from the road, and honest notes on altitude, traffic, and safety.",
    distance: "1,250 km",
    terrain: "Andean climbs",
    difficulty: "Hard",
    included: [
      { icon: "route", text: "The exact GPS track I rode, ready to load onto your device" },
      { icon: "guide", text: "A short written guide" },
      { icon: "photos", text: "Real photos from the road" },
      { icon: "logistics", text: "Honest notes on altitude, traffic, and safety" },
    ],
    image: placeholderImage("kit-colombia", 800, 600),
    gallery: [
      placeholderImage("kit-colombia-2", 600, 450),
      placeholderImage("kit-colombia-3", 600, 450),
      placeholderImage("kit-colombia-4", 600, 450),
    ],
  },
];

export type GuidedTrip = {
  slug: string;
  title: string;
  location: string;
  priceFrom: number;
  maxRiders: number;
  difficulty: number; // out of 5
  image: string;
  comingSoon?: boolean;
  /** Below here: fields for the trip's own detail page
   *  (/product-page/[slug], see components/shop-trips/Detail.tsx). */
  days?: number;
  /** Extra photos for the detail page's gallery, alongside `image` (the
   *  main photo) — the first entry renders wide, the rest 2-up beside it. */
  gallery?: string[];
  about?: string;
  /** The checklist under "What's included" — each item carries its own
   *  icon key (see INCLUDED_ICONS in shop-trips/Detail.tsx) instead of a
   *  generic checkmark, per explicit request. */
  included?: { icon: IncludedIconKey; text: string }[];
  whatMakesSpecial?: { text: string; image: string };
  datesBlurb?: string;
  team?: { name: string; role: string; bio: string; avatar: string };
};

/** Icon keys for the "What's included" checklist — one per feature category,
 *  rendered by INCLUDED_ICONS in shop-trips/Detail.tsx. */
export type IncludedIconKey =
  | "guide"
  | "stay"
  | "meals"
  | "mechanic"
  | "transfer"
  | "ferry"
  | "vehicle"
  | "route"
  | "insurance"
  | "group";

// Only the Indonesia trip is real/confirmed so far — the rest are the same
// placeholder card duplicated up to 8 so the /shop-trips grid reads as
// "full" during layout work, per the explicit request. Swap each one's
// content (and add real image paths) as more guided trips get confirmed.
export const guidedTrips: GuidedTrip[] = [
  {
    slug: "indonesia-volcanoes",
    title: "15 Days in Indonesia, Volcanoes & Rice Fields",
    location: "Indonesia",
    priceFrom: 2900,
    maxRiders: 5,
    difficulty: 3,
    image: "/images/trips/indonesia-volcanoes.jpg",
    comingSoon: true,
    days: 15,
    gallery: [
      placeholderImage("trip-indonesia-1-gallery-2", 800, 600),
      placeholderImage("trip-indonesia-1-gallery-3", 600, 450),
      placeholderImage("trip-indonesia-1-gallery-4", 600, 450),
    ],
    about:
      "Fifteen days riding volcanoes, rice terraces and quiet fishing villages across Java and the Lesser Sundas — the exact route I rode myself before ever bringing a group. Expect early starts, big climbs, and a group small enough that nobody gets left behind. I ride alongside you the whole way and handle everything else: route-finding, logistics, and the inevitable flat tyre.",
    included: [
      { icon: "guide", text: "Guided riding every day with Aleix or a trusted local guide" },
      { icon: "stay", text: "All accommodation, from homestays to simple hotels" },
      { icon: "meals", text: "Breakfast and dinner included throughout" },
      { icon: "mechanic", text: "Bike mechanic support and spare parts on the road" },
      { icon: "transfer", text: "Airport transfers on arrival and departure" },
      { icon: "ferry", text: "Ferry crossings between islands" },
      { icon: "vehicle", text: "Support vehicle for luggage and rest days" },
      { icon: "route", text: "GPS tracks and a day-by-day route guide" },
      { icon: "insurance", text: "Local SIM card and travel insurance guidance" },
      { icon: "group", text: "A small group — never more than 5 riders" },
    ],
    whatMakesSpecial: {
      text:
        "This isn't a route I planned from a map — it's one I've ridden, got lost on, and ridden again until I knew exactly where the good stops are. You get the climbs everyone talks about and the ones nobody does, the best warung on the whole island, and a group small enough to actually ride together.",
      image: placeholderImage("trip-indonesia-1-special", 1200, 750),
    },
    datesBlurb:
      "Let's plan it together. We'll adapt the dates to your schedule and find the best time for your trip.",
    team: {
      name: "Aleix Mayor",
      role: "Founder & lead guide",
      bio:
        "Cabin crew for almost 12 years and a long-distance cyclist for longer — I've ridden every guided trip route myself before ever bringing a group along, so when I say I know the road, I mean it.",
      avatar: placeholderImage("team-aleix", 400, 400),
    },
  },
  {
    slug: "oman-desert-mountains",
    title: "12 Days in Oman, Desert & Mountains",
    location: "Oman",
    priceFrom: 2600,
    maxRiders: 5,
    difficulty: 4,
    image: "/images/trips/oman-desert-mountains.jpg",
    comingSoon: true,
    days: 12,
    gallery: [
      placeholderImage("trip-indonesia-2-gallery-2", 800, 600),
      placeholderImage("trip-indonesia-2-gallery-3", 600, 450),
      placeholderImage("trip-indonesia-2-gallery-4", 600, 450),
    ],
    about:
      "Twelve days riding desert roads, mountain passes and quiet coastal villages across Oman — the exact route I rode myself before ever bringing a group. Expect early starts, big climbs, and a group small enough that nobody gets left behind. I ride alongside you the whole way and handle everything else: route-finding, logistics, and the inevitable flat tyre.",
    included: [
      { icon: "guide", text: "Guided riding every day with Aleix or a trusted local guide" },
      { icon: "stay", text: "All accommodation, from homestays to simple hotels" },
      { icon: "meals", text: "Breakfast and dinner included throughout" },
      { icon: "mechanic", text: "Bike mechanic support and spare parts on the road" },
      { icon: "transfer", text: "Airport transfers on arrival and departure" },
      { icon: "vehicle", text: "Support vehicle for luggage and rest days" },
      { icon: "route", text: "GPS tracks and a day-by-day route guide" },
      { icon: "insurance", text: "Local SIM card and travel insurance guidance" },
      { icon: "group", text: "A small group — never more than 5 riders" },
    ],
    whatMakesSpecial: {
      text:
        "This isn't a route I planned from a map — it's one I've ridden, got lost on, and ridden again until I knew exactly where the good stops are. You get the climbs everyone talks about and the ones nobody does, the best roadside coffee stops in the whole country, and a group small enough to actually ride together.",
      image: placeholderImage("trip-indonesia-2-special", 1200, 750),
    },
    datesBlurb:
      "Let's plan it together. We'll adapt the dates to your schedule and find the best time for your trip.",
    team: {
      name: "Aleix Mayor",
      role: "Founder & lead guide",
      bio:
        "Cabin crew for almost 12 years and a long-distance cyclist for longer — I've ridden every guided trip route myself before ever bringing a group along, so when I say I know the road, I mean it.",
      avatar: placeholderImage("team-aleix", 400, 400),
    },
  },
  {
    slug: "indonesia-volcanoes-3",
    title: "9 Days in Indonesia, Volcanoes & Rice Fields",
    location: "Indonesia",
    priceFrom: 2200,
    maxRiders: 5,
    difficulty: 4,
    image: placeholderImage("trip-indonesia-3", 800, 900),
    comingSoon: true,
    days: 9,
    gallery: [
      placeholderImage("trip-indonesia-3-gallery-2", 800, 600),
      placeholderImage("trip-indonesia-3-gallery-3", 600, 450),
      placeholderImage("trip-indonesia-3-gallery-4", 600, 450),
    ],
    about:
      "Nine days riding volcanoes, rice terraces and quiet fishing villages across Java and the Lesser Sundas — the exact route I rode myself before ever bringing a group. Expect early starts, big climbs, and a group small enough that nobody gets left behind. I ride alongside you the whole way and handle everything else: route-finding, logistics, and the inevitable flat tyre.",
    included: [
      { icon: "guide", text: "Guided riding every day with Aleix or a trusted local guide" },
      { icon: "stay", text: "All accommodation, from homestays to simple hotels" },
      { icon: "meals", text: "Breakfast and dinner included throughout" },
      { icon: "mechanic", text: "Bike mechanic support and spare parts on the road" },
      { icon: "transfer", text: "Airport transfers on arrival and departure" },
      { icon: "ferry", text: "Ferry crossings between islands" },
      { icon: "vehicle", text: "Support vehicle for luggage and rest days" },
      { icon: "route", text: "GPS tracks and a day-by-day route guide" },
      { icon: "insurance", text: "Local SIM card and travel insurance guidance" },
      { icon: "group", text: "A small group — never more than 5 riders" },
    ],
    whatMakesSpecial: {
      text:
        "This isn't a route I planned from a map — it's one I've ridden, got lost on, and ridden again until I knew exactly where the good stops are. You get the climbs everyone talks about and the ones nobody does, the best warung on the whole island, and a group small enough to actually ride together.",
      image: placeholderImage("trip-indonesia-3-special", 1200, 750),
    },
    datesBlurb:
      "Let's plan it together. We'll adapt the dates to your schedule and find the best time for your trip.",
    team: {
      name: "Aleix Mayor",
      role: "Founder & lead guide",
      bio:
        "Cabin crew for almost 12 years and a long-distance cyclist for longer — I've ridden every guided trip route myself before ever bringing a group along, so when I say I know the road, I mean it.",
      avatar: placeholderImage("team-aleix", 400, 400),
    },
  },
  {
    slug: "indonesia-volcanoes-4",
    title: "9 Days in Indonesia, Volcanoes & Rice Fields",
    location: "Indonesia",
    priceFrom: 2200,
    maxRiders: 5,
    difficulty: 4,
    image: placeholderImage("trip-indonesia-4", 800, 900),
    comingSoon: true,
    days: 9,
    gallery: [
      placeholderImage("trip-indonesia-4-gallery-2", 800, 600),
      placeholderImage("trip-indonesia-4-gallery-3", 600, 450),
      placeholderImage("trip-indonesia-4-gallery-4", 600, 450),
    ],
    about:
      "Nine days riding volcanoes, rice terraces and quiet fishing villages across Java and the Lesser Sundas — the exact route I rode myself before ever bringing a group. Expect early starts, big climbs, and a group small enough that nobody gets left behind. I ride alongside you the whole way and handle everything else: route-finding, logistics, and the inevitable flat tyre.",
    included: [
      { icon: "guide", text: "Guided riding every day with Aleix or a trusted local guide" },
      { icon: "stay", text: "All accommodation, from homestays to simple hotels" },
      { icon: "meals", text: "Breakfast and dinner included throughout" },
      { icon: "mechanic", text: "Bike mechanic support and spare parts on the road" },
      { icon: "transfer", text: "Airport transfers on arrival and departure" },
      { icon: "ferry", text: "Ferry crossings between islands" },
      { icon: "vehicle", text: "Support vehicle for luggage and rest days" },
      { icon: "route", text: "GPS tracks and a day-by-day route guide" },
      { icon: "insurance", text: "Local SIM card and travel insurance guidance" },
      { icon: "group", text: "A small group — never more than 5 riders" },
    ],
    whatMakesSpecial: {
      text:
        "This isn't a route I planned from a map — it's one I've ridden, got lost on, and ridden again until I knew exactly where the good stops are. You get the climbs everyone talks about and the ones nobody does, the best warung on the whole island, and a group small enough to actually ride together.",
      image: placeholderImage("trip-indonesia-4-special", 1200, 750),
    },
    datesBlurb:
      "Let's plan it together. We'll adapt the dates to your schedule and find the best time for your trip.",
    team: {
      name: "Aleix Mayor",
      role: "Founder & lead guide",
      bio:
        "Cabin crew for almost 12 years and a long-distance cyclist for longer — I've ridden every guided trip route myself before ever bringing a group along, so when I say I know the road, I mean it.",
      avatar: placeholderImage("team-aleix", 400, 400),
    },
  },
  {
    slug: "indonesia-volcanoes-5",
    title: "9 Days in Indonesia, Volcanoes & Rice Fields",
    location: "Indonesia",
    priceFrom: 2200,
    maxRiders: 5,
    difficulty: 4,
    image: placeholderImage("trip-indonesia-5", 800, 900),
    comingSoon: true,
    days: 9,
    gallery: [
      placeholderImage("trip-indonesia-5-gallery-2", 800, 600),
      placeholderImage("trip-indonesia-5-gallery-3", 600, 450),
      placeholderImage("trip-indonesia-5-gallery-4", 600, 450),
    ],
    about:
      "Nine days riding volcanoes, rice terraces and quiet fishing villages across Java and the Lesser Sundas — the exact route I rode myself before ever bringing a group. Expect early starts, big climbs, and a group small enough that nobody gets left behind. I ride alongside you the whole way and handle everything else: route-finding, logistics, and the inevitable flat tyre.",
    included: [
      { icon: "guide", text: "Guided riding every day with Aleix or a trusted local guide" },
      { icon: "stay", text: "All accommodation, from homestays to simple hotels" },
      { icon: "meals", text: "Breakfast and dinner included throughout" },
      { icon: "mechanic", text: "Bike mechanic support and spare parts on the road" },
      { icon: "transfer", text: "Airport transfers on arrival and departure" },
      { icon: "ferry", text: "Ferry crossings between islands" },
      { icon: "vehicle", text: "Support vehicle for luggage and rest days" },
      { icon: "route", text: "GPS tracks and a day-by-day route guide" },
      { icon: "insurance", text: "Local SIM card and travel insurance guidance" },
      { icon: "group", text: "A small group — never more than 5 riders" },
    ],
    whatMakesSpecial: {
      text:
        "This isn't a route I planned from a map — it's one I've ridden, got lost on, and ridden again until I knew exactly where the good stops are. You get the climbs everyone talks about and the ones nobody does, the best warung on the whole island, and a group small enough to actually ride together.",
      image: placeholderImage("trip-indonesia-5-special", 1200, 750),
    },
    datesBlurb:
      "Let's plan it together. We'll adapt the dates to your schedule and find the best time for your trip.",
    team: {
      name: "Aleix Mayor",
      role: "Founder & lead guide",
      bio:
        "Cabin crew for almost 12 years and a long-distance cyclist for longer — I've ridden every guided trip route myself before ever bringing a group along, so when I say I know the road, I mean it.",
      avatar: placeholderImage("team-aleix", 400, 400),
    },
  },
  {
    slug: "indonesia-volcanoes-6",
    title: "9 Days in Indonesia, Volcanoes & Rice Fields",
    location: "Indonesia",
    priceFrom: 2200,
    maxRiders: 5,
    difficulty: 4,
    image: placeholderImage("trip-indonesia-6", 800, 900),
    comingSoon: true,
    days: 9,
    gallery: [
      placeholderImage("trip-indonesia-6-gallery-2", 800, 600),
      placeholderImage("trip-indonesia-6-gallery-3", 600, 450),
      placeholderImage("trip-indonesia-6-gallery-4", 600, 450),
    ],
    about:
      "Nine days riding volcanoes, rice terraces and quiet fishing villages across Java and the Lesser Sundas — the exact route I rode myself before ever bringing a group. Expect early starts, big climbs, and a group small enough that nobody gets left behind. I ride alongside you the whole way and handle everything else: route-finding, logistics, and the inevitable flat tyre.",
    included: [
      { icon: "guide", text: "Guided riding every day with Aleix or a trusted local guide" },
      { icon: "stay", text: "All accommodation, from homestays to simple hotels" },
      { icon: "meals", text: "Breakfast and dinner included throughout" },
      { icon: "mechanic", text: "Bike mechanic support and spare parts on the road" },
      { icon: "transfer", text: "Airport transfers on arrival and departure" },
      { icon: "ferry", text: "Ferry crossings between islands" },
      { icon: "vehicle", text: "Support vehicle for luggage and rest days" },
      { icon: "route", text: "GPS tracks and a day-by-day route guide" },
      { icon: "insurance", text: "Local SIM card and travel insurance guidance" },
      { icon: "group", text: "A small group — never more than 5 riders" },
    ],
    whatMakesSpecial: {
      text:
        "This isn't a route I planned from a map — it's one I've ridden, got lost on, and ridden again until I knew exactly where the good stops are. You get the climbs everyone talks about and the ones nobody does, the best warung on the whole island, and a group small enough to actually ride together.",
      image: placeholderImage("trip-indonesia-6-special", 1200, 750),
    },
    datesBlurb:
      "Let's plan it together. We'll adapt the dates to your schedule and find the best time for your trip.",
    team: {
      name: "Aleix Mayor",
      role: "Founder & lead guide",
      bio:
        "Cabin crew for almost 12 years and a long-distance cyclist for longer — I've ridden every guided trip route myself before ever bringing a group along, so when I say I know the road, I mean it.",
      avatar: placeholderImage("team-aleix", 400, 400),
    },
  },
  {
    slug: "indonesia-volcanoes-7",
    title: "9 Days in Indonesia, Volcanoes & Rice Fields",
    location: "Indonesia",
    priceFrom: 2200,
    maxRiders: 5,
    difficulty: 4,
    image: placeholderImage("trip-indonesia-7", 800, 900),
    comingSoon: true,
    days: 9,
    gallery: [
      placeholderImage("trip-indonesia-7-gallery-2", 800, 600),
      placeholderImage("trip-indonesia-7-gallery-3", 600, 450),
      placeholderImage("trip-indonesia-7-gallery-4", 600, 450),
    ],
    about:
      "Nine days riding volcanoes, rice terraces and quiet fishing villages across Java and the Lesser Sundas — the exact route I rode myself before ever bringing a group. Expect early starts, big climbs, and a group small enough that nobody gets left behind. I ride alongside you the whole way and handle everything else: route-finding, logistics, and the inevitable flat tyre.",
    included: [
      { icon: "guide", text: "Guided riding every day with Aleix or a trusted local guide" },
      { icon: "stay", text: "All accommodation, from homestays to simple hotels" },
      { icon: "meals", text: "Breakfast and dinner included throughout" },
      { icon: "mechanic", text: "Bike mechanic support and spare parts on the road" },
      { icon: "transfer", text: "Airport transfers on arrival and departure" },
      { icon: "ferry", text: "Ferry crossings between islands" },
      { icon: "vehicle", text: "Support vehicle for luggage and rest days" },
      { icon: "route", text: "GPS tracks and a day-by-day route guide" },
      { icon: "insurance", text: "Local SIM card and travel insurance guidance" },
      { icon: "group", text: "A small group — never more than 5 riders" },
    ],
    whatMakesSpecial: {
      text:
        "This isn't a route I planned from a map — it's one I've ridden, got lost on, and ridden again until I knew exactly where the good stops are. You get the climbs everyone talks about and the ones nobody does, the best warung on the whole island, and a group small enough to actually ride together.",
      image: placeholderImage("trip-indonesia-7-special", 1200, 750),
    },
    datesBlurb:
      "Let's plan it together. We'll adapt the dates to your schedule and find the best time for your trip.",
    team: {
      name: "Aleix Mayor",
      role: "Founder & lead guide",
      bio:
        "Cabin crew for almost 12 years and a long-distance cyclist for longer — I've ridden every guided trip route myself before ever bringing a group along, so when I say I know the road, I mean it.",
      avatar: placeholderImage("team-aleix", 400, 400),
    },
  },
  {
    slug: "indonesia-volcanoes-8",
    title: "9 Days in Indonesia, Volcanoes & Rice Fields",
    location: "Indonesia",
    priceFrom: 2200,
    maxRiders: 5,
    difficulty: 4,
    image: placeholderImage("trip-indonesia-8", 800, 900),
    comingSoon: true,
    days: 9,
    gallery: [
      placeholderImage("trip-indonesia-8-gallery-2", 800, 600),
      placeholderImage("trip-indonesia-8-gallery-3", 600, 450),
      placeholderImage("trip-indonesia-8-gallery-4", 600, 450),
    ],
    about:
      "Nine days riding volcanoes, rice terraces and quiet fishing villages across Java and the Lesser Sundas — the exact route I rode myself before ever bringing a group. Expect early starts, big climbs, and a group small enough that nobody gets left behind. I ride alongside you the whole way and handle everything else: route-finding, logistics, and the inevitable flat tyre.",
    included: [
      { icon: "guide", text: "Guided riding every day with Aleix or a trusted local guide" },
      { icon: "stay", text: "All accommodation, from homestays to simple hotels" },
      { icon: "meals", text: "Breakfast and dinner included throughout" },
      { icon: "mechanic", text: "Bike mechanic support and spare parts on the road" },
      { icon: "transfer", text: "Airport transfers on arrival and departure" },
      { icon: "ferry", text: "Ferry crossings between islands" },
      { icon: "vehicle", text: "Support vehicle for luggage and rest days" },
      { icon: "route", text: "GPS tracks and a day-by-day route guide" },
      { icon: "insurance", text: "Local SIM card and travel insurance guidance" },
      { icon: "group", text: "A small group — never more than 5 riders" },
    ],
    whatMakesSpecial: {
      text:
        "This isn't a route I planned from a map — it's one I've ridden, got lost on, and ridden again until I knew exactly where the good stops are. You get the climbs everyone talks about and the ones nobody does, the best warung on the whole island, and a group small enough to actually ride together.",
      image: placeholderImage("trip-indonesia-8-special", 1200, 750),
    },
    datesBlurb:
      "Let's plan it together. We'll adapt the dates to your schedule and find the best time for your trip.",
    team: {
      name: "Aleix Mayor",
      role: "Founder & lead guide",
      bio:
        "Cabin crew for almost 12 years and a long-distance cyclist for longer — I've ridden every guided trip route myself before ever bringing a group along, so when I say I know the road, I mean it.",
      avatar: placeholderImage("team-aleix", 400, 400),
    },
  },
];
