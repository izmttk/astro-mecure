import type { Parent } from 'mdast';

import type {
  Handle,
  Extension as FromMarkdownExtension
} from 'mdast-util-from-markdown';


export interface Spoiler extends Parent {
  type: 'spoiler',
};
declare module 'mdast' {
  interface StaticPhrasingContentMap {
    spoiler: Spoiler;
  }
}

let currentNodes: Spoiler[] = [];

export const fromMarkdown = (): FromMarkdownExtension => {
  const enterSpoiler: Handle = function(token) {
    const node: Spoiler = {
      type: 'spoiler',
      children: [],
    };
    this.enter(node, token);
    currentNodes.push(node);
  }
  const exitSpoiler: Handle = function(token) {
    this.exit(token);
    const node = currentNodes.pop();
    if (node) {
      node.data = {
        ...node.data,
        hName: 'span',
        hProperties: {
          className: 'bg-current hover:bg-transparent transition-colors duration-200 rounded px-0.5 mx-0.5',
        },
      }
    }
  }
  return {
    enter: {
      spoiler: enterSpoiler,
    },
    exit: {
      spoiler: exitSpoiler,
    }
  }
}