# 银河渡舟's Blog

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/tiny.svg)](https://astro.build)
[![Netlify Status](https://api.netlify.com/api/v1/badges/f603c52a-adbe-413d-a035-df609eb41392/deploy-status)](https://app.netlify.com/sites/wider/deploys)

This is the source code for my blog, which is built with [Astro](https://astro.build), and deployed to [Netlify](https://netlify.com).

## Examples

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
git clone https://https://github.com/izmttk/astro-mecure.git
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

## Configuration

more details in [config.ts](./src/config.ts)

```ts
const config: Config = {
  title: '<site_title>',
  description: '<site_description>',
  author: '<author_name>',
  favicon: url('favicon.ico'),
  navbar: {
    menu: [ // menu support cascading
      {
        label: 'demo',
        icon: 'tabler:menu-2', // optional, you can use tabler icons
        children: [ // optional, children and url are mutually exclusive
          { label: 'SubItem1', url: '#', icon: 'tabler:circle'},
          { label: 'SubItem2', url: '#', icon: 'tabler:circle'},
          {
            label: 'SubItem3',
            icon: 'tabler:menu-2',
            children: [
              { label: 'SubItem1', url: '#', icon: 'tabler:circle'},
              { label: 'SubItem2', url: '#', icon: 'tabler:circle'},
              { label: 'SubItem3', url: '#', icon: 'tabler:circle'},
            ]
          },
        ]
      },
    ],
    hasSearchToggle: true, // search is powered by algolia
    hasThemeToggle: true, // dark mode toggle button
  },
  hero: {
    bg: url('/assets/hero-bg.jpg'),
    title: '<hero_title>', // title and logo are mutually exclusive
    description: '<hero_description>',
    logo: url('/assets/logo.svg'),
  },
  sidebar: {
    widgets: [ // widget config
      {
        name: 'profile',
        author: '<author_name>',
        description: '<author_description>',
        avatar: url('/assets/avatar.png'),
        background: url('/assets/profile-bg.jpg'),
        socialIcons: [
          {
            label: 'github',
            color: '#7c8690',
            icon: 'tabler:brand-github',
            url: ''
          },
          {
            label: 'bilibili',
            color: '#fc87b2',
            icon: 'tabler:brand-bilibili',
            url: ''
          },
          {
            label: 'netease music',
            color: '#ff4e6a',
            icon: 'tabler:brand-netease-music',
            url: ''
          },
          {
            label: 'twitter',
            color: '#1d9bf0',
            icon: 'tabler:brand-twitter',
            url: ''
          },
          {
            label: 'mail',
            color: '#7562c7',
            icon: 'tabler:mail',
            url: 'mailto:example@example.com'
          }
        ],
      },
      {
        name: 'tag-cloud',
        sortBy: 'count',
        order: 'desc',
        limit: 30,
      },
      {
        name: 'category-tree',
        sortBy: 'count',
        order: 'desc',
        expandDepth: 2,
      }
    ]
  },
  pagination: {
    hasControls: true,
    hasEdges: false,
    siblings: 2,
    boundaries: 1,
  },
  typography: {
    outdateTip: { // outdate tip will be shown when the post is outdate
      outdateLimit: 90, // days
    },
    license: {
      licenseName: 'CC BY-NC-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh',
      infoText: '转载或引用本文时请注明作者及出处，不得用于商业用途。',
    }
  },
  comment: {
    provider: 'giscus', // currently support giscus and waline
    options: {
      repo: 'xxxx/xxxxxxxxxxxxx',
      repoId: 'XXXXXXXXXX',
      category: 'General',
      categoryId: 'XXXXXXXXXXXXXXXXX',
      mapping: 'pathname',
      reactionsEnabled: '0',
      emitMetadata: '0',
      inputPosition: 'top',
      lang: 'zh-CN',
    },
    // provider: 'waline',
    // options: {
    //   serverURL: 'xxxxxxxxxxxxxxxx',
    //   meta: ['nick', 'mail', 'link'],
    //   requiredMeta: ['nick', 'mail'],
    //   wordLimit: 200,
    //   commentSorting: 'latest',
    //   login: 'disable',
    //   search: false,
    //   copyright: false,
    //   reaction: false,
    // }
  },
  footer: {
    links: [
      { label: '友情链接', url: url('friends')},
      { label: 'Github', url: 'https://github.com/izmttk'},
    ],
    declarations: [
      `Copyright © ${getYear(new Date())} 银河渡舟 All Rights Reserved.`,
    ],
    generator: true,
    rss: true,
    sitemap: true,
  },
  algolia: {
    appId: 'XXXXXXXXXX',
    apiKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    indexName: 'your_index_name',
  }
}
```
