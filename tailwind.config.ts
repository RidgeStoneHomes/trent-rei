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
        ember: { DEFAULT: "#d9774b", light: "#f0a77f" },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      letterSpacing: { luxe: "0.25em" },
      keyframes: {
        drift: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        glow: { "0%,100%": { opacity: "0.85", transform: "scale(1)" }, "50%": { opacity: "1", transform: "scale(1.06)" } },
        shimmer: { "0%,100%": { opacity: "0.15" }, "50%": { opacity: "0.7" } },
        rise: { from: { opacity: "0", transform: "translateY(0.6em)" }, to: { opacity: "1", transform: "none" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
        kenburns: { from: { transform: "scale(1.05)" }, to: { transform: "scale(1.15) translate(-1.5%, -1%)" } },
      },
      animation: {
        "drift-slow": "drift 60s linear infinite",
        "drift-mid": "drift 38s linear infinite",
        "drift-fast": "drift 24s linear infinite",
        marquee: "drift 40s linear infinite",
        glow: "glow 6s ease-in-out infinite",
        shimmer: "shimmer 3.2s ease-in-out infinite",
        rise: "rise 0.9s cubic-bezier(.2,.7,.2,1) both",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
