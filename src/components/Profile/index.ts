export { default } from './Profile.astro';
export * from './Profile.astro';
import type { ImageMetadata } from 'astro';

export interface ProfileProps {
  avatar?: string | ImageMetadata;
  background?: string | ImageMetadata;
  author?: string;
  description?: string;
  socialIcons?: {
    label: string;
    color?: string;
    icon: string;
    url: string;
  }[];
}