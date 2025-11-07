import React, { useEffect, useState } from 'react';
import { themeManager } from '../services/themeManager';

interface ThemeAwareLayoutProps {
  children: React.ReactNode;
}

export default function ThemeAwareLayout({ children }: ThemeAwareLayoutProps) {
  const [theme, setTheme] = useState(themeManager.getCurrentTheme());

  useEffect(() => {
    // Load saved theme on mount
    themeManager.loadSavedTheme();
    setTheme(themeManager.getCurrentTheme());

    // Listen for theme changes
    const handleThemeChange = (event: CustomEvent) => {
      setTheme(event.detail);
    };

    window.addEventListener('themeChanged', handleThemeChange as EventListener);

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange as EventListener);
    };
  }, []);

  // Apply theme-specific body classes
  useEffect(() => {
    if (theme) {
      document.body.className = `theme-${theme.id}`;
    } else {
      document.body.className = '';
    }
  }, [theme]);

  return (
    <div 
      className="theme-aware-layout min-h-screen"
      style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-body)'
      }}
    >
      {children}
    </div>
  );
}
