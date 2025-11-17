/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern Blue Primary Palette
        primary: {
          50: '#E6F0FF',
          100: '#CCE0FF',
          200: '#99C2FF',
          300: '#66A3FF',
          400: '#3385FF',
          500: '#4C6FFF', // Main primary color
          600: '#3D58D1', // Darker for gradients
          700: '#2E42A3',
          800: '#1F2B75',
          900: '#0F1547',
        },
        // Soft Green Success Palette
        success: {
          50: '#E6F7ED',
          100: '#CCEFDB',
          200: '#99DFB7',
          300: '#66CF93',
          400: '#33BF6F',
          500: '#32D85A', // Main success color
          600: '#23B748', // Darker for gradients
          700: '#1A8A36',
          800: '#115C24',
          900: '#082E12',
        },
        // Red Error Palette
        error: {
          50: '#FEECEC',
          100: '#FDD9D9',
          200: '#FBB3B3',
          300: '#F88D8D',
          400: '#F56868',
          500: '#F55F5F', // Main error color
          600: '#FF6B6B', // Softer for dark mode
          700: '#CC2A2A',
          800: '#991F1F',
          900: '#661515',
        },
        // Warning Palette
        warning: {
          50: '#FFF8E6',
          100: '#FFF0CC',
          200: '#FFE199',
          300: '#FFD266',
          400: '#FFC333',
          500: '#F59E0B', // Main warning color
          600: '#C47F08',
          700: '#936006',
          800: '#624004',
          900: '#312002',
        },
        // Neutral Grays
        gray: {
          50: '#F8FAFC', // Light background
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#6B7280', // Text secondary
          700: '#475569',
          800: '#334155',
          900: '#111827', // Text primary
        },
        // Cool Grays for icons
        cool: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB', // Borders/lines
          300: '#D1D5DB',
          400: '#9CA3AF', // Muted icon color
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        // Dark mode specific colors
        dark: {
          bg: '#0F1115', // Dark charcoal background
          surface: '#1A1C20', // Very dark gray for cards
          border: '#2A2D33', // Subtle gray borders
          text: {
            primary: '#F5F5F5', // White text
            secondary: '#A1A1AA', // Gray text
            muted: '#6B7280', // Cool dim gray
          }
        },
        // Additional modern colors
        info: '#60A5FA',
        indigo: '#6366F1',
        purple: '#A855F7',
        pink: '#EC4899',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4C6FFF 0%, #3D58D1 100%)',
        'gradient-success': 'linear-gradient(135deg, #32D85A 0%, #23B748 100%)',
        'gradient-accent': 'linear-gradient(135deg, #4C6FFF 0%, #32D85A 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1A1C20 0%, #0F1115 100%)',
        'gradient-card': 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'strong': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(76, 111, 255, 0.3)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.bg-gradient-primary': {
          backgroundImage: 'linear-gradient(135deg, #4C6FFF 0%, #3D58D1 100%)',
        },
        '.bg-gradient-success': {
          backgroundImage: 'linear-gradient(135deg, #32D85A 0%, #23B748 100%)',
        },
        '.bg-gradient-accent': {
          backgroundImage: 'linear-gradient(135deg, #4C6FFF 0%, #32D85A 100%)',
        },
        '.bg-gradient-dark': {
          backgroundImage: 'linear-gradient(135deg, #1A1C20 0%, #0F1115 100%)',
        },
        '.bg-gradient-card': {
          backgroundImage: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        },
        '.shadow-glow': {
          boxShadow: '0 0 20px rgba(76, 111, 255, 0.3)',
        },
        '.shadow-soft': {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        '.shadow-medium': {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        '.shadow-strong': {
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
  darkMode: 'class',
}