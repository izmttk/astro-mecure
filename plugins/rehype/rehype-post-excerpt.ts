import type { RehypePlugin, MarkdownAstroData } from '@astrojs/markdown-remark';

import { excerpt } from 'hast-util-excerpt';
import { truncate } from 'hast-util-truncate';
import { toText as hastToText } from 'hast-util-to-text';
import { collapseWhiteSpace } from 'collapse-white-space'
import { visit } from 'unist-util-visit';

const rehypeExcerpt: RehypePlugin = (
  options?: void | {
    limit?: number;
  }
) => {
  const excerptLimit = options?.limit ?? 200;
  return (tree, file) => {
    const { frontmatter } = file.data.astro as MarkdownAstroData;
    const fragment = excerpt(tree, {
      comment: 'more'
    }) ?? truncate(tree, {
      size: excerptLimit,
      ellipsis: '…',
    });
    frontmatter.excerpt = collapseWhiteSpace(hastToText(fragment));
  }
}

export default rehypeExcerpt;
