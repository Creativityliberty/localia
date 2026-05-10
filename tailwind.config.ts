import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Crème + verts — palette Localia
        cream: {
          50: "#FBFCF9",
          100: "#F4F7F2",
          200: "#EEF4EA",
          300: "#E5EDDF",
          400: "#DDE5D8",
          500: "#B8C7B1",
        },
        moss: {
          50: "#F0FFE4",
          100: "#E7FFD2",
          200: "#C8F58E",
          300: "#A6FF4D",
          400: "#8AE82A",
          500: "#72D91C",
          600: "#5BB014",
          700: "#3B6D11",
          800: "#27500A",
          900: "#1B3D0A",
        },
        ink: {
          50: "#F8FAF6",
          100: "#EEF1EA",
          200: "#DDE5D8",
          300: "#8B9787",
          400: "#5E6B5B",
          500: "#3D4A3A",
          600: "#1F2A1D",
          700: "#151B18",
          800: "#101412",
          900: "#0A0E0C",
        },
        terracotta: {
          50: "#FAECE7",
          100: "#F5C4B3",
          200: "#F0997B",
          400: "#D85A30",
          600: "#993C1D",
          800: "#4A1B0C",
        },
        // Sémantique
        success: "#2FBF71",
        warning: "#F4B740",
        danger: "#E85B5B",
        info: "#4FA3F7",
      },
      borderRadius: {
        xs: "6px",
        sm: "10px",
        md: "14px",
        lg: "18px",
        xl: "24px",
        "2xl": "32px",
        "3xl": "44px",
      },
      boxShadow: {
        card: "0 12px 32px rgba(23, 35, 20, 0.08)",
        "card-hover": "0 18px 44px rgba(23, 35, 20, 0.13)",
        shell: "0 28px 80px rgba(10, 18, 12, 0.22)",
        glow: "0 12px 28px rgba(166, 255, 77, 0.32)",
        soft: "0 4px 16px rgba(23, 35, 20, 0.06)",
      },
      fontFamily: {
        // Display = serif distinctif (Fraunces a une vraie personnalité éditoriale)
        display: ["var(--font-fraunces)", "ui-serif", "Georgia", "serif"],
        // Body = grotesk moderne mais pas Inter
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-2xl": ["clamp(3rem, 8vw, 5.5rem)", { lineHeight: "1.02", letterSpacing: "-0.04em" }],
        "display-xl": ["clamp(2.25rem, 5vw, 3.75rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(1.75rem, 3.5vw, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "subtle-float": "subtleFloat 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        subtleFloat: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
