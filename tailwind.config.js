import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        mobile: { max: "767px" },
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
        "3xs": ["0.5rem", { lineHeight: "0.625rem" }],
      },
      colors: {
        yellow: { DEFAULT: "#e6c229", foreground: "#0F0F0E" },
        orange: { DEFAULT: "#f17105", foreground: "#FAF9F5" },
        red: { DEFAULT: "#d11149", foreground: "#FAF9F5" },
        purple: { DEFAULT: "#6610f2", foreground: "#FAF9F5" },
        blue: { DEFAULT: "#1a8fe3", foreground: "#FAF9F5" },
        black: { DEFAULT: "#0F0F0E", foreground: "#FAF9F5" },
        white: { DEFAULT: "#FAF9F5", foreground: "#0F0F0E" },
        grey: { DEFAULT: "#7F7F7F", foreground: "#FAF9F5" },
        lightgrey: { DEFAULT: "#E5E5E5", foreground: "#0F0F0E" },
        
        // Retain semantic mappings but override for dynamic Wrapped theme
        primary: { DEFAULT: "#0F0F0E", foreground: "#FAF9F5" },
        secondary: { DEFAULT: "#6610f2", foreground: "#FAF9F5" },
        warning: { DEFAULT: "#e6c229", foreground: "#0F0F0E" },
      },
      fontFamily: {
        "noto-emoji": ['"Noto Color Emoji"', "sans-serif"],
        sans: ["Space Grotesk", "sans-serif"],
        mixtape: ["Space Grotesk", "sans-serif"],
        mono: ["Space Grotesk", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: "#FAF9F5",
            foreground: "#0F0F0E",
            primary: {
              DEFAULT: "#0F0F0E",
              foreground: "#FAF9F5",
            },
            secondary: {
              DEFAULT: "#71db00",
              foreground: "#0F0F0E",
            },
            warning: {
              DEFAULT: "#ffd500",
              foreground: "#0F0F0E",
            },
            divider: "#0F0F0E",
            focus: "#0F0F0E",
          },
        },
        dark: {
          colors: {
            background: "#1E1E1E",
            foreground: "#FAF9F5",
            primary: {
              DEFAULT: "#FAF9F5",
              foreground: "#0F0F0E",
            },
            secondary: {
              DEFAULT: "#c11cfc",
              foreground: "#FAF9F5",
            },
            warning: {
              DEFAULT: "#ffd500",
              foreground: "#0F0F0E",
            },
            divider: "#FAF9F5",
            focus: "#FAF9F5",
          },
        },
      },
    }),
  ],
};
