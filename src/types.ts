import type { ImageMetadata, MarkdownHeading, MarkdownInstance } from 'astro';
export interface Tag {
  slug: string;
  label: string;
  url: string;
  count: number;
}

export interface Category {
  slug: string;
  label: string;
  url: string;
  count: number;
}

export interface Author {
  name: string;
  avatar?: string | ImageMetadata | Promise<{default: ImageMetadata}>;
  description?: string;
}

export interface Post {
  slug: string;
  url: string;
  title: string;
  date: Date;
  updateDate: Date;
  draft: boolean;
  category: Category;
  tags: Tag[];
  author: Author;

  excerpt?: string;
  image?: string | ImageMetadata | Promise<{default: ImageMetadata}>;
  permalink?: string;
  readingTime?: number;
  wordCount?: number;
  cardVariant?: 'blur' | 'material' | 'full' | 'plain';

  raw: string;
  headings: MarkdownHeading[];
  Content: MarkdownInstance<any>['Content'];
}


export interface Paginator {
  total: number;
  current: number;
  currentCount: number;
  totalCount: number;
  prev: number | null;
  next: number | null;
  pageUrls: string[];
}


export interface BasePage {
  title: string;
  description?: string;
  image?: string | ImageMetadata | Promise<{default: ImageMetadata}>;
  type?: never;
}


export interface IndexPage extends Omit<BasePage, 'type'> {
  type: 'index';
  posts: Omit<Post, 'Content'>[];
  paginator?: Paginator;
}

export interface PostPage extends Omit<BasePage, 'type'> {
  type: 'post';
  post: Omit<Post, 'Content'>;
  prev?: Omit<Post, 'Content'>;
  next?: Omit<Post, 'Content'>;
}

export interface CategoriesPage extends Omit<BasePage, 'type'> {
  type: 'categories';
  categories: Category[];
}

export interface TagsPage extends Omit<BasePage, 'type'> {
  type: 'tags';
  tags: Tag[];
}

export interface PostsPage extends Omit<BasePage, 'type'> {
  type: 'posts';
  posts: Omit<Post, 'Content'>[];
  paginator?: Paginator;
}

export interface ArchivePage extends Omit<BasePage, 'type'> {
  type: 'archive';
  posts: Omit<Post, 'Content'>[];
}

export type Page = IndexPage | PostPage | CategoriesPage | TagsPage | PostsPage | ArchivePage | BasePage;



import type { NavbarConfig as NavbarPartialConfig } from './partials/Navbar';
import type { HeroConfig as HeroPartialConfig } from './partials/Hero';
import type { CategoryTreeConfig, ComponentConfig, ProfileConfig, SidebarConfig as SidebarPartialConfig, TagCloudConfig } from './partials/Sidebar';
import type { PaginationConfig as PaginationPartialConfig } from './partials/Pagination';
import type { CommentConfig as CommentPartialConfig } from './partials/Comment';
import type { FooterConfig as FooterPartialConfig } from './partials/Footer';


interface Sortable {
  sortBy?: 'count' | 'label';
  order?: 'asc' | 'desc';
  limit?: number;
}

export type NavbarConfig = NavbarPartialConfig;
export type HeroConfig = Omit<HeroPartialConfig, 'info'>;


export type ComponentWidgetConfig = ComponentConfig;
export type ProfileWidgetConfig = ProfileConfig;
export type TagCloudWidgetConfig = Omit<TagCloudConfig, 'tags'> & Sortable;
export type CategoryTreeWidgetConfig = Omit<CategoryTreeConfig, 'categories'> & Sortable;

export type WidgetConfig = ComponentWidgetConfig | ProfileWidgetConfig | TagCloudWidgetConfig | CategoryTreeWidgetConfig;

export type SidebarConfig = Omit<SidebarPartialConfig, 'widgets'> & {
  widgets?: WidgetConfig[];
};

export type PaginationConfig = PaginationPartialConfig & {
  pageSize?: number;
}
export type CommentConfig = CommentPartialConfig;
export type FooterConfig = FooterPartialConfig;

export type ArticleConfig = {
  outdateTip?: false | {
    outdateLimit?: number;
  };
  license?: false | {
    licenseName: string;
    licenseUrl?: string;
    infoText?: string;
  }
};

export type AlgoliaConfig = {
  appId: string;
  apiKey: string;
  indexName: string;
}

export interface Config {
  title: string;
  description: string;
  author: string;
  favicon: string;
  navbar?: NavbarConfig | false;
  hero?: HeroConfig | false;
  sidebar?: SidebarConfig | false;
  pagination?: PaginationConfig | false;
  comment?: CommentConfig | false;
  footer?: FooterConfig | false;
  article?: ArticleConfig;
  algolia?: AlgoliaConfig;
}