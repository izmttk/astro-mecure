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

export const fromMarkdown = (): FromMarkdownExtension => {
  const enterSpoiler: Handle = function(token) {
    this.enter<Spoiler>({
      type: 'spoiler',
      children: [],
    }, token);
  }
  const exitSpoiler: Handle = function(token) {
    const node = this.exit(token) as Spoiler;
    node.data = {
      ...node.data,
      hName: 'span',
      hProperties: {
        className: 'bg-current hover:bg-transparent transition-colors duration-200 rounded px-0.5 mx-0.5',
      },
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