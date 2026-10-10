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
        // Linear-inspired dark workspace foundation
        workspace: {
          bg: "#090D12",
          surface: "#111827",
          subtle: "#161F2E",
          elevated: "#1A2333",
          border: "#1E293B",
          "border-subtle": "#16202E",
        },
        // Canonical color mappings
        canvas: {
          DEFAULT: "var(--background, #090D12)",
          dark: "#090D12",
        },
        background: "var(--background, #090D12)",
        sidebar: "var(--sidebar, #0D1117)",
        surface: "var(--surface, #111827)",
        "surface-subtle": "var(--surface-subtle, #161F2E)",
        elevated: "var(--elevated, #1A2333)",
        border: "var(--border, #1E293B)",
        foreground: "var(--foreground, #F0F6FC)",
        muted: "var(--muted, #8B949E)",

        // Single Muted Blue Accent for primary actions and selected states
        accent: {
          DEFAULT: "#388BFD",
          hover: "#3178DE",
          subtle: "rgba(56, 139, 253, 0.12)",
          border: "rgba(56, 139, 253, 0.25)",
        },
        primary: {
          DEFAULT: "#388BFD",
          hover: "#3178DE",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#161F2E",
          hover: "#1E293B",
          foreground: "#F0F6FC",
        },

        // Functional states (subtle, restrained)
        success: "#238636",
        warning: "#D29922",
        danger: "#F85149",

        // Backward compatibility mappings
        lime: {
          DEFAULT: "#388BFD",
          hover: "#3178DE",
          light: "#EBF5FF",
          dark: "#1D4ED8",
          ink: "#FFFFFF",
        },
        iris: {
          DEFAULT: "#388BFD",
          hover: "#3178DE",
          light: "#EBF5FF",
          border: "#1E293B",
          dark: "#1D4ED8",
        },
        coral: {
          DEFAULT: "#F85149",
          hover: "#DA3633",
          light: "rgba(248, 81, 73, 0.15)",
          border: "#1E293B",
          dark: "#B62324",
        },
        mint: {
          DEFAULT: "#238636",
          hover: "#2EA043",
          light: "rgba(35, 134, 54, 0.15)",
          border: "#1E293B",
          dark: "#196C2E",
        },
        lilac: {
          DEFAULT: "#8B949E",
          hover: "#A3ADC2",
          light: "rgba(139, 148, 158, 0.15)",
          border: "#1E293B",
          dark: "#6E7681",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Geist",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "Geist",
          "Inter",
          "-apple-system",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "Geist Mono",
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      borderRadius: {
        md: "6px",
        lg: "8px",
        xl: "12px",
        "2xl": "14px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
        panel: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
        popover: "0 8px 30px -4px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [],
};
export default config;
