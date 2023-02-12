import type { AstroUserConfig } from "astro";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import image from "@astrojs/image";
import sitemap from "@astrojs/sitemap";
import compress from "astro-compress";


import svgr from 'vite-plugin-svgr';
import icons from 'unplugin-icons/vite';
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "astro/config";
import node from "@astrojs/node";

import remarkToc from 'remark-toc';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import remarkGemoji from 'remark-gemoji';
import remarkPostWordCount from "./remark/remarkPostWordCount";
import remarkAdmonition from "./remark/remarkAdmonition";
import remarkMermaid from "./remark/remarkMermaid";
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypePostExcerpt from "./rehype/rehypePostExcerpt";
import rehypePostReadingTime from "./rehype/rehypePostReadingTime";
import rehypePostRaw from "./rehype/rehypePostRaw";
import rehypeHeadingLinks from "./rehype/rehypeHeadingLinks";
import { rehypeHeadingIds } from '@astrojs/markdown-remark';

import { remarkCodeHike } from "@code-hike/mdx";
import theme from "shiki/themes/github-dark.json";
// https://astro.build/config
const config: AstroUserConfig = {
  site: 'https://wider.netlify.app/',
  // base: 'blog',
  // output: 'server',
  // adapter: node({
  //   mode: 'standalone'
  // }),
  integrations: [
    react(),
    tailwind(),
    mdx(),
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
      remarkMermaid,
    ],
    rehypePlugins: [
      [rehypeRaw, {
        passThrough: ['comment']
      }],
      rehypePostRaw,
      rehypePostExcerpt,
      rehypePostReadingTime,
      rehypeKatex,
      rehypeHeadingIds,
      rehypeHeadingLinks
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
    // resolve: {
    //   alias: {
    //     '@': '/src'
    //   }
    // },
    ssr: {
      noExternal: ['date-fns', 'react-use', '@radix-ui/*', 'domelementtype']
    },
    build: {
      rollupOptions: {
        output: {
          // entryFileNames: 'assets/index.[hash].js',
          // chunkFileNames: 'assets/chunk.[hash].js',
          // assetFileNames: 'assets/[hash][extname]'
        }
      }
    }
  }
};

// https://astro.build/config

// https://astro.build/config
export default defineConfig(config);