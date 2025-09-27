import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Configuration du thème centralisé
export const treasureTheme = {
  colors: {
    primary: '#1a2138',
    primaryHover: '#2a3148', 
    secondary: '#4a5d94',
    accent: '#ff7a45',
    amber: '#f59e0b',
    success: '#10b981',
    danger: '#ef4444'
  },
  sizes: {
    sm: 'px-4 py-1 text-sm',
    md: 'px-6 py-2 text-base',
    lg: 'px-8 py-3 text-lg'
  },
  radius: 'rounded-full'
};

// Interface du composant principal
interface TreasureButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'amber' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

// Composant TreasureButton standardisé
export const TreasureButton: React.FC<TreasureButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) => {
  // Styles de base (toujours appliqués)
  const baseStyles = `${treasureTheme.radius} font-medium transition-all duration-200 flex items-center justify-center gap-2`;
  
  // Styles par variant
  const variantStyles = {
    primary: `bg-[${treasureTheme.colors.primary}] hover:bg-[${treasureTheme.colors.primaryHover}] text-white`,
    secondary: `bg-amber-100 hover:bg-amber-200 text-[${treasureTheme.colors.primary}]`,
    outline: `border-2 border-[${treasureTheme.colors.primary}] text-[${treasureTheme.colors.primary}] hover:bg-[${treasureTheme.colors.primary}] hover:text-white bg-transparent`,
    danger: `bg-[${treasureTheme.colors.danger}] hover:bg-red-600 text-white`,
    success: `bg-[${treasureTheme.colors.success}] hover:bg-green-600 text-white`,
    amber: `bg-[${treasureTheme.colors.amber}] hover:bg-yellow-600 text-white`,
    accent: `bg-[${treasureTheme.colors.accent}] hover:bg-[#ff9d6e] text-white`
  };
  
  // Styles par taille
  const sizeStyles = {
    sm: treasureTheme.sizes.sm,
    md: treasureTheme.sizes.md,
    lg: treasureTheme.sizes.lg
  };
  
  // Style pour fullWidth
  const widthStyle = fullWidth ? 'w-full' : '';
  
  // Styles disabled
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  // Combinaison de tous les styles
  const combinedClassName = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    widthStyle,
    disabledStyles,
    className
  );

  return (
    <Button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={combinedClassName}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </Button>
  );
};

export default TreasureButton;
