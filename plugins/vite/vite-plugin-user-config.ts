import type { Config, ProfileWidgetConfig, WidgetConfig } from "@/types"
import type { AstroConfig, ViteUserConfig } from 'astro';
import type { Plugin } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function isRemotePath(src: string) {
  return /^(http|ftp|https|ws):?\/\//.test(src) || src.startsWith('data:');
}

function resolveVirtualModuleId<T extends string>(id: T): `\0${T}` {
  return `\0${id}`;
}

export default function vitePluginUserConfig(
  options: Config,
): Plugin {
  const resolveId = (id: string) => JSON.stringify(id.startsWith('.') ? resolve(id) : id);
  const imageProperties = {
    'favicon': options.favicon,
    'heroLogo': options.hero && options.hero.logo,
    'heroBg': options.hero && options.hero.background,
    'profileAvatar': options.sidebar && options.sidebar.widgets?.find((w): w is ProfileWidgetConfig => w.name === 'profile')?.avatar,
    'profileBg': options.sidebar && options.sidebar.widgets?.find((w): w is ProfileWidgetConfig => w.name === 'profile')?.background,
  }
  const virtualModules = {
    'virtual:user-config': `export default ${JSON.stringify(options)}`,
    'virtual:user-images': `
      ${Object.entries(imageProperties).map(([k, v]) => {
        if (!v) return `export const ${k} = undefined\n`;
        if (isRemotePath(v) || v.startsWith('/')) return `export const ${k} = "${v}"\n`;
        return `import ${k} from ${resolveId(v)}\n` + `export { ${k} }\n`;
      }).join('')}
    `,
  }

  /** Mapping names prefixed with `\0` to their original form. */
  const resolutionMap = Object.fromEntries(
    (Object.keys(virtualModules) as (keyof typeof virtualModules)[]).map((key) => [
      resolveVirtualModuleId(key),
      key,
    ])
  );

  return {
    name: 'vite-plugin-user-config',
    resolveId(id): string | void {
      if (id in virtualModules) return resolveVirtualModuleId(id);
    },
    load(id) {
      const resolution = resolutionMap[id];
      if (resolution) return virtualModules[resolution];
    },
  }
}