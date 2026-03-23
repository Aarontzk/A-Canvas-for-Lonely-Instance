import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "navy-900": "#0a0e1a",
        "navy-800": "#111827",
        "navy-700": "#1a2237",
        "deep-purple": "#1e1033",
        "neon-blue": "#00d4ff",
        "neon-pink": "#ff2d8a",
        "neon-purple": "#b44dff",
        "neon-teal": "#00ffcc",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        twinkle: "twinkle 3s ease-in-out infinite",
        "shooting-star": "shootingStar 1.5s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        shootingStar: {
          "0%": { opacity: "1", transform: "translateX(0) translateY(0)" },
          "100%": {
            opacity: "0",
            transform: "translateX(-200px) translateY(200px)",
          },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "dreamy-sky":
          "radial-gradient(ellipse at top, #1e1033 0%, #111827 40%, #0a0e1a 100%)",
        "neon-gradient":
          "linear-gradient(135deg, #00d4ff 0%, #b44dff 50%, #ff2d8a 100%)",
        "glass-card":
          "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
