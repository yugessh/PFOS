/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Neo Finance OS Theme
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        card: 'var(--color-card)',
        'card-elevated': 'var(--color-card-elevated)',
        border: 'var(--color-border)',
        ring: 'var(--color-ring)',
        muted: 'var(--color-muted)',
        'muted-foreground': 'var(--color-muted-foreground)',
        accent: 'var(--color-accent)',
        'accent-mint': 'var(--color-accent-mint)',
        'accent-secondary': 'var(--color-accent-secondary)',
        destructive: 'var(--color-destructive)',
        'destructive-foreground': 'var(--color-destructive-foreground)',
        warning: 'var(--color-warning)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        'text-secondary': 'var(--color-text-secondary)',
        blue: 'var(--color-blue)',
      },
      borderRadius: {
        card: 'var(--radius-card, 28px)',
        pill: 'var(--radius-pill, 9999px)',
      },
      boxShadow: {
        card: 'var(--card-shadow, 0px 8px 30px rgba(0,0,0,0.45))',
      },
    },
  },
  plugins: [],
};

export default config;
