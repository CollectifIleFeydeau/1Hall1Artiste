import React from 'react';

interface CategoryBadgeProps {
  type: 'concert' | 'exposition';
  variant?: 'filled' | 'outline' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  type,
  variant = 'filled',
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  // Configuration par type
  const typeConfig = {
    concert: {
      label: 'Concert',
      icon: '🎵',
      colorClass: 'badge-concert'
    },
    exposition: {
      label: 'Exposition',
      icon: '🎨',
      colorClass: 'badge-exposition'
    }
  };

  // Classes de taille
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  // Classes de variante
  const getVariantClasses = (type: 'concert' | 'exposition', variant: string): string => {
    const baseClasses = 'badge';
    
    switch (variant) {
      case 'filled':
        return `${baseClasses} ${typeConfig[type].colorClass}`;
      case 'outline':
        return `${baseClasses} badge-outline ${type === 'concert' ? 'text-orange-600 border-orange-600' : 'text-blue-600 border-blue-600'}`;
      case 'subtle':
        return `${baseClasses} ${type === 'concert' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}`;
      default:
        return `${baseClasses} ${typeConfig[type].colorClass}`;
    }
  };

  const config = typeConfig[type];
  const variantClasses = getVariantClasses(type, variant);
  const sizeClass = sizeClasses[size];

  return (
    <span className={`${variantClasses} ${sizeClass} ${className}`}>
      {showIcon && (
        <span className="mr-1" role="img" aria-label={config.label}>
          {config.icon}
        </span>
      )}
      {config.label}
    </span>
  );
};

export default CategoryBadge;
