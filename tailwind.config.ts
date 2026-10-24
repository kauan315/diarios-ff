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
        wa: {
          bg: "#0b141a",
          panel: "#111b21",
          header: "#202c33",
          hover: "#2a3942",
          green: "#00a884",
          "green-dark": "#008069",
          bubble: "#005c4b",
          incoming: "#202c33",
          text: "#e9edef",
          secondary: "#8696a0",
          muted: "#667781",
          border: "#222d34",
          input: "#2a3942",
          danger: "#f15c6d",
        },
      },
    },
  },
  plugins: [],
};
export default config;
