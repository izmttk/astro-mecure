import { atom } from 'jotai';

export const navbarVisible = atom<boolean>(true);
export const navbarSize = atom<{
  width: number,
  height: number,
}>({
  width: 0,
  height: 0,
});

export const theme = atom<'light' | 'dark' | 'auto'>('auto');

export const sidebarDrawerVisible = atom<boolean>(false);
export const searchModelOpen = atom<boolean>(false);

export const hasThemeToggle = atom<boolean>(false);
export const hasSearchToggle = atom<boolean>(false);
