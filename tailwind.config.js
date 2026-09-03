/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#F4EDE2",
        terracotta: "#C67B4E",
        deepsea: "#1F4B4A",
        seafoam: "#7FA99B",
        charcoal: "#2A2622"
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"]
      }
    }
  },
  plugins: []
};
