// tailwind.config.js
const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./*.html",
    "./css/*.{css,html}",
    "./js/**/*.{js,html}",
  ],
  theme: {
    // Bring back the typical Tailwind colors:
    colors: {
      ...colors,   // This reintroduces e.g. green, yellow, gray, etc.
    },
    // If you also need default spacing (p-4, m-8), text sizes, etc.:
    spacing: defaultTheme.spacing,
    fontSize: defaultTheme.fontSize,
    // or just spread the entire defaultTheme to keep all the old goodies:
    // ...defaultTheme,

    extend: {
      fontFamily: {
        // Keep Poppins plus the normal Tailwind sans stack
        sans: ['Poppins', ...defaultTheme.fontFamily.sans],
      },
      // Any other custom additions...
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
