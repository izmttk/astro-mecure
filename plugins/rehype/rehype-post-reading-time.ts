import type { RehypePlugin, MarkdownAstroData } from '@astrojs/markdown-remark';
import { readingTime } from 'hast-util-reading-time';

const rehypeReadingTime: RehypePlugin = () => {
  return (tree, file) => {
    const { frontmatter } = file.data.astro as MarkdownAstroData;
    frontmatter.readingTime = readingTime(tree);
  }
}

export default rehypeReadingTime;
