import React from 'react';
import { useNavigate } from "react-router-dom";
import { TreasureButton } from "./TreasureButton";

interface BackButtonProps {
  /** URL de destination. Par défaut : "/" */
  to?: string;
  /** Fonction personnalisée de navigation. Si fournie, ignore 'to' */
  onClick?: () => void;
  /** Texte du bouton. Par défaut : "Retour" */
  children?: React.ReactNode;
  /** Classes CSS supplémentaires */
  className?: string;
  /** Variant du bouton. Par défaut : "primary" */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Taille du bouton. Par défaut : "md" */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Bouton "Retour" standardisé avec le style "carte au trésor"
 * Utilisé dans toutes les pages pour une cohérence visuelle
 * Maintenant basé sur TreasureButton pour une cohérence maximale
 */
export const BackButton: React.FC<BackButtonProps> = ({
  to = "/",
  onClick,
  children = "Retour",
  className = "",
  variant = "primary",
  size = "md"
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(to);
    }
  };

  return (
    <TreasureButton
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
    >
      {children}
    </TreasureButton>
  );
};

export default BackButton;

