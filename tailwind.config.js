// tailwind.config.js
const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  mode: "jit",
  content: ["./*.html", "./css/*.{css,html}", "./js/**/*.{js,html}"],
  theme: {
    // Bring back the typical Tailwind colors:
    colors: {
      ...colors, // This reintroduces e.g. green, yellow, gray, etc.
    },
    // If you also need default spacing (p-4, m-8), text sizes, etc.:
    spacing: defaultTheme.spacing,
    fontSize: defaultTheme.fontSize,
    extend: {
      fontFamily: {
        // Keep Poppins plus the normal Tailwind sans stack
        sans: ["Poppins", ...defaultTheme.fontFamily.sans],
      },
      // Custom keyframes for the animated gradient
      keyframes: {
        gradientShift: {
          "0%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
          "100%": { "background-position": "0% 50%" },
        },
      },
      // Custom animation using the keyframes above
      animation: {
        gradient: "gradientShift 15s ease infinite",
      },
      // Custom background size utility (optional; you can also use arbitrary values)
      backgroundSize: {
        "200": "200% 200%",
      },
    },
  },
  plugins: [
    // Make sure to use require() for plugins:
    require("@tailwindcss/forms")
    // You can add other plugins here as needed.
  ],
};
