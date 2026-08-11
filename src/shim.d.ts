// // typescript compatibility for vite-plugin-svgr with exportAsDefault:true
// declare module '*.svg' {
//   import * as React from 'react'

//   const Component: React.FunctionComponent<
//     React.ComponentProps<'svg'> & { title?: string }
//   >;
//   export default Component;
// }

// support importing .astro in .ts file
declare module '*.astro' {
  import { AstroComponentFactory } from 'astro/runtime/server/index.js';
  export default AstroComponentFactory;
}

// CSS-only packages do not publish TypeScript declarations.
declare module '@docsearch/css';
declare module '@fontsource-variable/fira-code';
declare module '@fontsource-variable/inter';
