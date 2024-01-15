// @ts-nocheck
// this is a typescript bug currently:
// error TS2589: Type instantiation is excessively deep and possibly infinite.

// from https://github.com/facebook/docusaurus/blob/6b618bc9e5fcc9d52d3aa49a9d447f4d7ea76d41/packages/docusaurus-mdx-loader/src/remark/mermaid/index.ts
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { visit } from 'unist-util-visit';
import type { Code } from 'mdast';
import type { Node } from 'unist';
import type { RemarkPlugin } from '@astrojs/markdown-remark';

export interface MermaidCodeBlock extends Node {
  type: 'mermaidCodeBlock',
};

// Add nodes to tree.
declare module 'mdast' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface BlockContentMap {
    mermaidCodeBlock: MermaidCodeBlock
  }
}

const remarkMermaid: RemarkPlugin = () => {

  return (root) => {
    visit(root, 'code', (node: Code, index, parent) => {
      if (node.lang === 'mermaid' && parent !== null && index !== null) {
        parent.children.splice(index, 1, {
          type: 'mermaidCodeBlock',
          data: {
            hName: 'mermaid',
            hProperties: {
              value: node.value,
            },
          },
        });
      }
    });
  };
}

export default remarkMermaid;
