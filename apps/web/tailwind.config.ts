import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // NCPOR Polar Brand Colors
        polar: {
          navy: "#0a1628",
          "navy-800": "#0d1e36",
          "navy-700": "#112545",
          "navy-600": "#163060",
          midnight: "#060e1c",
          ice: "#e8f4fd",
          "ice-100": "#d0e9f9",
          frost: "#f0f7ff",
          cyan: "#0ea5e9",
          "cyan-400": "#38bdf8",
          "cyan-300": "#7dd3fc",
          teal: "#0d9488",
          "teal-400": "#2dd4bf",
          azure: "#1d4ed8",
          steel: "#334155",
          "steel-400": "#64748b",
          "steel-300": "#94a3b8",
          snow: "#f8fafc",
          white: "#ffffff",
        },
        // Semantic colors
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        info: "#3b82f6",
      },
      fontFamily: {
        sans: ["Inter var", "Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "polar-gradient": "linear-gradient(135deg, #0a1628 0%, #112545 50%, #0d1e36 100%)",
        "ice-gradient": "linear-gradient(180deg, #e8f4fd 0%, #f0f7ff 100%)",
        "hero-gradient": "linear-gradient(180deg, rgba(10,22,40,0) 0%, rgba(10,22,40,0.7) 60%, rgba(10,22,40,0.95) 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        "cyan-glow": "radial-gradient(ellipse at top, rgba(14,165,233,0.15) 0%, transparent 60%)",
      },
      boxShadow: {
        "polar": "0 4px 24px rgba(14, 165, 233, 0.08), 0 1px 4px rgba(0,0,0,0.12)",
        "polar-lg": "0 8px 40px rgba(14, 165, 233, 0.12), 0 2px 8px rgba(0,0,0,0.16)",
        "card": "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 10px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
        "glow-cyan": "0 0 20px rgba(14, 165, 233, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "drift": "drift 20s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        drift: {
          "0%, 100%": { transform: "translateX(0) translateY(0) scale(1)" },
          "33%": { transform: "translateX(20px) translateY(-10px) scale(1.02)" },
          "66%": { transform: "translateX(-15px) translateY(15px) scale(0.98)" },
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
