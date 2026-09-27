'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  mounted: false,
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // UI DESIGN RESET: Light theme enforced across application.
    document.documentElement.classList.remove('dark');
    setTheme('light');
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    // Temporarily disabled per UI Design Reset: light theme only.
    document.documentElement.classList.remove('dark');
    setTheme('light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
