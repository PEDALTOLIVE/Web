import { placeholderImage } from "@/lib/placeholder";

// A single block of an article's long-form body. "heading" starts a new
// section; "paragraph" renders normal body copy, except when `highlight`
// is set — that one paragraph renders in the primary color, flanked by
// thin divider lines, per the article detail design.
export type ArticleBlock =
  | { type: "paragraph"; text: string; highlight?: boolean }
  | { type: "heading"; text: string };

export type NewsArticle = {
  slug: string;
  tag: string;
  date: string;
  title: string;
  description: string;
  image: string;
  // Article detail page fields — not used by the /news grid cards.
  tags: string[];
  contributor: string;
  contributorAvatar: string;
  readingTime: string;
  body: ArticleBlock[];
};

const CONTRIBUTOR = "Aleix Mayor";
const CONTRIBUTOR_AVATAR = placeholderImage("contributor-aleix", 200, 200);

// The single lead story shown large at the top of /news — everything else
// (route recaps, kit launches, guides) lives in `newsArticles` below and
// renders in the grid. Images are placeholder photos for now — see
// src/lib/placeholder.ts — swap `image` for a local `/images/...` path once
// real ones are dropped in.
export const highlightArticle: NewsArticle = {
  slug: "atlas-mountain-race-2027",
  tag: "Race announcement",
  date: "September 12, 2026",
  title: "Pedaltolive is racing the Atlas Mountain Race in 2027",
  description:
    "Six days, 1,200 km and 20,000 m of climbing through the High Atlas — here's why I signed up, and what the route kit for it will look like once I'm back.",
  image: placeholderImage("news-highlight", 1200, 900),
  tags: ["Race announcement", "Morocco", "2027"],
  contributor: CONTRIBUTOR,
  contributorAvatar: CONTRIBUTOR_AVATAR,
  readingTime: "4 minutes",
  body: [
    {
      type: "paragraph",
      text: "In 2027 I'm racing the Atlas Mountain Race — roughly 1,200 km and 20,000 m of climbing through Morocco's High Atlas, most of it self-supported. It's the kind of event Pedaltolive was built around, and it's been sitting at the top of my list since the very first trip to Vietnam and Cambodia.",
    },
    {
      type: "paragraph",
      text: "This will be my longest single push yet, and the first time I'm lining up alongside other riders instead of planning a solo route from a blank map. Registration opens in a few weeks, and I'll be posting the training plan and gear list here as they come together.",
    },
    {
      type: "paragraph",
      highlight: true,
      text: "This isn't only a race for me — it's also the testing ground for the next route kit. Every climb, water source and bivouac spot I find along the way will go straight into the Morocco kit once I'm home.",
    },
    { type: "heading", text: "Why the Atlas Mountain Race" },
    {
      type: "paragraph",
      text: "It's remote, it's self-supported, and it crosses terrain that very few route kits anywhere cover in real detail — high mountain passes, Berber villages, and long stretches where the nearest resupply is a genuine question rather than an afterthought. That combination is exactly what pulled me toward bikepacking in the first place.",
    },
    { type: "heading", text: "What happens to the route kit" },
    {
      type: "paragraph",
      text: "I'll be riding with a GPS logger running the whole way, noting water stops, shelter, and the sections that are rideable versus the ones better walked. Once I'm back, that data becomes the Morocco route kit — the same way the Vietnam and Cambodia trip became the first kit this shop ever sold.",
    },
  ],
};

export const newsArticles: NewsArticle[] = [
  {
    slug: "vietnam-cambodia-wrap-up",
    tag: "Trip report",
    date: "November 18, 2025",
    title: "Wrapped: 30 days and 1,900 km across Vietnam and Cambodia",
    description:
      "Rain, rice fields and the route that started it all — a look back at where Pedaltolive began, and what I'd do differently.",
    image: placeholderImage("news-vietnam", 800, 600),
    tags: ["Trip report", "Vietnam", "Cambodia"],
    contributor: CONTRIBUTOR,
    contributorAvatar: CONTRIBUTOR_AVATAR,
    readingTime: "5 minutes",
    body: [
      {
        type: "paragraph",
        text: "Thirty days, roughly 1,900 km, and more flat tyres than I'd like to admit — this trip is the reason Pedaltolive exists. I set out with a rough plan, a secondhand touring bike, and a notebook I ended up filling with turn-by-turn directions that later became the first route kit.",
      },
      {
        type: "paragraph",
        text: "The route ran from the highlands north of Hanoi down through rice terraces and river crossings, into Cambodia along quiet provincial roads that barely show up on any map. Rain followed me for most of the second week, which turned out to be the best possible stress test for the gear list I now recommend to everyone.",
      },
      {
        type: "paragraph",
        highlight: true,
        text: "If there's one thing I'd tell anyone planning something similar: budget twice the time you think you need for river crossings and border towns. The delays weren't setbacks — they were where the trip actually happened.",
      },
      { type: "heading", text: "What worked" },
      {
        type: "paragraph",
        text: "A light setup, a paper map as backup to the GPS, and asking locals for water rather than relying on marked sources. The bike itself needed only one real repair the entire month, which says more about simple gearing than about my mechanical skills.",
      },
      { type: "heading", text: "What I'd change" },
      {
        type: "paragraph",
        text: "More rest days in the first week. I pushed too hard early on and paid for it in the mountains later. The route kit now available in the shop builds in the buffer days I wish I'd taken myself.",
      },
    ],
  },
  {
    slug: "iceland-kit-live",
    tag: "Route kit",
    date: "August 3, 2025",
    title: "New route kit: Iceland's highland gravel line is live",
    description:
      "The exact GPS track, gear list and honest weather advice from my ride across the Icelandic highlands — download it now.",
    image: placeholderImage("news-iceland", 800, 600),
    tags: ["Route kit", "Iceland", "Gravel"],
    contributor: CONTRIBUTOR,
    contributorAvatar: CONTRIBUTOR_AVATAR,
    readingTime: "3 minutes",
    body: [
      {
        type: "paragraph",
        text: "The Iceland highland gravel kit is live in the shop. It follows the F-roads across the interior — river fords, black sand, and long stretches without a single building in sight — and it's the most physically demanding route I've published so far.",
      },
      {
        type: "paragraph",
        highlight: true,
        text: "This one comes with a stronger weather warning than usual: the highland F-roads only open for a short window each summer, and conditions can turn in under an hour. Check the seasonal opening dates before you plan around this kit.",
      },
      { type: "heading", text: "What's in the kit" },
      {
        type: "paragraph",
        text: "The GPS track, a fording guide for the deeper river crossings, a gear list built around wind and cold rather than heat, and notes on the handful of mountain huts where you can actually resupply.",
      },
      { type: "heading", text: "Who it's for" },
      {
        type: "paragraph",
        text: "Riders who are comfortable being genuinely self-sufficient for two to three days at a time. It's not a beginner route, and the kit says so plainly — but it's also one of the most rewarding rides I've done.",
      },
    ],
  },
  {
    slug: "self-sufficient-tips",
    tag: "Guide",
    date: "July 21, 2025",
    title: "Five things I wish I knew before riding self-supported",
    description:
      "From water planning to what actually breaks first — practical lessons from a few thousand kilometres of getting it wrong.",
    image: placeholderImage("news-tips", 800, 600),
    tags: ["Guide", "Bikepacking", "Gear"],
    contributor: CONTRIBUTOR,
    contributorAvatar: CONTRIBUTOR_AVATAR,
    readingTime: "6 minutes",
    body: [
      {
        type: "paragraph",
        text: "A few thousand kilometres of self-supported riding has taught me more than any gear review ever did. These are the five things I'd tell myself before the first trip, back when I thought a bigger frame bag solved every problem.",
      },
      { type: "heading", text: "1. Water planning beats a bigger frame bag" },
      {
        type: "paragraph",
        text: "Carrying capacity matters far less than knowing where the next reliable source is. I now plan water stops before I plan distance for the day.",
      },
      {
        type: "paragraph",
        highlight: true,
        text: "The single biggest change to how I ride: treat water as the thing that decides the route, not the thing you carry enough of to ignore the route.",
      },
      { type: "heading", text: "2. What actually breaks first" },
      {
        type: "paragraph",
        text: "Not the frame, not the drivetrain — it's usually a rack bolt or a worn brake pad, the boring parts nobody checks before leaving. I now do a five-minute bolt check every morning of a trip.",
      },
      { type: "heading", text: "3. Pack for the worst three hours, not the average day" },
      {
        type: "paragraph",
        text: "Most of a trip is comfortable. The gear that matters is what gets you through the one cold, wet, or exhausted stretch — everything else is a nice-to-have.",
      },
    ],
  },
  {
    slug: "oman-desert-kit",
    tag: "Route kit",
    date: "May 30, 2025",
    title: "Oman: self-sufficiency in the heat of the Empty Quarter",
    description:
      "Sand, sun and very few water stops — everything I learned riding across Oman's desert interior is now in the route kit.",
    image: placeholderImage("news-oman", 800, 600),
    tags: ["Route kit", "Oman", "Desert"],
    contributor: CONTRIBUTOR,
    contributorAvatar: CONTRIBUTOR_AVATAR,
    readingTime: "4 minutes",
    body: [
      {
        type: "paragraph",
        text: "Oman's desert interior is one of the quietest places I've ridden — long gravel tracks along the edge of the Empty Quarter, with heat that changes how every part of the plan has to work, from riding hours to how much water you actually carry.",
      },
      {
        type: "paragraph",
        highlight: true,
        text: "Riding here meant starting before sunrise and stopping by early afternoon. The heat isn't a discomfort to push through — past a certain point it's the thing that decides whether the day's plan is even possible.",
      },
      { type: "heading", text: "The route" },
      {
        type: "paragraph",
        text: "Wadis, gravel plains, and a handful of small towns spaced just far enough apart to make water planning the main task of every evening. The full GPS track and resupply notes are in the kit now available in the shop.",
      },
      { type: "heading", text: "Gear that mattered" },
      {
        type: "paragraph",
        text: "Extra water capacity over extra food, light-colored kit, and a proper sun shelter for the midday stop. None of it is exotic — it's just non-negotiable out there.",
      },
    ],
  },
  {
    slug: "first-trip-qa",
    tag: "Q&A",
    date: "April 9, 2025",
    title: "Planning your first bikepacking trip? Start here",
    description:
      "The questions I get asked most — bike setup, how far is too far, and what to pack when you genuinely don't know yet.",
    image: placeholderImage("news-qa", 800, 600),
    tags: ["Q&A", "Beginners", "Gear"],
    contributor: CONTRIBUTOR,
    contributorAvatar: CONTRIBUTOR_AVATAR,
    readingTime: "5 minutes",
    body: [
      {
        type: "paragraph",
        text: "These are the questions that show up most often in my inbox from people planning their first self-supported trip. None of them have one right answer, but here's what I tell people who ask.",
      },
      { type: "heading", text: "Do I need a special bike?" },
      {
        type: "paragraph",
        text: "No. The bike I used for the Vietnam and Cambodia trip was a secondhand touring frame that cost less than the bags I strapped to it. Fit and reliability matter far more than the label on the frame.",
      },
      {
        type: "paragraph",
        highlight: true,
        text: "The bike that gets you out the door and finished is always better than the perfect bike still being researched. Start with what you have.",
      },
      { type: "heading", text: "How far is too far, for a first trip?" },
      {
        type: "paragraph",
        text: "Shorter than you think. A three-day loop close to home teaches you more about your own gear and pace than any amount of reading does, and it's easy to bail out of if something isn't working.",
      },
    ],
  },
];

// Combined list in the site's own chronological order (most recent first) —
// used for the article detail page's Previous/Next pagination. The
// highlight article is the newest, so it leads.
export const allArticles: NewsArticle[] = [highlightArticle, ...newsArticles];

export function getArticleBySlug(slug: string): NewsArticle | undefined {
  return allArticles.find((article) => article.slug === slug);
}

// "Previous" steps back toward the newer end of the list (the direction the
// /news grid itself reads in, top to bottom), "next" steps forward toward
// older articles. Either is undefined at the corresponding end of the list,
// which the detail page uses to hide that pagination button.
export function getAdjacentArticles(slug: string): {
  previous?: NewsArticle;
  next?: NewsArticle;
} {
  const index = allArticles.findIndex((article) => article.slug === slug);
  if (index === -1) return {};
  return {
    previous: index > 0 ? allArticles[index - 1] : undefined,
    next: index < allArticles.length - 1 ? allArticles[index + 1] : undefined,
  };
}
