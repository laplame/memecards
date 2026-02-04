/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    // Header/Footer theme gradients (usados dinámicamente)
    'bg-gradient-to-r from-red-600 via-pink-600 to-rose-600',
    'bg-gradient-to-r from-sky-600 via-teal-500 to-cyan-500',
    'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600',
    'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500',
    'bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500',
    'bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-500',
    'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-600',
    'bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600',
    'hover:text-yellow-200',
    'hover:text-sky-200',
    'hover:text-pink-200',
    'hover:text-blue-200',
    'hover:text-purple-200',
    'hover:text-amber-200',
    'hover:text-green-200',
    'text-yellow-300',
    'text-sky-200',
    'text-pink-200',
    'text-blue-200',
    'text-amber-200',
    'text-purple-200',
    'text-green-200',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
