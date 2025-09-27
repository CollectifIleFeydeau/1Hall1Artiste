import React, { useState, useEffect, useRef } from 'react';

interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showCounts?: boolean;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  className = '',
  showCounts = false
}) => {
  const [focusedTab, setFocusedTab] = useState<string | null>(null);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Gestion du clavier
  const handleKeyDown = (event: React.KeyboardEvent, tabId: string) => {
    const tabIds = tabs.map(tab => tab.id);
    const currentIndex = tabIds.indexOf(tabId);

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabIds.length - 1;
        const prevTabId = tabIds[prevIndex];
        setFocusedTab(prevTabId);
        tabRefs.current[prevTabId]?.focus();
        break;
      case 'ArrowRight':
        event.preventDefault();
        const nextIndex = currentIndex < tabIds.length - 1 ? currentIndex + 1 : 0;
        const nextTabId = tabIds[nextIndex];
        setFocusedTab(nextTabId);
        tabRefs.current[nextTabId]?.focus();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        onTabChange(tabId);
        break;
    }
  };

  // Classes de base selon la variante
  const getContainerClasses = (): string => {
    const baseClasses = 'flex';
    
    switch (variant) {
      case 'pills':
        return `${baseClasses} gap-1 p-1 bg-gray-100 rounded-lg`;
      case 'underline':
        return `${baseClasses} border-b border-gray-200`;
      default:
        return `${baseClasses} tab-navigation`;
    }
  };

  // Classes pour les boutons
  const getButtonClasses = (tab: Tab): string => {
    const isActive = activeTab === tab.id;
    const isFocused = focusedTab === tab.id;
    
    // Classes de taille
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    const baseClasses = `
      relative flex items-center gap-2 font-medium transition-all duration-200
      focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
      ${sizeClasses[size]}
    `;

    switch (variant) {
      case 'pills':
        return `
          ${baseClasses} rounded-md
          ${isActive 
            ? 'bg-white/90 backdrop-blur-sm text-blue-600 shadow-sm border border-amber-300' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }
        `;
      case 'underline':
        return `
          ${baseClasses} border-b-2 -mb-px
          ${isActive 
            ? 'border-blue-500 text-blue-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }
        `;
      default:
        return `
          ${baseClasses} tab-button rounded-md
          ${isActive ? 'active' : ''}
        `;
    }
  };

  return (
    <div 
      className={`${getContainerClasses()} ${className}`}
      role="tablist"
      aria-label="Navigation par onglets"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          ref={(el) => { tabRefs.current[tab.id] = el; }}
          className={getButtonClasses(tab)}
          onClick={() => onTabChange(tab.id)}
          onKeyDown={(e) => handleKeyDown(e, tab.id)}
          onFocus={() => setFocusedTab(tab.id)}
          onBlur={() => setFocusedTab(null)}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          tabIndex={activeTab === tab.id ? 0 : -1}
        >
          {tab.icon && (
            <span role="img" aria-hidden="true">
              {tab.icon}
            </span>
          )}
          
          <span>{tab.label}</span>
          
          {showCounts && tab.count !== undefined && (
            <span 
              className={`
                ml-1 px-2 py-0.5 text-xs rounded-full
                ${activeTab === tab.id 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
