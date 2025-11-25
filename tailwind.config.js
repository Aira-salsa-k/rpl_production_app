// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bakery: {
          primary: "var(--primary-bakery)",
          secondary: "var(--secondary-bakery)",
          light: "var(--light-bakery)",
          dark: "var(--dark-bakery)",
          muted: "var(--muted-bakery)",
        }
      }
    }
  },
  plugins: [],
}
