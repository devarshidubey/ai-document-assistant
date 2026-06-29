import { useEffect, useState } from 'react';
import { getTheme, setTheme as persistTheme } from '../utils/storage';

function resolveTheme(preference) {
  if (preference === 'dark') return 'dark';
  if (preference === 'light') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setThemeState] = useState(() => getTheme());

  useEffect(() => {
    const applied = resolveTheme(theme);
    document.documentElement.classList.toggle('dark', applied === 'dark');
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (getTheme() === 'system') {
        document.documentElement.classList.toggle('dark', media.matches);
      }
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const setTheme = (next) => {
    persistTheme(next);
    setThemeState(next);
  };

  const toggleTheme = () => {
    const current = resolveTheme(theme);
    setTheme(current === 'dark' ? 'light' : 'dark');
  };

  return { theme, setTheme, toggleTheme, isDark: resolveTheme(theme) === 'dark' };
}
