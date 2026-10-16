/**
 * Temporary stand-in photos.
 *
 * We can't pull the exact images from your Figma file automatically (Figma's
 * asset server is blocked by your account's network policy, both in this
 * cloud workspace and via the device bridge), so this returns a stable
 * placeholder photo instead of a blank box. Swap it out any time by
 * dropping a real file in `public/images/...` and changing the call site
 * back to a local path, e.g. `/images/hero.jpg`.
 */
export function placeholderImage(seed: string, width = 800, height = 600) {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}
