import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/contexts/NavigationContext";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const BackButton: React.FC<BackButtonProps> = ({
  fallbackPath = "/",
  className = "",
  variant = "ghost",
  size = "icon"
}) => {
  const { goBack, canGoBack, navigateTo } = useNavigation();
  
  const handleClick = () => {
    if (canGoBack) {
      goBack();
    } else {
      navigateTo(fallbackPath);
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      aria-label="Retour"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
};
