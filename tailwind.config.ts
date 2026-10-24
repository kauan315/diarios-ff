import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          green: "#00a884",
          dark: "#111b21",
          darker: "#0b141a",
          light: "#202c33",
          bubble: "#005c4b",
          incoming: "#202c33",
        },
      },
    },
  },
  plugins: [],
};
export default config;
