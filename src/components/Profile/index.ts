export { default } from './Profile.astro';
export * from './Profile.astro';

export interface ProfileProps {
  avatar?: string;
  background?: string;
  author?: string;
  description?: string;
  socialIcons?: {
    label: string;
    color?: string;
    icon: string;
    url: string;
  }[];
}