import type { ImageMetadata } from 'astro';

export interface ProfileProps {
  avatar?: string | ImageMetadata | Promise<{default: ImageMetadata}>;
  background?: string | ImageMetadata | Promise<{default: ImageMetadata}>;
  author?: string;
  description?: string;
  socialIcons?: {
    label: string;
    color?: string;
    icon: string;
    url: string;
  }[];
}

export { default } from './Profile.astro';
export * from './Profile.astro';