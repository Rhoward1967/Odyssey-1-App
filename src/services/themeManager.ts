/**
 * Theme Manager Service
 * Handles dynamic theme switching based on industry selection
 * Part of ODYSSEY-1's "shape-shifting" subscription model
 */

interface IndustryTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: {
    headerStyle: 'classic' | 'modern' | 'minimal';
    heroLayout: 'centered' | 'split' | 'fullscreen';
    footerStyle: 'simple' | 'detailed' | 'minimal';
  };
  components: {
    ctaButton: string;
    cardStyle: string;
    navigationStyle: string;
  };
}

export const industryThemes: Record<string, IndustryTheme> = {
  lawyer: {
    id: 'lawyer',
    name: 'Legal Professional',
    colors: {
      primary: '#1a365d',    // Deep navy
      secondary: '#d4af37',  // Gold
      accent: '#2c5282',     // Royal blue
      background: '#ffffff',
      text: '#1a202c'
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Inter, sans-serif'
    },
    layout: {
      headerStyle: 'classic',
      heroLayout: 'centered',
      footerStyle: 'detailed'
    },
    components: {
      ctaButton: 'solid-primary',
      cardStyle: 'bordered-shadow',
      navigationStyle: 'horizontal-centered'
    }
  },
  plumber: {
    id: 'plumber',
    name: 'Plumbing Services',
    colors: {
      primary: '#2563eb',    // Trust blue
      secondary: '#fbbf24',  // Caution yellow
      accent: '#dc2626',     // Emergency red
      background: '#f8fafc',
      text: '#0f172a'
    },
    fonts: {
      heading: 'Roboto, sans-serif',
      body: 'Open Sans, sans-serif'
    },
    layout: {
      headerStyle: 'modern',
      heroLayout: 'split',
      footerStyle: 'simple'
    },
    components: {
      ctaButton: 'solid-accent',
      cardStyle: 'flat-hover',
      navigationStyle: 'horizontal-left'
    }
  },
  baker: {
    id: 'baker',
    name: 'Bakery & Pastries',
    colors: {
      primary: '#f59e0b',    // Warm amber
      secondary: '#fef3c7',  // Cream
      accent: '#d97706',     // Rich orange
      background: '#fffbeb',
      text: '#78350f'
    },
    fonts: {
      heading: 'Pacifico, cursive',
      body: 'Lato, sans-serif'
    },
    layout: {
      headerStyle: 'minimal',
      heroLayout: 'fullscreen',
      footerStyle: 'simple'
    },
    components: {
      ctaButton: 'rounded-primary',
      cardStyle: 'rounded-shadow',
      navigationStyle: 'centered-floating'
    }
  },
  // ...existing code... (Add remaining 14 industries)
};

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: IndustryTheme | null = null;

  private constructor() {}

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  /**
   * Apply theme based on industry selection
   */
  applyTheme(industryId: string): void {
    const theme = industryThemes[industryId];
    if (!theme) {
      console.error(`Theme not found for industry: ${industryId}`);
      return;
    }

    this.currentTheme = theme;
    this.injectThemeStyles(theme);
    this.updateFonts(theme);
    this.saveThemePreference(industryId);
  }

  /**
   * Inject theme CSS variables into document
   */
  private injectThemeStyles(theme: IndustryTheme): void {
    const root = document.documentElement;
    
    // Apply color variables
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-text', theme.colors.text);

    // Apply font variables
    root.style.setProperty('--font-heading', theme.fonts.heading);
    root.style.setProperty('--font-body', theme.fonts.body);

    // Trigger re-render by dispatching custom event
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
  }

  /**
   * Load and apply custom fonts
   */
  private updateFonts(theme: IndustryTheme): void {
    // Check if fonts are already loaded
    const existingLink = document.getElementById('industry-theme-fonts');
    if (existingLink) {
      existingLink.remove();
    }

    // Create Google Fonts link
    const headingFont = theme.fonts.heading.split(',')[0].trim();
    const bodyFont = theme.fonts.body.split(',')[0].trim();
    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(headingFont)}:wght@400;600;700&family=${encodeURIComponent(bodyFont)}:wght@300;400;500&display=swap`;

    const link = document.createElement('link');
    link.id = 'industry-theme-fonts';
    link.rel = 'stylesheet';
    link.href = fontUrl;
    document.head.appendChild(link);
  }

  /**
   * Save theme preference to localStorage
   */
  private saveThemePreference(industryId: string): void {
    localStorage.setItem('selectedIndustryTheme', industryId);
  }

  /**
   * Load saved theme preference
   */
  loadSavedTheme(): void {
    const savedTheme = localStorage.getItem('selectedIndustryTheme');
    if (savedTheme && industryThemes[savedTheme]) {
      this.applyTheme(savedTheme);
    }
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): IndustryTheme | null {
    return this.currentTheme;
  }

  /**
   * Reset to default theme
   */
  resetTheme(): void {
    this.currentTheme = null;
    localStorage.removeItem('selectedIndustryTheme');
    
    const root = document.documentElement;
    root.style.removeProperty('--color-primary');
    root.style.removeProperty('--color-secondary');
    root.style.removeProperty('--color-accent');
    root.style.removeProperty('--color-background');
    root.style.removeProperty('--color-text');
    root.style.removeProperty('--font-heading');
    root.style.removeProperty('--font-body');
  }
}

// Export singleton instance
export const themeManager = ThemeManager.getInstance();