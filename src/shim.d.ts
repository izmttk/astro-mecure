// typescript compatibility for vite-plugin-svgr with exportAsDefault:true
declare module '*.svg' {
  import * as React from 'react'

  const Component: React.FunctionComponent<
    React.ComponentProps<'svg'> & { title?: string }
  >;
  export default Component;
}


// // support importing .astro in .ts file
// declare module '*.astro' {
//   import { AstroComponentFactory } from 'astro'
//   export default AstroComponentFactory;
// }

declare module 'virtual:user-config' {
	const config: import('./types').Config;
  export default config
}

declare module 'virtual:user-images' {
	type ImageMetadata = import('astro').ImageMetadata;
  const [ favicon, heroLogo, heroBg, profileAvatar, profileBg ]: (ImageMetadata | string | undefined)[];
  export { favicon, heroLogo, heroBg, profileAvatar, profileBg }
}

declare module 'astro:assets' {
  export const assetsDir: URL;
}