import React from 'react';

interface TreasureCounterProps {
  count: number;
  label: string;
  show?: boolean;
}

export function TreasureCounter({ count, label, show = true }: TreasureCounterProps) {
  if (!show || count === 0) return null;

  return (
    <div className="absolute -top-2 -right-2 z-10">
      <div 
        className="px-2 py-1 rounded-full text-xs font-bold text-amber-50 shadow-md"
        style={{
          background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
          fontFamily: 'serif',
          minWidth: '20px',
          textAlign: 'center',
          border: '1px solid rgba(139, 69, 19, 0.3)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        {count}
      </div>
    </div>
  );
}
