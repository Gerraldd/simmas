/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        bounceOnce: {
          "0%, 100%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.2)" },
          "60%": { transform: "scale(0.9)" },
        },
      },
      animation: {
        bounceOnce: "bounceOnce 0.5s ease-in-out",
      },
    }
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('tailwind-scrollbar'),
  ],
};