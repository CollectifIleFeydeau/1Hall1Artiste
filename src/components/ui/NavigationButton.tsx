import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TreasureButton } from './TreasureButton';

// Composant NavigationButton pour la navigation interne
interface NavigationButtonProps {
  to: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  external?: boolean;
  icon?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({
  to,
  children,
  variant = 'primary',
  size = 'md',
  external = false,
  icon,
  className = '',
  fullWidth = false
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (external) {
      window.open(to, '_blank', 'noopener,noreferrer');
    } else {
      navigate(to);
    }
  };

  return (
    <TreasureButton
      variant={variant}
      size={size}
      onClick={handleClick}
      icon={icon}
      className={className}
      fullWidth={fullWidth}
    >
      {children}
    </TreasureButton>
  );
};

export default NavigationButton;

