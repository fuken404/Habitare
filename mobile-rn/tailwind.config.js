/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary:       '#1F6B55',
        'primary-dark':'#14513F',
        'primary-deep':'#0E3D2E',
        'primary-soft':'#E8F1ED',
        'primary-muted':'#C7DBD2',
        accent:        '#E8A968',
        'accent-dark': '#C28244',
        'accent-soft': '#FBEEDC',
        scaffold:      '#F7F4EE',
        // warm neutrals
        'warm-50':  '#F8F6F1',
        'warm-100': '#EFECE5',
        'warm-200': '#E2DED4',
        'warm-300': '#C9C4B7',
        'warm-400': '#A39E8F',
        'warm-500': '#736E62',
        'warm-600': '#52503F',
        'warm-700': '#3A3830',
        'warm-800': '#26241D',
        'warm-900': '#16140E',
        // semantic
        'success-bg':   '#E2F1E7',
        'success-text': '#1E7D4D',
        'warning-bg':   '#FBF1D9',
        'warning-text': '#9C6A00',
        'danger-bg':    '#FBE5E1',
        'danger-text':  '#B23A33',
        'info-bg':      '#E2ECF7',
        'info-text':    '#1F5AA0',
      },
      fontFamily: {
        sans: ['PlusJakartaSans_400Regular'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
    },
  },
  plugins: [],
};
