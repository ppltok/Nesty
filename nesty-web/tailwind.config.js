/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#86608e",
          dark: "#6d4e74",
          light: "#a891ad",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#a891ad",
          dark: "#917a96",
          light: "#b9a4bd",
          foreground: "#1a1a1a",
        },
        muted: {
          DEFAULT: "#c9c2cb",
          dark: "#b5adb8",
          light: "#e8e4e9",
          foreground: "#6b6b6b",
        },
        accent: {
          pink: "#f4acb7",
          "pink-light": "#ffcad4",
          peach: "#ffd8d7",
        },
        background: "#faf8fb",
        foreground: "#1a1a1a",
        card: "#ffffff",
        border: "#e8e4e9",
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        success: "#22c55e",
      },
      fontFamily: {
        sans: ["Assistant", "Heebo", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
    },
  },
  plugins: [],
}
