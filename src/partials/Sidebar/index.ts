import type { ProfileProps } from '@/components/Profile';
import type { TagCloudProps } from '@/components/TagCloud';
import type { CategoryTreeProps } from '@/components/CategoryTree';
import type { TocProps } from '@/components/Toc';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

export interface WidgetConfig {
  name: string;
  title?: string;
  show?: boolean;
}

export interface ComponentConfig extends WidgetConfig {
  name: 'component',
  component: AstroComponentFactory | Promise<{default: AstroComponentFactory}>;
}

export interface TocConfig extends TocProps, WidgetConfig {
  name: 'toc'
}

export interface ProfileConfig extends ProfileProps, WidgetConfig {
  name: 'profile'
}

export interface TagCloudConfig extends TagCloudProps, WidgetConfig {
  name: 'tag-cloud'
}

export interface CategoryTreeConfig extends CategoryTreeProps, WidgetConfig {
  name: 'category-tree'
}

export interface SidebarConfig {
  widgets?: (ComponentConfig | TocConfig | ProfileConfig | TagCloudConfig | CategoryTreeConfig)[];
}

export { default } from './Sidebar.astro';
export * from './Sidebar.astro';