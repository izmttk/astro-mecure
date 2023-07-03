import { visit } from 'unist-util-visit';
import type { RehypePlugin } from '@astrojs/markdown-remark';

const rehypeTest : RehypePlugin = () => {
  return (tree) => {
    visit(tree, (node) => {
      // if (node.type in components) {
        console.log(node)
      // }
    })
  }
}

export default rehypeTest