module.exports = {
  content: [
    './index.html',
    './src/**/*.{html,js,svelte,ts,tsx}'
  ],
  theme: {

    variants: {
      extend: {
        backgroundColor: ['even'],
      }
    },
    extend: {
      colors: {
        primary: '#205FA0',
        secondary: '#4786C6',
        accent: '#4E769E',
        primaryDark: '#0F3152'
      },
      'zIndex': {
        '100': '100',
      },
      height: {
        '128': '32rem',
        '156': '39rem',
        '256': '64rem',
      },
      // screens: {
      //   'print': {'raw': 'print '},
      // }
    },
  },
  daisyui: {
    themes: ["corporate"],
  },
  plugins: [
    // require("daisyui"),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ],
}
