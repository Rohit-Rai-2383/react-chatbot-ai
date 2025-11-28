/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "cb-font",
    "cb-radius",
    "cb-user-bubble",
    "cb-bot-bubble",
    "cb-processing",
    "cb-code",
    "cb-link",
    "cb-button",
    "cb-container"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

