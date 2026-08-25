import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          yellow: "#FFE566",
          pink: "#FF6B9D",
          blue: "#6B9DFF",
          green: "#6BFF9D",
          purple: "#C56BFF",
          orange: "#FF9D6B",
          red: "#FF4D4D",
          black: "#000000",
          white: "#FFFFFF",
          cream: "#FFF8E7",
          dark: "#1A1A1A",
        },
      },
      boxShadow: {
        neo: "4px 4px 0px 0px #000000",
        "neo-lg": "6px 6px 0px 0px #000000",
        "neo-sm": "2px 2px 0px 0px #000000",
        "neo-xl": "8px 8px 0px 0px #000000",
      },
      borderWidth: {
        "3": "3px",
        "4": "4px",
        "5": "5px",
      },
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
