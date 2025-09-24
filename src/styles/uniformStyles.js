/**
 * Styles uniformes pour toute l'application
 * Ces styles doivent être utilisés partout pour garantir la cohérence
 */

export const uniformStyles = {
  // Boutons
  button: {
    primary: 'px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all duration-20 text-sm',
    secondary: 'px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-all duration-20 text-sm',
    danger: 'px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-all duration-20 text-sm',
    success: 'px-3 py-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-all duration-20 text-sm',
    icon: 'p-1.5 hover:bg-gray-100 rounded transition-colors duration-20',
    iconSize: 'w-3.5 h-3.5'
  },
  
  // Inputs
  input: {
    default: 'w-full px-3 py-2 bg-white border border-gray-200 rounded text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-300 transition-all duration-20 text-sm',
    select: 'w-full px-3 py-2 bg-white border border-gray-200 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300 transition-all duration-20 text-sm',
    textarea: 'w-full px-3 py-2 bg-white border border-gray-200 rounded text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-300 transition-all duration-20 text-sm resize-none'
  },
  
  // Cards
  card: {
    default: 'bg-white rounded-lg border border-gray-200',
    hover: 'bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-20',
    padding: 'p-4'
  },
  
  // Modals
  modal: {
    overlay: 'fixed inset-0 bg-black/20 flex items-center justify-center z-50',
    container: 'bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4',
    title: 'text-lg font-light text-gray-800 mb-4',
    // Dark theme modals (convertis en clair)
    darkOverlay: 'fixed inset-0 bg-black/20 z-[1000] flex items-center justify-center p-4',
    darkContainer: 'bg-white border border-gray-200 rounded-lg p-6 w-full max-w-[500px] shadow-lg',
    darkTitle: 'text-xl font-semibold text-gray-800 mb-5',
    darkInput: 'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 transition-all duration-20',
    darkLabel: 'block mb-2 text-gray-600 text-sm font-medium',
    darkButtonCancel: 'px-3 py-1.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-200 transition-all duration-20',
    darkButtonSubmit: 'px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-all duration-20'
  },
  
  // Typography
  text: {
    title: 'text-2xl font-light text-gray-800',
    subtitle: 'text-sm text-gray-500',
    label: 'block text-sm text-gray-600 mb-1',
    body: 'text-sm text-gray-700',
    // Page headers
    pageTitle: 'text-3xl font-light text-gray-800 tracking-tight',
    pageSubtitle: 'text-gray-500 mt-2 text-sm'
  },
  
  // Page header container
  pageHeader: {
    container: 'mb-10'
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
    page: 'min-h-screen bg-gray-50',
    pageAlt: 'min-h-screen bg-white',
    container: 'max-w-7xl mx-auto p-6',
    section: 'mb-6'
  }
};

// Helper function pour combiner les classes
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};