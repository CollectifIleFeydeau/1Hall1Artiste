import React from 'react';

interface LoadingIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  fullScreen?: boolean;
  text?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'medium',
  color = '#4a5d94',
  fullScreen = false,
  text = 'Chargement...'
}) => {
  // Déterminer la taille du spinner
  const sizeMap = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  const spinnerSize = sizeMap[size];
  
  // Conteneur conditionnel selon que l'indicateur est plein écran ou non
  const Container = fullScreen 
    ? ({ children }: { children: React.ReactNode }) => (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          {children}
        </div>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <div className="flex flex-col items-center justify-center py-4">
          {children}
        </div>
      );

  return (
    <Container>
      <div className="flex flex-col items-center">
        <div className={`${spinnerSize} animate-spin`}>
          <svg
            className="w-full h-full"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke={color}
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill={color}
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        {text && <p className="mt-2 text-sm font-medium" style={{ color }}>{text}</p>}
      </div>
    </Container>
  );
};
