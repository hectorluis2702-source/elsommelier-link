import type { Config } from "tailwindcss";

// Paleta "Dark Elegance": negro mate de fondo, borgoña profundo para
// acentos/botones, dorado sutil para detalles tipográficos — editorial
// boutique, no "neón corporativo".
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        matte: {
          950: "#0a0a0a",
          900: "#121110",
          800: "#1b1918",
          700: "#262321",
        },
        burgundy: {
          950: "#2b0410",
          900: "#3d0817",
          800: "#5c0f22",
          700: "#7a1530",
          600: "#961b3b",
        },
        gold: {
          400: "#e4c77a",
          300: "#d9b969",
          200: "#c9a44c",
          100: "#f0e0b8",
        },
        cream: "#f2ede1",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        elegant: "0 20px 60px -20px rgba(0,0,0,0.7)",
      },
      backgroundImage: {
        grain:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
export default config;
