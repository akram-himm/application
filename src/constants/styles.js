/**
 * Constantes de styles pour l'application
 * Centralisation des styles réutilisables
 */

// Couleurs principales
export const COLORS = {
  // Couleurs de base
  primary: '#2383E2', // Bleu principal
  secondary: '#1E1F22', // Gris foncé pour textes
  background: '#F4F4F4', // Fond principal
  white: '#FFFFFF',
  
  // Couleurs de statut
  success: '#22C55E', // Vert
  warning: '#FBB924', // Jaune/Amber
  error: '#EF4444', // Rouge
  info: '#3B82F6', // Bleu info
  
  // Nuances de gris
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  },
  
  // Couleurs des radars
  radar: {
    blue: 'rgb(35, 131, 226)',
    green: 'rgb(34, 197, 94)',
    yellow: 'rgb(251, 191, 36)',
    red: 'rgb(239, 68, 68)',
    purple: 'rgb(168, 85, 247)',
    pink: 'rgb(236, 72, 153)'
  }
};

// Ombres neumorphiques
export const SHADOWS = {
  neumorphic: {
    default: '18px 18px 36px rgba(0,0,0,0.08), -10px -10px 28px rgba(255,255,255,0.60)',
    hover: '20px 20px 40px rgba(0,0,0,0.10), -12px -12px 32px rgba(255,255,255,0.70)',
    small: '12px 12px 24px rgba(0,0,0,0.06), -8px -8px 16px rgba(255,255,255,0.5)',
    large: '20px 20px 40px rgba(0,0,0,0.08), -12px -12px 32px rgba(255,255,255,0.6)',
    inset: 'inset 8px 8px 16px rgba(0,0,0,0.06), inset -8px -8px 16px rgba(255,255,255,0.7)'
  },
  
  // Ombres classiques
  classic: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  }
};

// Styles de boutons
export const BUTTON_STYLES = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
  success: 'bg-green-500 hover:bg-green-600 text-white',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700'
};

// Tailles de texte
export const TEXT_SIZES = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl'
};

// Espacements
export const SPACING = {
  xs: '0.5rem', // 8px
  sm: '1rem', // 16px
  md: '1.5rem', // 24px
  lg: '2rem', // 32px
  xl: '2.5rem', // 40px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
};

// Bordures
export const BORDERS = {
  radius: {
    none: '0',
    sm: '0.125rem', // 2px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px'
  },
  width: {
    none: '0',
    thin: '1px',
    medium: '2px',
    thick: '4px'
  }
};

// Animations
export const ANIMATIONS = {
  transition: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-300',
    slow: 'transition-all duration-500'
  },
  fadeIn: 'animate-fadeIn',
  slideIn: 'animate-slideIn',
  pulse: 'animate-pulse',
  spin: 'animate-spin'
};

// Breakpoints responsive
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Z-index layers
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
  notification: 90
};

// Styles de priorités des tâches
export const PRIORITY_STYLES = {
  'Pas de panique': {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
    color: '#9CA3AF'
  },
  'Important': {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    color: '#3B82F6'
  },
  'Très important': {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    color: '#EF4444'
  }
};

// Styles de statuts des tâches
export const STATUS_STYLES = {
  'À faire': {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    color: '#FBB924'
  },
  'En cours': {
    bg: 'bg-blue-500',
    text: 'text-white',
    border: 'border-blue-500',
    color: '#3B82F6',
    shadow: '0 2px 8px rgba(59,130,246,0.25)'
  },
  'Terminé': {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    color: '#22C55E'
  }
};

// Export par défaut de toutes les constantes
export default {
  COLORS,
  SHADOWS,
  BUTTON_STYLES,
  TEXT_SIZES,
  SPACING,
  BORDERS,
  ANIMATIONS,
  BREAKPOINTS,
  Z_INDEX,
  PRIORITY_STYLES,
  STATUS_STYLES
};