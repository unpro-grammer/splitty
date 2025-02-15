/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      spacing: {
        3.5: "0.8rem",
        4.5: "1.1rem",
        6.5: '1.6rem',
      },
      colors: {
        "murky-purple": "#42354d",
        "almost-black": "#1a1a1a",
        "almost-white": "#f2f2f2",
      },
      screens: {
        desktop: { min: "1440px" },
        laptop: { min: "1200px", max: "1440px" },
        "tablet-r": { min: "1024px", max: "1200px" },
        tablet: { min: "768px", max: "1024px" },
        mobile: { max: "768px" },

        mablet: { max: "1024px" },
      },
    },
  },
  plugins: [
    function ({ addComponents, theme }) {
      addComponents({
        ".tablet-this": {
          "@apply tablet:opacity-30 tablet:self-center tablet:ml-0": {},
        },
      });
    },
  ],
};
