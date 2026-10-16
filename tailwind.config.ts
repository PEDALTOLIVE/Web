import type { Config } from "tailwindcss";

// Design tokens extracted directly from Figma variables
// (file key IRWtjUq2Gw0d8aBvOPNO5p, Home page) via the Figma MCP.
// Pair "serif" tokens (Young Serif, weight 400) with the `font-serif` class,
// and "sans" tokens (Inter, weight 500) with the default `font-sans` class.
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E75838", // burnt orange accent
        secondary: "#E4D8CD", // warm cream
        dark: "#1B1F1A", // near-black background
        light: "#FFFFFF",
        neutral: {
          100: "#EFEFEF",
          300: "#DFDFDF",
        },
        grey: {
          100: "#EFEFEF",
          300: "#D9D9D9",
        },
      },
      fontFamily: {
        serif: ["var(--font-young-serif)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Display / heading scale — use with `font-serif` (Young Serif, 400)
        // except h2 / h4 which are Inter Medium (500) per Figma.
        "display-1": ["128px", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "400" }],
        "display-2": ["80px", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "400" }],
        h1: ["52px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "400" }],
        h2: ["52px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "500" }],
        h3: ["40px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "400" }],
        h4: ["40px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "500" }],
        // Body copy scale (Inter Medium, 500)
        "body-xl": ["32px", { lineHeight: "1.3", letterSpacing: "-0.02em", fontWeight: "500" }],
        "body-l": ["28px", { lineHeight: "1.4", letterSpacing: "-0.02em", fontWeight: "500" }],
        "body-m": ["24px", { lineHeight: "1.4", letterSpacing: "-0.02em", fontWeight: "500" }],
        "body-s": ["20px", { lineHeight: "1.3", letterSpacing: "-0.02em", fontWeight: "500" }],
        "body-xs": ["16px", { lineHeight: "1.4", letterSpacing: "0em", fontWeight: "500" }],
        // Small mono "detail" labels (IBM Plex Mono Medium, 500), used
        // uppercase for eyebrows and tags.
        "detail-m": ["16px", { lineHeight: "1.4", letterSpacing: "-0.03em", fontWeight: "500" }],
        "detail-s": ["14px", { lineHeight: "1.2", letterSpacing: "-0.03em", fontWeight: "500" }],
      },
      boxShadow: {
        sm: "0 3px 8px -1px rgba(50,50,71,0.05), 0 0 1px 0 rgba(12,26,75,0.24)",
      },
      maxWidth: {
        content: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
