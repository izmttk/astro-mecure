import type { Config } from './types';
import { getYear } from 'date-fns';
import urlJoin from 'url-join';

const config: Config = {
  title: '银河渡舟',
  description: '醉后不知天在水，满船清梦压星河。',
  author: 'Wider',
  favicon: urlJoin(import.meta.env.BASE_URL, 'favicon.svg'),
  navbar: {
    menu: [
      {
        label: '首页',
        url: urlJoin(import.meta.env.BASE_URL, '/'),
        icon: 'tabler:home'
      },
      {
        label: '标签',
        url: urlJoin(import.meta.env.BASE_URL, '/tags'),
        icon: 'tabler:tag'
      },
      {
        label: '分类',
        url: urlJoin(import.meta.env.BASE_URL, '/categories'),
        icon: 'tabler:category'
      },
      {
        label: '归档',
        url: urlJoin(import.meta.env.BASE_URL, '/archive'),
        icon: 'tabler:archive'
      },
      {
        label: '友链',
        url: urlJoin(import.meta.env.BASE_URL, '/friends'),
        icon: 'tabler:heart-handshake'
      },
      {
        label: '关于',
        url: urlJoin(import.meta.env.BASE_URL, '/about'),
        icon: 'tabler:info-circle'
      },
      {
        label: '菜单示例',
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
              { label: 'SubItem3', url: '#', icon: 'tabler:circle'},
            ]
          },
        ]
      },
    ],
    hasSearchToggle: true,
    hasThemeToggle: true,
  },
  hero: {
    bg: urlJoin(import.meta.env.BASE_URL, '/assets/hero-bg.jpg'),
    // title: '银河渡舟',
    description: '醉后不知天在水，满船清梦压星河。',
  },
  sidebar: {
    widgets: [
      {
        name: 'profile',
        author: '银河渡舟',
        description: '醉后不知天在水，满船清梦压星河',
        avatar: urlJoin(import.meta.env.BASE_URL, '/assets/avatar.png'),
        background: urlJoin(import.meta.env.BASE_URL, '/assets/profile-bg.webp'),
        socialIcons: [
          {
            label: 'github',
            color: '#7c8690',
            icon: 'tabler:brand-github',
            url: 'https://github.com/izmttk'
          },
          {
            label: 'bilibili',
            color: '#fc87b2',
            icon: 'tabler:brand-bilibili',
            url: 'https://space.bilibili.com/293591084'
          },
          {
            label: 'netease music',
            color: '#ff4e6a',
            icon: 'tabler:brand-netease-music',
            url: 'https://music.163.com/user/390631653'
          },
          {
            label: 'twitter',
            color: '#1d9bf0',
            icon: 'tabler:brand-twitter',
            url: 'https://twitter.com/vviderx'
          },
          {
            label: 'mail',
            color: '#7562c7',
            icon: 'tabler:mail',
            url: 'mailto:widergao@gmail.com'
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
  comment: {
    // vender: 'giscus',
    // options: {
    //   repo: 'izmttk/izmttk.github.io',
    //   repoId: 'MDEwOlJlcG9zaXRvcnkzMzk3MjAyODQ=',
    //   category: 'General',
    //   categoryId: 'MDE4OkRpc2N1c3Npb25DYXRlZ29yeTMyNTg5MjUw',
    //   mapping: 'pathname',
    //   reactionsEnabled: '0',
    //   emitMetadata: '0',
    //   inputPosition: 'top',
    //   lang: 'zh-CN',
    // },
    vender: 'waline',
    options: {
      serverURL: 'https://waline-vercel.wider.ink/',
      meta: ['nick', 'mail', 'link'],
      requiredMeta: ['nick', 'mail'],
      wordLimit: 200,
      commentSorting: 'latest',
      login: 'disable',
      search: false,
      copyright: false,
      reaction: false,
      emoji: [
        '//unpkg.com/@waline/emojis@1.1.0/weibo',
        '//unpkg.com/@waline/emojis@1.1.0/bilibili',
        // '//cdn.jsdelivr.net/gh/GamerNoTitle/ValineCDN@master/Coolapk/',
      ],
    }
  },
  footer: {
    links: [
      { label: '更新日志', url: urlJoin(import.meta.env.BASE_URL, 'changelog')},
      { label: '引用声明', url: urlJoin(import.meta.env.BASE_URL, 'reference')},
      { label: '关于', url: urlJoin(import.meta.env.BASE_URL, 'about')},
      { label: '归档', url: urlJoin(import.meta.env.BASE_URL, 'archive')},
      { label: '友情链接', url: urlJoin(import.meta.env.BASE_URL, 'friends')},
      { label: 'Github', url: 'https://github.com/izmttk', external: true},
    ],
    declarations: [
      `Copyright © ${getYear(new Date())} 银河渡舟 All Rights Reserved.`
    ],
    generator: true,
    rss: true,
    sitemap: true,
  },
  algolia: {
    appId: "1IIXBX6FGH",
    apiKey: "91aa4234096f4963e33d53262340b1ec",
    indexName: "wider",
  }
}

export default config;