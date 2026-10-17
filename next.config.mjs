import { fileURLToPath } from "url";
import path from "path";
import { SHOW_GUIDED_TRIPS, SHOW_KITS, SHOW_NEWS } from "./src/lib/features.mjs";

// Next.js was inferring the "workspace root" as /Users/ilacasa (your whole
// home folder), not this project folder — because it found a second,
// unrelated package-lock.json sitting directly in your home directory (see
// the "Detected additional lockfiles" warning during `npm run build`). With
// that wider root, Next.js's build-trace step walks your ENTIRE home
// folder looking for files to trace, including ~/.Trash — which macOS
// blocks access to without Full Disk Access — causing the
// "EPERM: operation not permitted, scandir '/Users/ilacasa/.Trash'" error
// during `vercel --prod`. Pinning outputFileTracingRoot to this project's
// own folder stops it from ever looking outside it.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
  outputFileTracingRoot: __dirname,
  // Sections switched off in src/lib/features.mjs send visitors back to the
  // home page instead (temporary 307, so nothing gets cached as permanent).
  // Product pages host both kits and trips, so the whole route only
  // redirects when both are off — otherwise the page itself redirects the
  // hidden type (see app/product-page/[slug]/page.tsx).
  async redirects() {
    const toHome = (source) => ({ source, destination: "/", permanent: false });
    return [
      ...(SHOW_GUIDED_TRIPS ? [] : [toHome("/shop-trips")]),
      ...(SHOW_KITS ? [] : [toHome("/shop-kits"), toHome("/product-page/:slug/checkout")]),
      ...(SHOW_GUIDED_TRIPS || SHOW_KITS ? [] : [toHome("/product-page/:path*")]),
      ...(SHOW_NEWS ? [] : [toHome("/news"), toHome("/news/:path*")]),
    ];
  },
};

export default nextConfig;
