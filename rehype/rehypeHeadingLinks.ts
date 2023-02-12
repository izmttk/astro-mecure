import { visit } from 'unist-util-visit';
import type { Element } from 'hast';
import type { RehypePlugin } from "@astrojs/markdown-remark";
import { h, s } from 'hastscript';

const element = h('div', { class: 'w-6 h-6 text-slate-400 ring-1 ring-slate-900/5 rounded-md shadow-sm flex items-center justify-center hover:ring-slate-900/10 hover:shadow hover:text-slate-700 bg-white dark:bg-slate-700 dark:text-slate-300 dark:shadow-none dark:ring-0' }, [
  s('svg', { width: '12', height: '12', fill: 'none' }, [
    s('path', { d: 'M3.75 1v10M8.25 1v10M1 3.75h10M1 8.25h10', stroke: 'currentColor', strokeWidth: '1.5', strokeLinecap: 'round' })
  ])
])

const headingTags = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ];
const plugin: RehypePlugin = () => {

  return (root) => {
    visit(root, 'element', (node: Element) => {
      if (headingTags.includes(node.tagName)) {
        const id = node.properties?.id;
        if (!id) return;
        node.properties = node.properties ?? {};
        if (node.properties.class) {
          node.properties.class = `${node.properties.class} group -ml-5 pl-5 relative`;
        } else {
          node.properties.class = 'group -ml-1 pl-1 md:-ml-5 md:pl-5 relative';
        }
        node.children.unshift(h('a', {
          href: `#${id}`,
          class: 'not-prose absolute -left-6 top-1/2 -translate-y-1/2 flex items-center opacity-0 border-0 group-hover:opacity-100',
          ariaLabel: 'hidden',
        }, [element]));
      }
    })
  };
}

export default plugin;
