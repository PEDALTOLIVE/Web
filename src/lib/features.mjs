// Site-wide on/off switches for whole sections of the site.
//
// Set a flag to `false` to HIDE that part of the site without deleting
// anything: its pages redirect to the home page (see next.config.mjs), its
// home-page module isn't rendered, and every nav link / button pointing to
// it disappears. Flip it back to `true` to show everything again exactly as
// it was.
//
// Plain .mjs (not .ts) so next.config.mjs can import the very same flags.

/** Guided trips: /shop-trips, trip product pages, the home "Guided trips"
 *  module and every "Book your trip" button. */
export const SHOW_GUIDED_TRIPS = true;

/** Trip kits: /shop-kits, kit product + checkout pages and the home
 *  "Route kits" module. */
export const SHOW_KITS = true;

/** News: /news and every article page. */
export const SHOW_NEWS = true;

/** Kits are listed but NOT purchasable yet: every kit card (home "Route
 *  kits" + /shop-kits) shows greyed out with a "Coming soon" badge, no
 *  price / CTA, not clickable, and kit product + checkout pages redirect to
 *  /shop-kits. Set to false to open the shop. */
export const KITS_COMING_SOON = true;
