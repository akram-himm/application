import React from 'react';

// Variantes de cartes neumorphiques réutilisables
const variants = {
  default: "bg-white/70 ring-1 ring-gray-200 shadow-[18px_18px_36px_rgba(0,0,0,0.08),_-10px_-10px_28px_rgba(255,255,255,0.60)]",
  hover: "bg-white/70 ring-1 ring-gray-200 shadow-[18px_18px_36px_rgba(0,0,0,0.08),_-10px_-10px_28px_rgba(255,255,255,0.60)] hover:shadow-[20px_20px_40px_rgba(0,0,0,0.10),_-12px_-12px_32px_rgba(255,255,255,0.70)]",
  small: "bg-white/70 ring-1 ring-gray-200 shadow-[12px_12px_24px_rgba(0,0,0,0.06),_-8px_-8px_16px_rgba(255,255,255,0.5)]",
  large: "bg-white/70 ring-1 ring-gray-200 shadow-[20px_20px_40px_rgba(0,0,0,0.08),_-12px_-12px_32px_rgba(255,255,255,0.6)]",
  flat: "bg-white/70 ring-1 ring-gray-200",
};

// Tailles de padding prédéfinies
const paddings = {
  none: "",
  small: "p-4",
  medium: "p-6",
  large: "p-8"
};

/**
 * Composant Card réutilisable avec styles neumorphiques
 * @param {string} variant - Type de carte (default, hover, small, large, flat)
 * @param {string} padding - Taille du padding (none, small, medium, large)
 * @param {string} className - Classes CSS additionnelles
 * @param {function} onClick - Handler de clic
 * @param {React.ReactNode} children - Contenu de la carte
 * @param {object} props - Autres props
 */
const Card = ({ 
  variant = 'default', 
  padding = 'medium',
  className = '', 
  onClick,
  children,
  ...props 
}) => {
  const baseClasses = "rounded-2xl transition-all";
  const variantClasses = variants[variant] || variants.default;
  const paddingClasses = paddings[padding] || paddings.medium;
  
  const combinedClasses = `${baseClasses} ${variantClasses} ${paddingClasses} ${className}`.trim();

  return (
    <div 
      className={combinedClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Variante spéciale pour les headers
export const HeaderCard = ({ children, className = '', ...props }) => (
  <Card variant="default" padding="large" className={className} {...props}>
    {children}
  </Card>
);

// Variante spéciale pour les cartes cliquables
export const ClickableCard = ({ children, className = '', ...props }) => (
  <Card 
    variant="hover" 
    padding="medium" 
    className={`cursor-pointer ${className}`} 
    {...props}
  >
    {children}
  </Card>
);

// Variante spéciale pour les stats
export const StatCard = ({ children, className = '', ...props }) => (
  <Card variant="small" padding="medium" className={className} {...props}>
    {children}
  </Card>
);

export default Card;