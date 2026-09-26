'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg border border-border bg-surface flex items-center justify-center opacity-60">
        <span className="w-3.5 h-3.5 rounded-full bg-muted"></span>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 rounded-lg border border-border bg-surface hover:bg-surface-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-primary/40"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-primary" />
      )}
    </button>
  );
}
