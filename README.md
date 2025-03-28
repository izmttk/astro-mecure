# 银河渡舟's Blog

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/tiny.svg)](https://astro.build)
[![Netlify Status](https://api.netlify.com/api/v1/badges/f603c52a-adbe-413d-a035-df609eb41392/deploy-status)](https://app.netlify.com/sites/wider/deploys)

This is the source code for my blog, which is built with [Astro](https://astro.build), and deployed to [Netlify](https://netlify.com).

## Preview

![Theme Preview](https://github.com/izmttk/astro-mecure/assets/26360968/4c79fba0-390d-48f6-a887-bcbc39c5e462)

- 银河渡舟的小站: <https://suborbit.net>

## Features

- [x] Markdown and MDX support
- [x] More markdown syntax
- [x] Responsive Design
- [x] RSS
- [x] Sitemap
- [x] Algolia Search
- [x] Comments
- [x] Dark Mode
- [x] Pagination
- [x] View Transitions
- [x] TypeScript support
- [x] Outdate Tip
- [x] License Info

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/izmttk/astro-mecure.git
cd astro-mecure
```

### 2. Install dependencies

```bash
npm install
# or if you want to develop the site
npm install -D
```

### 3. Run the dev server

```bash
npm run dev
```

### 4. Build and Preview

```bash
npm run build
npm run preview
```

### 5. Deploy

You can deploy your site to any static hosting provider.

But when you enable giscus comments, you need to set HTTP header `Allow-Access-Control-Origin` to `*` or `giscus.app` in your server.
Otherwise, you will get a CORS error. This is necessary for giscus custom theme to work properly.

## Commands

All commands are run from the root of the project, from a terminal:

| Command                    | Action                                             |
| :------------------------- | :------------------------------------------------- |
| `npm install`              | Installs dependencies                              |
| `npm run dev`              | Starts local dev server                            |
| `npm run build`            | Build your production site to `/dist/`             |
| `npm run preview`          | Preview your build locally, before deploying       |
| `npm run create-post`      | Create a new post in `/src/content/blog/`          |
| `npm run create-component` | Create a new component in `/src/components/`       |

## Tech Stack

- [Astro](https://astro.build) (static site generator)
- [React](https://reactjs.org) (ui library)
- [TypeScript](https://www.typescriptlang.org) (static type checker)
- [Tailwind CSS](https://tailwindcss.com) (utility-first css framework)
- [PostCSS](https://postcss.org) (css post-processor)
- [Radix UI](https://radix-ui.com) (headless ui components)
- [React Use](https://github.com/streamich/react-use) (react hooks)
- [Jotai](https://jotai.org) (state management)
- [React Spring](https://www.react-spring.dev/) (animations)
- [unplugin-icons](https://github.com/unplugin/unplugin-icons) (icon plugin for vite)
- [date-fns](https://date-fns.org/) (date utility library)
- some other libs have not been listed yet.

## Project Structure

```plaintext
/
├── plugins/             # remark and rehype plugins
├── public/              # static assets for the site
│   ├── assets/
│   └── favicon.ico
├── scripts/             # some useful scripts
├── src/
│   ├── assets/
│   ├── components/
│   ├── content/
│   │   ├── authors/     # where author bios live
│   │   ├── blog/        # where blog posts live, write your post here
│   │   │   └── _drafts/ # drafts will not be built or pushed to git
│   │   ├── friends/     # where friends info live
│   │   └── config.ts    # astro's content collection config
│   ├── hooks/           # react hooks
│   ├── layouts/         # some layouts
│   ├── pages/           # routes
│   ├── partials/        # partials which is combination of components
│   ├── store/           # global store
│   ├── styles/          # styles
│   ├── utils/           # utility functions
│   ├── config.ts        # theme config
│   ├── env.d.ts
│   ├── shim.d.ts
│   └── types.ts         # all types
├── .gitignore
├── astro.config.ts      # astro config
├── package.json
├── postcss.config.cjs   # postcss config
├── tailwind.config.ts   # tailwind config
└── tsconfig.json
```

## Frontmatter

An example of a blog post frontmatter:

```yaml
---
title: Hello, Astro!
slug: hello-astro
date: 2022-01-01
updateDate: 2022-01-01 08:00:00
author: john
description: This is a blog post.
image: hello-astro.jpg
tags:
  - Astro
  - Blog
  - Markdown
category:
  - Web Development
  - Frontend
  - Astro
draft: false
cardVariant: blur
---
```

- `title` **required**
  
  Title of the post.

- `slug`
  
  slug of the post used in the url.

- `date`
  
  Date of the post. If not provided, it will use the first git commit date of the post file.
  
  You can use a relaxed format like `2022-01-01`, `2022-01-01 08:00:00`, or ISO 8601 format. e.g. `2022-01-01T08:00:00Z`.

- `updateDate`
  
  Date of the last update. If not provided, it will use the last git commit date of the post file.

- `author`
  
  Author id of the post. The author should be defined in `src/content/authors/` previously. If author id can't be found, `config.author` will be used as the default author name.

  Authors in `src/content/authors/` should be defined in `json` format. The file name is the corresponding author id.
  
  ```json
  // src/content/authors/john.json
  {
    "name": "John",
    "description": "This is a bio of John Doe.",
  }
  ```

  Default value is `default`. You can create `default.json` as the default author.

- `description`
  
  Description of the post.

- `image`
  
  Cover image of the post. Use a relative file path to the markdown file. Any path that can't be resolved will be reserved as is.

- `tags`
  
  Tags of the post. Tags is a set without hierarchical structure. **One post can have multiple tags.** For example, `[Astro, Blog, Markdown]` means the post is tagged with `Astro`, `Blog`, and `Markdown`.

- `category`
  
  Category of the post. Categories is a tree structure. **One post must have only one category.** For example, `[Web Development, Frontend, Astro]` means the post is in the `Web Development/Frontend/Astro` category. If not provided, the post will be in the `Uncategorized` category.

- `draft`
  
  Whether the post is a draft. default is `false`. Any file or folder starts with `_` will be ignored in astro's content collection.

- `cardVariant`
  
  Card style of the post shown in the home page. It can be `blur`, `material`, `full`, or `plain`. default is `blur`.
  
  Still working in progress.

## Configuration

### Example

```ts
export default {
  title: 'My Blog',
  description: 'This is my blog.',
  author: 'John',
  favicon: '/favicon.ico',
  navbar: { /* ... */ },
  hero: { /* ... */ },
  sidebar: { /* ... */ },
  pagination: { /* ... */ },
  article: { /* ... */ },
  comment: { /* ... */ },
  footer: { /* ... */ },
  algolia: { /* ... */ }
}
```

more details in [config.ts](./src/config.ts)

### Special Fields

#### Image

Some fields are of type `Image`, you can provide a string or an `ImageMetadata` object.

If it's a string, it will be kept as is. If it's an `ImageMetadata` object, it will be processed by astro built-in optimization.

If you want to process your image with astro, you can write your config like this:

```ts
import AvatarImage from './assets/avatar.jpg';
const config = {
  // imported image
  avatar: AvatarImage
  // or even using dymatic import
  background: import('./assets/background.jpg')
}
```

#### Url

Some fields are url strings which can be clicked to navigate to the target page. But if you want to set an internal link, you can use the `url` utility function to generate the url. It will join the base url of the site and the provided path.

```ts
import { url } from '@/utils/url';

const config = {
  // internal link: /base-path/your-path
  link: url('/your-path'),
}
```

#### Icon

Some fields are icon strings which can be used to show an icon. The format of the icon is `<pack>:<icon>`, such as `tabler:home`. You can explore more icons in [Icônes](https://icones.js.org/). Before using a pack, you need to install icon set dependencies. For example, to use `mdi` icons, you need to install `@iconify-json/mdi` package.

```bash
npm install @iconify-json/mdi
```

We have already installed `tabler` and `mingcute` icons for you.

### Site Options

#### title

**Type**: `string`

Title of your site. This will be used in the meta data of your site.

#### description

**Type**: `string`

Description of your site. This will be used in the meta data of your site.

#### author

**Type**: `string`

Author name of the site. This will be used in the meta data of your site.

#### favicon

**Type**: `string`

Path to the favicon of your site. You need to put your favicon in the `public` folder.

### Navbar Options

Navbar is always floating on top of viewport. It can be disabled by setting `navbar` to `false`, or you should provide a `navbar` object with the following options.

#### navbar.logo

**Type**: `Image | AstroComponentFactory | undefined`

**Default**: `undefined`

Brand logo of the site. It will be shown at the left side of the navbar.

To customize the logo, you can provide an astro component as the logo. For example:

```ts
import LogoWithAnimation from '@/custom/NavLogo.astro';
const config = {
  navbar: {
    logo: LogoWithAnimation,
    // or you can use dynamic import
    // logo: import('@/custom/NavLogo.astro'),
  }
}
```

#### navbar.menu

**Type**: `MenuConfig`

**Default**: `[]`

Menu will be shown in the navbar. The type of `MenuItem` is:

```ts
type MenuConfig = (MenuSubItemConfig | MenuLinkItemConfig)[];
interface MenuLinkItemConfig {
  label: string;
  url: string;
  icon?: string;
}

interface MenuSubItemConfig {
  label: string;
  icon?: string;
  children: MenuConfig;
}
```

- `label`

  **Type**: `string`
  
  Label of the menu item.

- `url`

  **Type**: `string`

  URL of the menu item. sub menu item has no url.

- `icon`

  **Type**: `string | undefined`

  **Default**: `undefined`

  Each item supports an optional icon before the label.

- `children`

  **Type**: `MenuConfig`

  **Default**: `[]`

  For sub menu item, you can provide a `children` array to create a dropdown menu, which follows the same format as `MenuConfig`. Sub menu supports cascading.

  ```ts
  {
    label: 'menu demo',
    icon: 'tabler:menu-2',
    children: [
      { label: 'SubItem1', url: '#', icon: 'tabler:circle'},
      { label: 'SubItem2', url: '#', icon: 'tabler:circle'},
      {
        label: 'SubItem3',
        icon: 'tabler:menu-2',
        children: [
          { label: 'SubItem1', url: '#', icon: 'tabler:circle'},
          { label: 'SubItem2', url: '#', icon: 'tabler:circle'},
          { label: 'SubItem3', url: '#', icon: 'tabler:circle'}
        ]
      }
    ]
  }
  ```

#### navbar.hasSearchToggle

**Type**: `boolean`

**Default**: `true`

Whether to show search button in navbar.

#### navbar.hasThemeToggle

**Type**: `boolean`

**Default**: `true`

Whether to show dark mode switch button in navbar.

### Hero Options

Hero section is the first area of a web page, providing some key information of the page. It can be disabled by setting `hero` to `false`.

#### hero.background

**Type**: `Image`

Background image of the hero section.

#### hero.description

**Type**: `string | undefined`

**Default**: `undefined`

Description in hero section. It will be shown below the title or logo.

#### hero.title

**Type**: `string | AstroComponentFactory |undefined`

**Default**: `undefined`

Title in hero section. Title will be only displayed in homepage. If not provided, the title of the site(see `title` in site options) will be used.

To customize the title, you can provide an astro component as the title. For example:

```ts
import LogoWithAnimation from '@/custom/Logo.astro';
const config = {
  hero: {
    title: LogoWithAnimation,
    // or you can use dynamic import
    // title: import('@/custom/Logo.astro'),
  }
}
```

### Sidebar Options

Sidebar is a section on the right side of the page. It contains some widgets and can be disabled by setting `sidebar` to `false`.

#### sidebar.widgets

**Type**: `WidgetConfig[]`

**Default**: `[]`

We provide 4 types of widgets: `profile`, `tag-cloud`, `category-tree`, and `component`. They will be shown in the order you provide.\
Each widget has 3 public properties: `name`, `title`, and `show`.

- `name`

  **Type**: `'profile' | 'tag-cloud' | 'category-tree' | 'component'`
  
  Name of the widget.

- `title`

  **Type**: `string | undefined`

  Title of the widget. Title will be shown at the top of the widget.

- `show`

  **Type**: `boolean`

  **Default**: `true`

  Show or hide the widget.

##### Profile Widget

- `author`

  **Type**: `string | undefined`

  Author Name shown in the profile widget.

- `avatar`

  **Type**: `Image | undefined`

  Avatar image shown in the profile widget.

- `description`

  **Type**: `string | undefined`

  Description shown in the profile widget.

- `socialIcons`

  **Type**: `SocialIcon[]`

  **Default**: `[]`

  Social icons. The type of `SocialIcon` is:

  ```ts
  interface SocialIcon {
    label: string;
    color?: string;
    icon: string; // format: <pack>:<icon>
    url: string;
  }
  ```

##### Tag Cloud Widget

- `sortBy`

  **Type**: `'label' | 'count'`

  **Default**: `'count'`

  Sort the tags by tag label or article count.

- `order`

  **Type**: `'asc' | 'desc'`

  **Default**: `'desc'`

  Sort the tags in ascending or descending order.

- `limit`

  **Type**: `number | undefined`

  **Default**: `30`

  Limit the number of tags shown in the tag cloud widget. If you set `limit` to `undefined`, all tags will be shown.

##### Category Tree Widget

- `sortBy`

  **Type**: `'label' | 'count'`

  **Default**: `'count'`

  Sort the tags by tag label or article count.

- `order`

  **Type**: `'asc' | 'desc'`

  **Default**: `'desc'`

  Sort the tags in ascending or descending order.

- `limit`

  **Type**: `number | undefined`

  **Default**: `undefined`

  Limit the number of categories shown in the category tree widget. If you set `limit` to `undefined`, all categories will be shown.

- `expandDepth`

  **Type**: `number`

  **Default**: `2`

  The depth of the category tree to expand. Any category deeper than this depth will not be shown.

##### Component Widget

- `component`

  **Type**: `AstroComponentFactory`
  
  You can provide an astro component to the widget as a totally custom widget. For example:

  ```ts
  import Greeting from '@/components/Greeting.astro';
  const config = {
    widgets: [
      {
        name: 'component',
        component: Greeting 
      },
      {
        // or you can use dynamic import
        name: 'component',
        component: import('@/components/Greeting.astro')
      }
    ]
  }
  ```

### Pagination Options

When a page contains a list of articles, pagination will be shown at the bottom of the page. It can be disabled by setting `pagination` to `false`.

#### pagination.pageSize

**Type**: `number`

**Default**: `10`

The number of articles per page.

#### pagination.hasControls

**Type**: `boolean`

**Default**: `true`

Show or hide prev/next control buttons.

#### pagination.hasEdges

**Type**: `boolean`

**Default**: `false`

Show or hide first/last control buttons.

#### pagination.siblings

**Type**: `number`

**Default**: `1`

Amount of sibling pages on left/right side of current page.

#### pagination.boundaries

**Type**: `number`

**Default**: `1`

Amount of pages visible on left/right edges.

### Article Options

Options for some elements in the article page.

#### article.outdateTip

**Type**: `false | outdateTipConfig`

Show an outdate tip at the top of the article when the article is out of date. It can be disabled by setting `outdateTip` to `false`.

`outdateTipConfig` is an object with `outdateLimit` properties.

##### article.outdateTip.outdateLimit

**Type**: `number`

**Default**: `30`

The number of days after which the article is considered out of date.

#### article.license

**Type**: `false | licenseConfig`

Show a license info at the bottom of the article. It can be disabled by setting `license` to `false`.

`licenseConfig` is an object containing `licenseName`, `licenseUrl`, `infoText` properties.

##### article.license.licenseName

**Type**: `string`

Name of the license, e.g. `CC BY-NC-SA 4.0`. If you use CC license, you can find the license name in the [CC License Chooser](https://creativecommons.org/choose/).

##### article.license.licenseUrl

**Type**: `string | undefined`

**Default**: `undefined`

URL of the license, e.g. `https://creativecommons.org/licenses/by-nc-sa/4.0/`.

##### article.license.infoText

**Type**: `string | undefined`

**Default**: `undefined`

Info text of the license, e.g. `This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.`.

### Comment Options

We support two comment providers: `giscus` and `waline` now. You can choose one of them. It can be disabled by setting `comment` to `false`.

#### comment.provider

**Type**: `giscus | waline`

Choose a comment provider.

#### comment.options

**Type**: `giscusOptions | walineOptions`

Options for the comment provider. You can find the details in the [Giscus Component](https://github.com/giscus/giscus-component) and [Waline Component Props](https://waline.js.org/reference/client/props.html) documentation.

### Footer Options

Footer section is at the bottom of every page. It can be disabled by setting `footer` to `false`.

#### footer.links

**Type**: `FooterLink[]`

Links in the footer. The type of `FooterLink` is:

```ts
interface FooterLink {
  label: string;
  url: string;
}
```

- `label`

  **Type**: `string`
  
  Label of the link.

- `url`

  **Type**: `string`

  URL of the link.

#### footer.declarations

**Type**: `string[]`

**Default**: `[]`

A set of declarative statements in the footer. It can be used to declare the license, the author, the technology stack, etc.

#### footer.generator

**Type**: `boolean`

**Default**: `true`

Whether to show the generator info in the footer.

#### footer.rss

**Type**: `boolean`

**Default**: `true`

Whether to show the RSS link in the footer.

#### footer.sitemap

**Type**: `boolean`

**Default**: `true`

Whether to show the sitemap link in the footer.

### Search Options

We support Algolia DocSearch now. You should apply for [Algolia DocSearch](https://docsearch.algolia.com/) and get the `appId`, `apiKey`, and `indexName`.

#### algolia.appId

**Type**: `string`

Your Algolia application ID.

#### algolia.apiKey

**Type**: `string`

Your Algolia Search API key.

#### algolia.indexName

**Type**: `string`

Your Algolia index name.
