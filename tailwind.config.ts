import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Core Canvas & Surfaces
        canvas: {
          DEFAULT: "var(--background, #F4F6F9)",
          dark: "#090D14",
        },
        background: "var(--background, #F4F6F9)",
        sidebar: "var(--sidebar, #FFFFFF)",
        surface: "var(--surface, #FFFFFF)",
        elevated: "var(--elevated, #FFFFFF)",
        border: "var(--border, rgba(15, 23, 42, 0.08))",
        foreground: "var(--foreground, #0F172A)",
        muted: "var(--muted, #64748B)",

        // Signature Palette: NO BLUE
        lime: {
          DEFAULT: "#D4F655",
          hover: "#C5EA40",
          light: "#F5FDE0",
          dark: "#84CC16",
          ink: "#0F172A",
        },
        iris: {
          DEFAULT: "#5E43F3",
          hover: "#4D32E5",
          light: "#EEF2FF",
          border: "#C7D2FE",
          dark: "#4338CA",
        },
        coral: {
          DEFAULT: "#FF6B4A",
          hover: "#FA5530",
          light: "#FFF1EE",
          border: "#FED7AA",
          dark: "#C2410C",
        },
        mint: {
          DEFAULT: "#34D399",
          hover: "#10B981",
          light: "#ECFDF5",
          border: "#A7F3D0",
          dark: "#047857",
        },
        lilac: {
          DEFAULT: "#E9D5FF",
          hover: "#DDD6FE",
          light: "#FAF5FF",
          border: "#E9D5FF",
          dark: "#7C3AED",
        },

        // Functional Roles
        primary: {
          DEFAULT: "#D4F655",
          hover: "#C5EA40",
          foreground: "#0F172A",
        },
        secondary: {
          DEFAULT: "#5E43F3",
          hover: "#4D32E5",
          foreground: "#FFFFFF",
        },
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#FF6B4A",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "Outfit",
          "Plus Jakarta Sans",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
        "bento": "1.75rem", // 28px
      },
      boxShadow: {
        bento: "0 10px 30px -5px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02)",
        "bento-hover": "0 20px 40px -10px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.03)",
        "bento-elevated": "0 20px 50px -12px rgba(15, 23, 42, 0.12)",
        pill: "0 4px 14px rgba(212, 246, 85, 0.35)",
        "pill-iris": "0 4px 14px rgba(94, 67, 243, 0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
