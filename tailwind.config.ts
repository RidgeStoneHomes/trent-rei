import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#14202b", soft: "#2a3a48" },
        lake: { DEFAULT: "#1f4e5f", deep: "#123543", light: "#7fa7b3" },
        sand: { DEFAULT: "#f5efe6", deep: "#e8dccb" },
        brass: { DEFAULT: "#b08d57", light: "#d4b98a", dark: "#8a6a3b" },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      letterSpacing: { luxe: "0.25em" },
    },
  },
  plugins: [],
} satisfies Config;
