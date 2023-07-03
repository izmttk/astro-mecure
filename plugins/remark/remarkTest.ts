import { visit } from 'unist-util-visit';
import type { RemarkPlugin } from '@astrojs/markdown-remark';

const remarkTest : RemarkPlugin = () => {
  return (tree) => {
    visit(tree, (node) => {
      // if (node.type in components) {
        console.log(node)
      // }
    })
  }
}

export default remarkTest