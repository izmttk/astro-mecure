export { default } from './Navbar.astro';
export * from './Navbar.astro';

import type { MenuConfig } from '@/components/Menu';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

export interface NavbarConfig {
  logo?: string | AstroComponentFactory | Promise<{ default: AstroComponentFactory }>;
  menu?: MenuConfig;
  hasThemeToggle?: boolean;
  hasSearchToggle?: boolean;
}