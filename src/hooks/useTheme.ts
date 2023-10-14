import { useAtom, useSetAtom } from 'jotai';
import { theme as themeAtom } from '@/store/atoms';
import { useLocalStorage, useMedia } from 'react-use';
import { useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

export default function useTheme(defaultTheme: Theme = 'auto') {
  const isMatchDark = useMedia('(prefers-color-scheme: dark)');
  const [value, setValue, remove] = useLocalStorage<Theme>('theme', defaultTheme);
  const [theme, setTheme] = useAtom(themeAtom);

  const colorMode = theme === 'auto' ? (
    value === 'auto' ? (isMatchDark ? 'dark' : 'light') : value
  ) : theme;
  useEffect(() => {
    if (value && value !== theme) {
      setTheme(value);
    }
  }, [])

  useEffect(() => {
    if (colorMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    }
    if (colorMode === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [colorMode]);

  const setThemeAndStorage = (theme: Theme) => {
    setValue(theme);
    setTheme(theme);
  }

  return {
    colorMode: colorMode,
    theme: theme,
    setTheme: setThemeAndStorage,
  }
}