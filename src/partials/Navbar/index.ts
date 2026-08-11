export { default } from './Navbar.astro';
export * from './Navbar.astro';

import type { MenuConfig } from '@/components/Menu';
import type { ImageType } from '@/types';

export interface NavbarConfig {
  logo?: ImageType;
  menu?: MenuConfig;
  hasThemeToggle?: boolean;
  hasSearchToggle?: boolean;
}