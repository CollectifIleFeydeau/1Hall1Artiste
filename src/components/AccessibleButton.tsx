import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';

interface AccessibleButtonProps extends ButtonProps {
  enhancedContrast?: boolean;
  touchFriendly?: boolean;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  className = '',
  enhancedContrast = false,
  touchFriendly = true,
  ...props
}) => {
  // Classes pour améliorer le contraste
  const contrastClasses = enhancedContrast 
    ? 'text-[#000000] dark:text-[#ffffff] bg-opacity-90 hover:bg-opacity-100' 
    : '';
  
  // Classes pour rendre le bouton plus facile à toucher sur mobile
  const touchClasses = touchFriendly 
    ? 'min-h-[44px] min-w-[44px] touch-target' 
    : '';
  
  return (
    <Button
      className={`${className} ${contrastClasses} ${touchClasses}`}
      {...props}
    >
      {children}
    </Button>
  );
};
