/**
 * Système de thème centralisé pour l'application
 * Ce fichier contient toutes les constantes de style pour assurer la cohérence visuelle
 */

// Couleurs principales
export const colors = {
  // Couleurs de base
  primary: {
    main: '#4a5d94',
    light: '#e0ebff',
    dark: '#344269',
    contrast: '#ffffff'
  },
  secondary: {
    main: '#ff7a45',
    light: '#fff2ee',
    dark: '#e65c25',
    contrast: '#ffffff'
  },
  text: {
    primary: '#1a2138',
    secondary: '#8c9db5',
    disabled: '#c4c9d4'
  },
  background: {
    default: '#ffffff',
    paper: '#f8fafd',
    light: '#f0f5ff'
  },
  border: {
    light: '#d8e3ff',
    default: '#e0e0e0'
  },
  status: {
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3'
  }
};

// Typographie
export const typography = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem' // 30px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  }
};

// Espacements
export const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '2.5rem' // 40px
};

// Bordures et arrondis
export const borders = {
  radius: {
    sm: '0.25rem',  // 4px
    md: '0.5rem',   // 8px
    lg: '0.75rem',  // 12px
    xl: '1rem',     // 16px
    full: '9999px'
  },
  width: {
    thin: '1px',
    medium: '2px',
    thick: '4px'
  }
};

// Ombres
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
};

// Transitions
export const transitions = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },
  timing: {
    ease: 'ease',
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out'
  }
};

// Breakpoints pour le responsive
export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Exporter tout le thème
export const theme = {
  colors,
  typography,
  spacing,
  borders,
  shadows,
  transitions,
  breakpoints
};

export default theme;

