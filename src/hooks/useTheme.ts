import { useStore } from "@nanostores/react";
import { theme as themeStore } from "../store/states";
import { useLocalStorage, useMedia } from "react-use";
import { useEffect } from "react";

export type Theme = 'light' | 'dark' | 'auto';

export default function useTheme(defaultTheme: Theme = 'auto') {
  const isMatchDark = useMedia('(prefers-color-scheme: dark)');
  const [value, setValue, remove] = useLocalStorage<Theme>('theme', defaultTheme);
  const themeStoreValue = useStore(themeStore);
  const theme = themeStoreValue === 'auto' ? (isMatchDark ? 'dark' : 'light') : themeStoreValue;

  useEffect(() => {
    if (value && value !== themeStoreValue) {
      themeStore.set(value);
    }
  }, [])
  
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    }
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [theme]);

  const setTheme = (theme: Theme) => {
    setValue(theme);
    themeStore.set(theme);
  }

  return {
    colorMode: theme,
    theme: themeStoreValue,
    setTheme: setTheme,
  }
}