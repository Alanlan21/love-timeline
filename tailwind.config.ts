import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Azul Tiffany + variações
        tiffany: {
          DEFAULT: "#81D8D0", // Tiffany tradicional
          light: "#A9E7E3",   // pastel clarinho
          dark: "#0ABAB5",    // saturado, mais forte
        },

        // Cores de texto padronizadas para fundos claros
        text: {
          primary: "#134E4A",   // teal-900 (forte, ótimo contraste)
          secondary: "#155E75", // teal-800 (médio)
          muted: "#0D9488",     // teal-600 (discreto, mas legível)
        },

        // Paleta pastel de apoio (quando não for Tiffany)
        pastel: {
          pink: "#FBCFE8",    // rosa suave
          purple: "#E9D5FF",  // lilás suave
          blue: "#BAE6FD",    // azul clarinho
        },
      },
      fontFamily: {
        script: ["Dancing Script", "cursive"],
      },
    },
  },
  plugins: [],
}
export default config
