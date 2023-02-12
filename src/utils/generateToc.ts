// from https://github.com/withastro/docs/blob/c3d056b868b83ec7be67d87b5877648c9a7e2231/src/util/generateToc.ts

import type { MarkdownHeading } from 'astro'

function diveChildren(item: TocItem, depth: number): TocItem[] {
  if (depth === 1) {
    return item.children;
  } else {
    // e.g., 2
    return diveChildren(item.children[item.children.length - 1], depth - 1);
  }
}

interface TocItem extends MarkdownHeading {
  children: TocItem[];
}

type GenerateTocOptions = {
  minDepth: 1 | 2 | 3 | 4 | 5 | 6,
  maxDepth: 1 | 2 | 3 | 4 | 5 | 6,
}

export default function generateToc(headings: MarkdownHeading[], options: GenerateTocOptions = {
  minDepth: 2,
  maxDepth: 4,
}) {
  const { minDepth, maxDepth } = options;
  headings = headings.filter(({ depth }) => depth >= minDepth && depth <= maxDepth);
  const toc: TocItem[] = [];

  for (const heading of headings) {
    if (toc.length === 0) {
      toc.push({
        ...heading,
        children: [],
      });
    } else {
      const lastItemInToc = toc[toc.length - 1];
      if (heading.depth < lastItemInToc.depth) {
        console.warn(`Orphan heading found: ${heading.text}.`);
        continue;
      } 
      if (heading.depth === lastItemInToc.depth) {
        // same depth
        toc.push({
          ...heading,
          children: [],
        });
      } else {
        // higher depth
        // push into children, or children' children alike
        const gap = heading.depth - lastItemInToc.depth;
        const target = diveChildren(lastItemInToc, gap);
        target.push({
          ...heading,
          children: [],
        });
      }
    }
  }
  return toc;
}
