/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          DEFAULT: '#2563EB', // Blue 600
          light: '#3B82F6',   // Blue 500
          dark: '#1D4ED8',    // Blue 700
        },
        // Secondary Colors
        secondary: {
          DEFAULT: '#10B981', // Emerald 500
          light: '#34D399',   // Emerald 400
          dark: '#059669',    // Emerald 600
        },
        // Background & Surface
        background: '#0F172A', // Slate 900
        surface: {
          DEFAULT: '#1E293B', // Slate 800
          light: '#334155',   // Slate 700
        },
        // Text Colors
        text: {
          primary: '#F8FAFC',   // Slate 50
          secondary: '#94A3B8', // Slate 400
          muted: '#64748B',     // Slate 500
        },
        // Status Colors
        error: '#EF4444',    // Red 500
        warning: '#F59E0B',  // Amber 500
        success: '#10B981',  // Emerald 500
        // Subtitle Colors
        subtitle: {
          white: '#FFFFFF',
          yellow: '#FDE047',  // Yellow 300
          cyan: '#22D3EE',    // Cyan 400
        },
        // Keep legacy for compatibility
        slate: {
          50: '#F8FAFC',
          400: '#94A3B8',
          500: '#64748B',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        blue: {
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        emerald: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
        amber: {
          500: '#F59E0B',
        },
        red: {
          500: '#EF4444',
        },
        yellow: {
          300: '#FDE047',
        },
        cyan: {
          400: '#22D3EE',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        subtitle: ['"Arial Black"', '"Arial Bold"', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
        lg: ['18px', '28px'],
        xl: ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '36px'],
        '4xl': ['36px', '40px'],
        // Subtitle sizes
        'subtitle-sm': ['24px', '32px'],
        'subtitle-md': ['28px', '36px'],
        'subtitle-lg': ['32px', '40px'],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      borderRadius: {
        'xl': '16px',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseDetection: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        cornerHighlight: {
          '0%, 100%': { opacity: '0.6', strokeWidth: '2' },
          '50%': { opacity: '1', strokeWidth: '3' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'fade-out': 'fadeOut 300ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-detection': 'pulseDetection 1s ease-in-out infinite',
        'corner-highlight': 'cornerHighlight 2s ease-in-out infinite',
        'scale-in': 'scaleIn 200ms ease-out',
      },
    },
  },
  plugins: [],
}