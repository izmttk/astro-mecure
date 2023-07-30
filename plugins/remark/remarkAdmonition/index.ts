import type { RemarkPlugin } from '@astrojs/markdown-remark';

import { syntax } from './syntax';
import { fromMarkdown } from './fromMarkdown';

const remarkAdmonition: RemarkPlugin<[]> = function() {
  const data = this.data();

  function add(key: string, value: unknown) {
    if (Array.isArray(data[key])) {
      (data[key] as unknown[]).push(value);
    } else {
      data[key] = [value];
    }
  }

  add('micromarkExtensions', syntax());
  add('fromMarkdownExtensions', fromMarkdown());

}

export default remarkAdmonition;