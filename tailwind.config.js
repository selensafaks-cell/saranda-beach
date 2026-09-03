/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Grounded in the actual place: Aegean coast, whitewashed walls, sunset light.
        aegean: "#0E6E8C",   // marine blue - primary
        horizon: "#0B3B4A",  // deep navy - headers, admin chrome
        sand: "#FAF6EC",     // pale sandstone background
        coral: "#FF6B4A",    // sunset coral - CTAs, prices, accents
        olive: "#78895A",    // olive grove - secondary tags
        ink: "#1B2422"       // warm near-black for text
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"]
      }
    }
  },
  plugins: []
};
