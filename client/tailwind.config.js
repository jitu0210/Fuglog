/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', '"Times New Roman"', 'serif'],
        body: ['Georgia', '"Times New Roman"', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        reddit: {
          bg: '#f8f9fa',
          card: '#ffffff',
          border: '#e2e8f0',
          text: '#1a1a2e',
          muted: '#6b7280',
          link: '#2563eb',
          upvote: '#ff4500',
          downvote: '#7193ff',
        },
      },
    },
  },
  plugins: [],
}
