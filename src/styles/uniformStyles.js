/**
 * Styles uniformes pour toute l'application
 * Ces styles doivent être utilisés partout pour garantir la cohérence
 */

export const uniformStyles = {
  // Boutons
  button: {
    primary: 'px-3 py-1.5 bg-white/70 text-gray-600 rounded-lg hover:bg-white hover:shadow-sm transition-all text-sm ring-1 ring-gray-200',
    secondary: 'px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-all text-sm',
    danger: 'px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all text-sm',
    success: 'px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all text-sm',
    icon: 'p-1.5 hover:bg-gray-100 rounded-lg transition-colors',
    iconSize: 'w-3.5 h-3.5'
  },
  
  // Inputs
  input: {
    default: 'w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all text-sm',
    select: 'w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all text-sm',
    textarea: 'w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all text-sm resize-none'
  },
  
  // Cards
  card: {
    default: 'bg-white/70 backdrop-blur-sm rounded-xl shadow-sm ring-1 ring-gray-200',
    hover: 'bg-white/70 backdrop-blur-sm rounded-xl shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-all',
    padding: 'p-4'
  },
  
  // Modals
  modal: {
    overlay: 'fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50',
    container: 'bg-white/90 backdrop-blur-md rounded-2xl shadow-xl ring-1 ring-gray-200 p-6 max-w-md w-full mx-4',
    title: 'text-lg font-light text-gray-800 mb-4',
    // Dark theme modals
    darkOverlay: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4',
    darkContainer: 'bg-[rgb(37,37,37)] border border-[rgb(47,47,47)] rounded-lg p-6 w-full max-w-[500px] shadow-2xl',
    darkTitle: 'text-xl font-semibold text-white/81 mb-5',
    darkInput: 'w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 placeholder-white/46 focus:outline-none focus:border-white/20 transition-all duration-150',
    darkLabel: 'block mb-2 text-white/46 text-sm font-medium',
    darkButtonCancel: 'px-3 py-1.5 bg-white/[0.055] text-white/46 border border-white/[0.094] rounded-md text-sm font-medium hover:bg-white/[0.08] transition-all duration-150',
    darkButtonSubmit: 'px-3 py-1.5 bg-[rgb(35,131,226)] text-white rounded-md text-sm font-medium hover:bg-[rgb(28,104,181)] transition-all duration-150'
  },
  
  // Typography
  text: {
    title: 'text-2xl font-light text-gray-800',
    subtitle: 'text-sm text-gray-500',
    label: 'block text-sm text-gray-600 mb-1',
    body: 'text-sm text-gray-700'
  },
  
  // Badges
  badge: {
    default: 'px-2 py-1 text-xs rounded-lg font-medium',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-50 text-gray-600'
  },
  
  // Layout
  layout: {
    page: 'min-h-screen bg-white/70 backdrop-blur-sm',
    container: 'max-w-7xl mx-auto p-6',
    section: 'mb-6'
  }
};

// Helper function pour combiner les classes
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};