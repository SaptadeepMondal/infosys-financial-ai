/** @type {import('tailwindcss').Config} */

/*
 * PREMIUM GLASSMORPHISM DESIGN SYSTEM
 * ------------------------------------
 * Deep navy / midnight surfaces, indigo primary accent, violet secondary accent.
 *
 * NOTE: the legacy `emerald` / `cyan` / `teal` palettes are intentionally
 * remapped to the new indigo & violet ramps so that the entire existing
 * component tree adopts the new brand system without any behavioural change.
 */

const indigo = {
  50: "#EEF1FF",
  100: "#E0E5FF",
  200: "#C7CFFE",
  300: "#A9B4FC",
  400: "#8C99FA",
  500: "#6366F1",
  600: "#5145E5",
  700: "#4338CA",
  800: "#3730A3",
  900: "#28226B",
  950: "#1B1745",
};

const violet = {
  50: "#F5F1FF",
  100: "#EDE6FF",
  200: "#DDD0FE",
  300: "#C4AFFC",
  400: "#A98BF9",
  500: "#8B5CF6",
  600: "#7C3AED",
  700: "#6D28D9",
  800: "#5B21B6",
  900: "#3F1780",
  950: "#2A0F58",
};

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core application surfaces
        terminal: {
          dark: "#070B16",
          deep: "#050810",
          card: "#0E1426",
          border: "#222C45",
          hover: "#161F36",
          accent: indigo[500],
          cyan: violet[500],
          amber: "#F0B429",
          rose: "#F0526D",
        },
        // Brand ramps
        brand: indigo,
        accent: violet,
        // Legacy palette remaps (keeps existing markup on-system)
        emerald: indigo,
        teal: violet,
        cyan: violet,
        rose: {
          50: "#FFF1F3",
          100: "#FFE0E5",
          200: "#FFC5CE",
          300: "#FF9AAA",
          400: "#F97185",
          500: "#F0526D",
          600: "#D93A57",
          700: "#B02A44",
          800: "#7E1E31",
          900: "#4E1220",
          950: "#320B15",
        },
        amber: {
          50: "#FFF9EB",
          100: "#FEF0C7",
          200: "#FDE28F",
          300: "#FBD156",
          400: "#F5C13B",
          500: "#F0B429",
          600: "#D2941A",
          700: "#A46F13",
          800: "#6E4A0E",
          900: "#432D09",
          950: "#2A1C06",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', "system-ui", "sans-serif"],
        display: ['"Plus Jakarta Sans"', '"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        // Ambient brand glows
        "glow-emerald": "0 0 0 1px rgba(99,102,241,0.14), 0 18px 40px -22px rgba(99,102,241,0.55)",
        "glow-cyan": "0 0 0 1px rgba(139,92,246,0.14), 0 18px 40px -22px rgba(139,92,246,0.55)",
        "glow-indigo": "0 0 0 1px rgba(99,102,241,0.14), 0 18px 40px -22px rgba(99,102,241,0.55)",
        "glow-violet": "0 0 0 1px rgba(139,92,246,0.14), 0 18px 40px -22px rgba(139,92,246,0.55)",
        // Layered depth for glass surfaces
        glass: "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 20px 45px -30px rgba(2,6,23,0.9)",
        "glass-lg": "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 40px 80px -40px rgba(2,6,23,0.95)",
        lift: "0 24px 50px -32px rgba(99,102,241,0.45)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "translateY(8px) scale(0.97)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(0,-18px,0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.35s ease-out both",
        fadeUp: "fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both",
        scaleIn: "scaleIn 0.22s cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 1.8s infinite",
        float: "float 14s ease-in-out infinite",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
