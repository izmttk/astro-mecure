import type { RehypePlugin } from '@astrojs/markdown-remark';

import { excerpt } from 'hast-util-excerpt';
import { truncate } from 'hast-util-truncate';
import { toText as hastToText } from 'hast-util-to-text';
import { collapseWhiteSpace } from 'collapse-white-space'

const rehypeExcerpt: RehypePlugin = (
  options?: void | {
    limit?: number;
  }
) => {
  const excerptLimit = options?.limit ?? 200;
  return (tree, file) => {
    const astroData = file.data.astro ??= {};
    const frontmatter = astroData.frontmatter ??= {};
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
