import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f7f8",
          100: "#ededef",
          200: "#d8d8dc",
          300: "#b8b8bf",
          400: "#8e8e98",
          500: "#6b6b75",
          600: "#525258",
          700: "#3f3f44",
          800: "#28282c",
          900: "#19191c",
          950: "#0e0e10",
        },
        calm: {
          50: "#f3f5fb",
          100: "#e6eaf6",
          200: "#c8d2ec",
          300: "#9bafdd",
          400: "#6c87ca",
          500: "#4a68b6",
          600: "#39529a",
          700: "#30437c",
          800: "#2b3a65",
          900: "#283356",
        },
        warm: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "PingFang TC",
          "Noto Sans TC",
          "system-ui",
          "sans-serif",
        ],
      },
      animation: {
        "breath-in": "breath-in 4s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
      },
      keyframes: {
        "breath-in": {
          "0%, 100%": { transform: "scale(0.85)", opacity: "0.6" },
          "50%": { transform: "scale(1.1)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
