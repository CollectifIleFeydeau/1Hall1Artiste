import React from 'react';
import { TreasureButton } from './TreasureButton';

// Composant FilterButton spécialisé
interface FilterButtonProps {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  active,
  children,
  onClick,
  disabled = false,
  className = ''
}) => {
  return (
    <TreasureButton
      variant={active ? 'primary' : 'outline'}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </TreasureButton>
  );
};

export default FilterButton;
