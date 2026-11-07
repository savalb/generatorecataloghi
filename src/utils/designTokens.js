/**
 * Design Tokens & CSS Variables for the SaaS Platform
 * Centralized theming system with support for brand customization and dark mode
 */

export const designTokens = {
  // Core Colors
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    secondary: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308',
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
    },
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
  },

  // Typography
  typography: {
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },

  // Spacing
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  },

  // Transitions
  transition: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
    },
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    properties: ['color', 'background-color', 'border-color', 'transform', 'box-shadow', 'opacity'],
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modal: 1300,
    popover: 1400,
    toast: 1500,
    tooltip: 1600,
  },

  // Breakpoints (for reference in JS)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // A4 Print Dimensions
  print: {
    a4: {
      width: '210mm',
      height: '297mm',
      contentHeight: '277mm', // After margins
      dpi: 300,
    },
  },
};

/**
 * Generate CSS Custom Properties from design tokens
 */
export function generateCSSVariables(brandColors = { primary: '#1E3A8A', secondary: '#FFC107' }) {
  return `
    :root {
      /* Brand Colors */
      --brand-primary: ${brandColors.primary};
      --brand-secondary: ${brandColors.secondary};
      
      /* Background Colors */
      --bg-primary: ${designTokens.colors.neutral[50]};
      --bg-secondary: #ffffff;
      --bg-tertiary: ${designTokens.colors.neutral[100]};
      
      /* Text Colors */
      --text-primary: ${designTokens.colors.neutral[900]};
      --text-secondary: ${designTokens.colors.neutral[600]};
      --text-tertiary: ${designTokens.colors.neutral[400]};
      
      /* Border Colors */
      --border-color: ${designTokens.colors.neutral[200]};
      --border-color-hover: ${designTokens.colors.neutral[300]};
      
      /* Semantic Colors */
      --success-color: ${designTokens.colors.success};
      --warning-color: ${designTokens.colors.warning};
      --danger-color: ${designTokens.colors.danger};
      --info-color: ${designTokens.colors.info};
      
      /* Typography */
      --font-family: ${designTokens.typography.fontFamily};
      
      /* Border Radius */
      --radius-sm: ${designTokens.borderRadius.sm};
      --radius-md: ${designTokens.borderRadius.md};
      --radius-lg: ${designTokens.borderRadius.lg};
      --radius-xl: ${designTokens.borderRadius.xl};
      --radius-2xl: ${designTokens.borderRadius['2xl']};
      --radius-full: ${designTokens.borderRadius.full};
      
      /* Shadows */
      --shadow-sm: ${designTokens.boxShadow.sm};
      --shadow-md: ${designTokens.boxShadow.md};
      --shadow-lg: ${designTokens.boxShadow.lg};
      --shadow-xl: ${designTokens.boxShadow.xl};
      --shadow-2xl: ${designTokens.boxShadow['2xl']};
      
      /* Transitions */
      --transition-fast: ${designTokens.transition.duration.fast} ${designTokens.transition.timing};
      --transition-normal: ${designTokens.transition.duration.normal} ${designTokens.transition.timing};
      --transition-slow: ${designTokens.transition.duration.slow} ${designTokens.transition.timing};
      
      /* Z-Indexes */
      --z-dropdown: ${designTokens.zIndex.dropdown};
      --z-sticky: ${designTokens.zIndex.sticky};
      --z-fixed: ${designTokens.zIndex.fixed};
      --z-modal: ${designTokens.zIndex.modal};
      --z-popover: ${designTokens.zIndex.popover};
      --z-toast: ${designTokens.zIndex.toast};
      
      /* Print Dimensions */
      --print-a4-width: ${designTokens.print.a4.width};
      --print-a4-height: ${designTokens.print.a4.height};
      --print-content-height: ${designTokens.print.a4.contentHeight};
    }
    
    /* Dark Mode Support */
    @media (prefers-color-scheme: dark) {
      :root {
        --bg-primary: ${designTokens.colors.neutral[900]};
        --bg-secondary: ${designTokens.colors.neutral[800]};
        --bg-tertiary: ${designTokens.colors.neutral[700]};
        --text-primary: ${designTokens.colors.neutral[50]};
        --text-secondary: ${designTokens.colors.neutral[200]};
        --text-tertiary: ${designTokens.colors.neutral[400]};
        --border-color: ${designTokens.colors.neutral[700]};
        --border-color-hover: ${designTokens.colors.neutral[600]};
      }
    }
  `;
}

/**
 * Pre-defined brand palettes for different industries
 */
export const brandPalettes = [
  { 
    id: 'verde-campania', 
    name: 'Verde Campania', 
    primary: '#2C5E43', 
    secondary: '#8CB89D', 
    desc: 'Fresco, naturale, biologico',
    industry: 'Alimentari'
  },
  { 
    id: 'azzurro-costiera', 
    name: 'Azzurro Costiera', 
    primary: '#1E6091', 
    secondary: '#76C893', 
    desc: 'Solare, marittimo, vivace',
    industry: 'Pescheria/Ristorante'
  },
  { 
    id: 'rosso-pompei', 
    name: 'Rosso Pompei', 
    primary: '#A62B2B', 
    secondary: '#D9A05B', 
    desc: 'Tradizionale, caldo, storico',
    industry: 'Generale'
  },
  { 
    id: 'sole-del-sud', 
    name: 'Sole del Sud', 
    primary: '#D97706', 
    secondary: '#FCD34D', 
    desc: 'Accogliente, energico, luminoso',
    industry: 'Alimentari'
  },
  { 
    id: 'vesuvio-notte', 
    name: 'Vesuvio Notte', 
    primary: '#1F2937', 
    secondary: '#EF4444', 
    desc: 'Moderno, deciso, contrastato',
    industry: 'Tech/Elettronica'
  },
  { 
    id: 'oro-nero', 
    name: 'Oro & Nero', 
    primary: '#111827', 
    secondary: '#D4AF37', 
    desc: 'Elegante, premium, raffinato',
    industry: 'Beauty/Lusso'
  },
];

export default designTokens;
