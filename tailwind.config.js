/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Turan's signature red as the lead color, gold as its accent.
        paper: "#F3F2F2",   // cream background
        surf: "#EAE9E9",    // deeper surface
        ink: "#201F1D",     // near-black text
        wine: "#7A2530",    // primary - Turan's signature red
        deep: "#4F1620",    // darker red - emphasis, hover
        gold: "#B68235",    // accent only - details, the hatband, small marks
        sage: "#8CA37E"     // illustration-only accent
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "serif"]
      }
    }
  },
  plugins: []
};
