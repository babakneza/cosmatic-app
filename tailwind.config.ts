import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: ['class'],
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: '1rem',
                sm: '1.5rem',
                lg: '2rem',
            },
            screens: {
                '2xl': '1280px',
            },
        },
        extend: {
            colors: {
                // Oman Theme Colors
                primary: {
                    DEFAULT: '#D4AF37',
                    50: '#FAF7ED',
                    100: '#F5EFDB',
                    200: '#EBDFB7',
                    300: '#E1CF93',
                    400: '#D7BF6F',
                    500: '#D4AF37',
                    600: '#B8962B',
                    700: '#8A7020',
                    800: '#5C4B15',
                    900: '#2E250B',
                },
                secondary: {
                    DEFAULT: '#006400',
                    50: '#E6F2E6',
                    100: '#CCE5CC',
                    200: '#99CB99',
                    300: '#66B266',
                    400: '#339833',
                    500: '#006400',
                    600: '#005000',
                    700: '#003C00',
                    800: '#002800',
                    900: '#001400',
                },
                accent: {
                    DEFAULT: '#C53030',
                    50: '#FEE9E9',
                    100: '#FDD3D3',
                    200: '#FBA7A7',
                    300: '#F97B7B',
                    400: '#F74F4F',
                    500: '#C53030',
                    600: '#9E2626',
                    700: '#771D1D',
                    800: '#4F1313',
                    900: '#280A0A',
                },
                neutral: {
                    50: '#F9FAFB',
                    100: '#F3F4F6',
                    200: '#E5E7EB',
                    300: '#D1D5DB',
                    400: '#9CA3AF',
                    500: '#6B7280',
                    600: '#4B5563',
                    700: '#374151',
                    800: '#1F2937',
                    900: '#111827',
                },
                background: {
                    DEFAULT: '#FFFFFF',
                    secondary: '#FAFAFA',
                    gold: '#FEFCE8',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                foreground: 'hsl(var(--foreground))',
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
            },
            fontFamily: {
                'en-sans': ['var(--font-en-sans)', 'sans-serif'],
                'en-serif': ['var(--font-en-serif)', 'serif'],
                'ar-sans': ['var(--font-ar-sans)', 'sans-serif'],
                sans: ['var(--font-en-sans)', 'sans-serif'],
                serif: ['var(--font-en-serif)', 'serif'],
            },
            fontSize: {
                xs: ['var(--text-xs)', { lineHeight: 'var(--leading-tight)' }],
                sm: ['var(--text-sm)', { lineHeight: 'var(--leading-tight)' }],
                base: ['var(--text-base)', { lineHeight: 'var(--leading-normal)' }],
                lg: ['var(--text-lg)', { lineHeight: 'var(--leading-normal)' }],
                xl: ['var(--text-xl)', { lineHeight: 'var(--leading-normal)' }],
                '2xl': ['var(--text-2xl)', { lineHeight: 'var(--leading-normal)' }],
                '3xl': ['var(--text-3xl)', { lineHeight: 'var(--leading-tight)' }],
                '4xl': ['var(--text-4xl)', { lineHeight: 'var(--leading-tight)' }],
                '5xl': ['var(--text-5xl)', { lineHeight: 'var(--leading-tight)' }],
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
                'slide-in-right': {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                'slide-in-left': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'slide-in-right': 'slide-in-right 0.3s ease-out',
                'slide-in-left': 'slide-in-left 0.3s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
            },
            screens: {
                xs: '375px',
            },
        },
    },
    plugins: [
        require('tailwindcss-rtl'),
        require('tailwindcss-animate'),
    ],
};

export default config;
