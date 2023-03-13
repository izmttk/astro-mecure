import type { AstroUserConfig } from 'astro';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import image from '@astrojs/image';
import sitemap from '@astrojs/sitemap';
import compress from 'astro-compress';


import svgr from 'vite-plugin-svgr';
import icons from 'unplugin-icons/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

import remarkToc from 'remark-toc';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import remarkGemoji from 'remark-gemoji';
import remarkPostWordCount from './plugins/remark/remarkPostWordCount';
import remarkAdmonition from './plugins/remark/remarkAdmonition';
import remarkMermaid from './plugins/remark/remarkMermaid';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypePostExcerpt from './plugins/rehype/rehypePostExcerpt';
import rehypePostReadingTime from './plugins/rehype/rehypePostReadingTime';
import rehypePostRaw from './plugins/rehype/rehypePostRaw';

import { remarkCodeHike } from '@code-hike/mdx';
import theme from 'shiki/themes/github-dark-dimmed.json';
// https://astro.build/config
const config: AstroUserConfig = {
  site: 'https://suborbit.me/',
  // base: 'blog',
  // output: 'server',
  // adapter: node({
  //   mode: 'standalone'
  // }),
  integrations: [
    react(),
    tailwind(),
    mdx({
      // syntaxHighlight: false,
      remarkPlugins: [
        remarkPostWordCount,
        [remarkToc, {
          tight: true,
          ordered: true,
        }],
        remarkMath,
        remarkGemoji,
        remarkDirective,
        remarkAdmonition,
        remarkMermaid,
        // [remarkCodeHike, {
        //   lineNumbers: true,
        //   showCopyButton: true,
        //   theme: theme,
        //   skipLanguages: ['mermaid'],
        //   // staticMediaQuery: 'not screen, (max-width: 768px)',
        //   autoImport: false,
        // }],
      ]
    }),
    image(),
    compress({
      // avoid react hydration error
      // html: {
      //   collapseWhitespace: false,
      //   removeComments: false,
      // },
      html: false
    }),
    sitemap(),
  ],

  markdown: {
    shikiConfig: {
      theme: 'github-dark'
    },
    remarkPlugins: [
      remarkPostWordCount,
      [remarkToc, {
        tight: true,
        ordered: true,
      }],
      remarkMath,
      remarkGemoji,
      remarkDirective,
      remarkAdmonition,
    ],
    rehypePlugins: [
      [rehypeRaw, {
        passThrough: ['comment']
      }],
      rehypePostRaw,
      rehypePostExcerpt,
      rehypePostReadingTime,
      rehypeKatex,
    ],
  },
  build: {
    assets: 'assets'
  },
  vite: {
    plugins: [
      svgr({
        exportAsDefault: true
      }),
      icons({
        compiler: 'jsx',
        jsx: 'react',
        autoInstall: true
      }),
      visualizer({
        template: 'treemap'
      }),
    ],
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    ssr: {
      noExternal: ['date-fns', 'react-use', '@radix-ui/*', 'domelementtype']
    },
    build: {
      // rollupOptions: {
      //   output: {
      //     entryFileNames: 'assets/index.[hash].js',
      //     chunkFileNames: 'assets/chunk.[hash].js',
      //     assetFileNames: 'assets/[hash][extname]'
      //   }
      // }
    }
  }
};

// https://astro.build/config
export default defineConfig(config);