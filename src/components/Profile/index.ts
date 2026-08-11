import type { ImageType } from '@/types';

export interface ProfileProps {
  avatar?: ImageType;
  background?: ImageType;
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