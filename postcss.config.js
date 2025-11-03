module.exports = {
  plugins: [
   require('@tailwindcss/postcss'),
   require('./src/postcss/property-to-variable'),
  ]
};