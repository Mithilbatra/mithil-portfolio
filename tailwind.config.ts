import type { Config } from "tailwindcss";

/**
 * ENGINEERING LOG — Design System (tokens)
 * Colors are exposed as CSS variables in app/globals.css so they can be used
 * both from Tailwind utilities and from raw CSS. See DESIGN_SYSTEM.md.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        panel: "var(--panel)",
        raised: "var(--raised)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        ink: "var(--text)",
        dim: "var(--text-dim)",
        faint: "var(--text-faint)",
        accent: "var(--accent)",
        "accent-dim": "var(--accent-dim)",
        ok: "var(--ok)",
        warn: "var(--warn)",
        crit: "var(--crit)",
        "crit-bright": "var(--crit-bright)",
        info: "var(--info)",
        "on-accent": "var(--on-accent)",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      maxWidth: {
        shell: "1120px",
      },
      boxShadow: {
        panel: "var(--shadow-panel)",
        glow: "0 0 0 1px var(--accent-dim), 0 0 24px -6px var(--accent)",
      },
      keyframes: {
        "cursor-blink": {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(0.85)" },
        },
        "scan": {
          from: { transform: "translateY(-100%)" },
          to: { transform: "translateY(100%)" },
        },
      },
      animation: {
        "cursor-blink": "cursor-blink 1.1s step-end infinite",
        "pulse-dot": "pulse-dot 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
