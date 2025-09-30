import React from 'react';
import { useNavigate } from "react-router-dom";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";

interface BackButtonProps {
  /** URL de destination. Par défaut : "/" */
  to?: string;
  /** Fonction personnalisée de navigation. Si fournie, ignore 'to' */
  onClick?: () => void;
  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Bouton "Retour" standardisé avec icône flèche dans un cercle blanc
 * Style cohérent : cercle blanc avec ombre, flèche noire
 * Utilisé dans toutes les pages pour une navigation cohérente
 */
export const BackButton: React.FC<BackButtonProps> = ({
  to = "/",
  onClick,
  className = ""
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
    <button
      onClick={handleClick}
      className={`h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition-shadow ${className}`}
      aria-label="Retour"
    >
      <ArrowLeft className="h-5 w-5 text-gray-800" />
    </button>
  );
};

export default BackButton;

