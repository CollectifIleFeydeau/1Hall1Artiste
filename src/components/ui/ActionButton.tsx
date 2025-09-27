import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Composant ActionButton pour les icônes d'action
interface ActionButtonProps {
  icon: React.ReactNode;
  variant: 'like' | 'save' | 'share' | 'calendar' | 'delete' | 'edit' | 'info' | 'bell' | 'trash';
  active?: boolean;
  onClick: () => void;
  tooltip?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  variant,
  active = false,
  onClick,
  tooltip,
  disabled = false,
  className = '',
  size = 'md'
}) => {
  // Couleurs spécifiques par type d'action
  const actionColors = {
    like: active ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500',
    save: active ? 'text-blue-500 hover:text-blue-600' : 'text-gray-500 hover:text-blue-500',
    share: 'text-gray-600 hover:text-gray-700',
    calendar: 'text-green-600 hover:text-green-700',
    delete: 'text-red-500 hover:text-red-600',
    edit: 'text-blue-600 hover:text-blue-700',
    info: 'text-[#4a5d94] hover:text-[#3a4d84]',
    bell: 'text-[#4a5d94] hover:text-[#3a4d84]',
    trash: 'text-red-500 hover:text-red-600'
  };

  // Tailles pour les boutons d'action
  const sizeClasses = {
    sm: 'h-6 w-6 p-1',
    md: 'h-8 w-8 p-1.5',
    lg: 'h-10 w-10 p-2'
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={tooltip}
      className={cn(
        "rounded-full hover:bg-gray-100 transition-colors",
        sizeClasses[size],
        actionColors[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {icon}
    </Button>
  );
};

export default ActionButton;
