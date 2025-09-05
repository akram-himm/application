// Fonction pour retarder l'exécution d'une fonction
// Évite d'appeler la fonction trop souvent
export function debounce(func, delay) {
  let timeoutId;
  
  return function (...args) {
    // Annuler l'appel précédent s'il existe
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Programmer un nouvel appel après le délai
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Version avec callback immédiat pour les cas critiques
export function debounceWithImmediate(func, delay, immediate = false) {
  let timeoutId;
  
  return function (...args) {
    const callNow = immediate && !timeoutId;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate) {
        func.apply(this, args);
      }
    }, delay);
    
    if (callNow) {
      func.apply(this, args);
    }
  };
}