import type { RehypePlugin } from '@astrojs/markdown-remark';

import { visit } from 'unist-util-visit';
import type { Element } from 'hast';

const rehypeAutoCaption: RehypePlugin = () => {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'img' && parent !== undefined && index !== undefined) {
        const title = node.properties?.title?.toString() ?? node.properties?.alt?.toString();
        if (title) {
          // define figure element
          const figure = {
            type: 'element',
            tagName: 'figure',
            properties: {},
            children: [
              node,
              {
                type: 'element',
                tagName: 'figcaption',
                properties: {},
                children: [
                  {
                    type: 'text',
                    value: title,
                  },
                ],
              },
            ],
          } satisfies Element;
          parent.children.splice(index, 1, figure);
        }
      }
    });
  }
}

export default rehypeAutoCaption;
