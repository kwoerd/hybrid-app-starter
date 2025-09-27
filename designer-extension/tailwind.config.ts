import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
      '4xl': '2560px',
      'tall': { 'raw': '(min-height: 800px)' },
      'short': { 'raw': '(max-height: 600px)' },
    },
    extend: {
      colors: {
        // Design System Colors - ONLY 2 SHADES MAX PER COLOR
        // Brand Colors
        "brand-pink": "#FF0099",
        "brand-pink-hover": "#E6008A",
        
        // Text Colors
        "text-primary": "#fffbeb",
        "text-secondary": "#a3a3a3",
        "text-muted": "#737373",
        
        // Background Colors
        "bg-primary": "#171717",
        "bg-secondary": "#262626",
        
        // Border Colors
        "border-primary": "#404040",
        "border-secondary": "#525252",
        
        // Status Colors - ONLY 2 SHADES EACH
        "success": "#10B981",
        "success-hover": "#059669",
        "warning": "#F59E0B",
        "warning-hover": "#D97706",
        "error": "#EF4444",
        "error-hover": "#DC2626",
        "info": "#3B82F6",
        "info-hover": "#2563EB",
        
        // Legacy shadcn colors (keep for compatibility)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        // Design System Radius Scale
        "none": "0",
        "sm": "0.25rem",    // 4px
        "md": "0.5rem",     // 8px
        "lg": "0.75rem",    // 12px
        "xl": "1rem",       // 16px
        "full": "9999px",   // Fully rounded
        // Legacy shadcn radius
        "lg-legacy": "var(--radius)",
        "md-legacy": "calc(var(--radius) - 2px)",
        "sm-legacy": "calc(var(--radius) - 4px)",
      },
      spacing: {
        // Design System Spacing Scale (8px base)
        "1": "0.25rem",   // 4px
        "2": "0.5rem",    // 8px
        "3": "0.75rem",   // 12px
        "4": "1rem",      // 16px
        "5": "1.25rem",   // 20px
        "6": "1.5rem",    // 24px
        "8": "2rem",      // 32px
        "10": "2.5rem",   // 40px
        "12": "3rem",     // 48px
        "16": "4rem",     // 64px
        "20": "5rem",     // 80px
        "24": "6rem",     // 96px
      },
      fontSize: {
        // Design System Typography Scale
        "h1": ["2.5rem", { lineHeight: "1.2", fontWeight: "700" }],      // 40px
        "h2": ["2rem", { lineHeight: "1.3", fontWeight: "600" }],        // 32px
        "h3": ["1.5rem", { lineHeight: "1.4", fontWeight: "600" }],      // 24px
        "h4": ["1.25rem", { lineHeight: "1.4", fontWeight: "500" }],     // 20px
        "body-large": ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }], // 18px
        "body": ["1rem", { lineHeight: "1.5", fontWeight: "400" }],      // 16px
        "body-small": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }], // 14px
        "caption": ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }], // 12px
        "button": ["0.875rem", { lineHeight: "1.2", fontWeight: "600" }], // 14px
        "label": ["0.75rem", { lineHeight: "1.4", fontWeight: "500" }],   // 12px
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
