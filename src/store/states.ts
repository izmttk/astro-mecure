import { atom, action , task } from 'nanostores'

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
