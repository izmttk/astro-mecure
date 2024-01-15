import type { RemarkPlugin } from '@astrojs/markdown-remark';

import { syntax } from './micromark-extension-admonition';
import { fromMarkdown } from './mdast-util-admonition';

const remarkAdmonition: RemarkPlugin<[]> = function(this: any) {
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
}

export default remarkAdmonition;