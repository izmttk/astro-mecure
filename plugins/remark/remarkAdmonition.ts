// @ts-nocheck
// this is a typescript bug currently:
// error TS2589: Type instantiation is excessively deep and possibly infinite.
import { visit } from 'unist-util-visit';
import { h } from 'hastscript';
import type { RemarkPlugin } from '@astrojs/markdown-remark';
import type { Properties } from 'hastscript';
import type { Parent } from 'mdast';

export interface Admonition extends Parent {
  type: 'admonition',
};

// Add nodes to tree.
declare module 'mdast' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface BlockContentMap {
    admonition: Admonition
  }
}


const admonitionNames = ['note', 'info', 'tip', 'caution', 'danger'];

const admonitionsPlugin : RemarkPlugin = () => {
  return (tree) => {
    visit(tree, (node, index, parent) => {
      if (node.type === 'containerDirective' && admonitionNames.includes(node.name)) {
        if (index !== null && parent !== null) {
          const title = node.attributes?.title;
          parent.children.splice(index, 1, {
            type: 'admonition',
            data: {
              hName: 'admonition',
              hProperties: {
                type: node.name,
                title: title,
              },
            },
            children: node.children,
          });
        }
      } else if (
        node.type === 'textDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'containerDirective'
      ) {
        const data = node.data || (node.data = {})
        const hast = h(node.name, node.attributes as Properties)
        data.hName = hast.tagName
        data.hProperties = hast.properties
      }
    })
  }
}

export default admonitionsPlugin