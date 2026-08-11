import type { RemarkPlugin } from '@astrojs/markdown-remark';

import { syntax } from './micromark-extension-spoiler';
import { fromMarkdown } from './mdast-util-spoiler';
import { visit } from 'unist-util-visit';

const remarkSpoiler: RemarkPlugin<[]> = function(this: any) {
  const data = this.data(); 

  function add(key: string, value: any) {
    if (Array.isArray(data[key])) {
      data[key].push(value);
    } else {
      data[key] = [value];
    }
  }

  add('micromarkExtensions', syntax());
  add('fromMarkdownExtensions', fromMarkdown());

  // return (root) => {
  //   visit(root, (node, index, parent) => {
  //     console.log(node);
  //   });
  // };
}

export default remarkSpoiler;