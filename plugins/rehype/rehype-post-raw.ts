import type { RehypePlugin, MarkdownAstroData } from '@astrojs/markdown-remark';
import { rehype } from 'rehype';
import rehypeSanitize from 'rehype-sanitize'
import rehypePresetMinify from 'rehype-preset-minify';

const rehypeRaw: RehypePlugin = () => {
  return (tree, file) => {
    const { frontmatter } = file.data.astro as MarkdownAstroData;
    const processor = rehype().use(rehypeSanitize).use(rehypePresetMinify);
    frontmatter.raw = processor.stringify(processor.runSync(tree));
  }
}

export default rehypeRaw;
