const konstaConfig = require('konsta/config');
/** @type {import('tailwindcss').Config} */
module.exports = konstaConfig({
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [],
})
