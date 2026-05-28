import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,md,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        // Editorial body — close to Medium.com's reading experience.
        serif: ['"Charter"', '"Iowan Old Style"', "Georgia", '"Times New Roman"', "serif"],
        // Display & UI — clean grotesque.
        sans: ['"Helvetica Neue"', "Helvetica", "Arial", "system-ui", "sans-serif"],
        // Code, formulas, small labels.
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      colors: {
        // Restricted palette: background + white + 3 pastels.
        bg: {
          DEFAULT: "#1e1e1e",
          subtle: "#252525",
          surface: "#2a2a2a",
          elevated: "#303030",
          border: "#3a3a3a",
        },
        fg: {
          DEFAULT: "#f5f5f5",
          muted: "#bdbdbd",
          subtle: "#8a8a8a",
          faint: "#5c5c5c",
        },
        // Pastel accents — only these three for diagrams, accents, formulas.
        accent: {
          red: "#f4a5a5",
          blue: "#a5c8f4",
          green: "#a5e6b1",
        },
      },
      lineHeight: {
        reading: "1.72",
      },
      letterSpacing: {
        reading: "-0.003em",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 220ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
