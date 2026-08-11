import type { RehypePlugin } from '@astrojs/markdown-remark';
import { readingTime } from 'hast-util-reading-time';

const rehypeReadingTime: RehypePlugin = () => {
  return (tree, file) => {
    const astroData = file.data.astro ??= {};
    const frontmatter = astroData.frontmatter ??= {};
    frontmatter.readingTime = readingTime(tree);
  }
}

export default rehypeReadingTime;
