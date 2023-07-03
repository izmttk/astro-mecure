// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss/nesting'),
    require('postcss-easing-gradients'),
    require('autoprefixer'),
  ]
}