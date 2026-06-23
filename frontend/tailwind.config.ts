import type { Config } from "tailwindcss";

// Colors and animations are defined via @theme in globals.css (Tailwind v4 CSS-first config).
// This file is kept for compatibility but the @theme block in globals.css takes precedence.
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {},
  plugins: [],
};

export default config;
