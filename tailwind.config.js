module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  variants: {},
  corePlugins: {
    preflight: true,
  },
};
