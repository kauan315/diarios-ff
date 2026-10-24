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
          // Tema claro estilo WhatsApp
          bg: "#f0f2f5",
          panel: "#ffffff",
          header: "#f0f2f5",
          hover: "#f5f6f6",
          green: "#25d366",
          "green-dark": "#128c7e",
          "green-light": "#dcf8c6",
          bubble: "#dcf8c6",
          incoming: "#ffffff",
          text: "#111b21",
          secondary: "#667781",
          muted: "#8696a0",
          border: "#e9edef",
          input: "#f0f2f5",
          danger: "#ea0038",
        },
      },
    },
  },
  plugins: [],
};
export default config;
