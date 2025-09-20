import React from 'react';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count?: number;
  show?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count = 0,
  show = false,
  className,
  children
}) => {
  const shouldShow = show && count > 0;
  
  return (
    <div className="relative inline-block">
      {children}
      {shouldShow && (
        <div className={cn(
          "absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white",
          "animate-pulse",
          className
        )}>
          {count > 99 ? '99+' : count}
        </div>
      )}
    </div>
  );
};
