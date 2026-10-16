import { fileURLToPath } from "url";
import path from "path";

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
};

export default nextConfig;
