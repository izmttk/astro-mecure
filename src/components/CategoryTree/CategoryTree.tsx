import TreeView from '../TreeView';
import IconCategory from '~icons/tabler/category';

interface TerminalTreeNode {
  label: string;
  url: string;
  count: number;
}

interface InternalTreeNode {
  label: string;
  url?: string;
  count: number;
  children: TreeNode[];
}

type TreeNode = InternalTreeNode | TerminalTreeNode;

function addTreeNode(node: TreeNode, path: string[], count: number, url: string) {
  if (path.length) {
    const label = path[0];
    if ('children' in node) { // is internal node
      const child = node.children.find(child => child.label === label);
      if (child) {
        child.count += count;
        if (path.length === 1) {
          child.url = url;
        } else {
          addTreeNode(child, path.slice(1), count, url);
        }
      } else {
        if (path.length === 1) {
          const newNode = { // create terminal node
            label,
            count,
            url,
          };
          node.children.push(newNode);
        } else {
          const newNode = { // create internal node
            label,
            count,
            children: []
          };
          node.children.push(newNode);
          addTreeNode(newNode, path.slice(1), count, url);
        }
      }
    }
  }
}

function parseCategoriesToTree(categories: {
  label: string;
  count: number,
  url: string;
}[]) {
  const tree = {
    label: 'root',
    count: 0,
    children: []
  } as InternalTreeNode;
  categories.forEach(category => {
    const path = category.label.split('/');
    addTreeNode(tree, path, category.count, category.url);
  });
  return tree;
}


// function IconFolder() {
//   return (
//     <svg width="15px" height="15px" viewBox="0 0 24 24">
//       <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
//         <g transform="translate(-528.000000, -48.000000)" fill-rule="nonzero">
//           <g transform="translate(528.000000, 48.000000)">
//             <path d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z" fill-rule="nonzero"></path>
//             <path d="M2,5 C2,3.89543 2.89543,3 4,3 L9.51938,3 C10.1269,3 10.7016,3.27618 11.0811,3.75061 L12.4806,5.5 L20,5.5 C21.1046,5.5 22,6.39543 22,7.5 L22,19 C22,20.1046 21.1046,21 20,21 L4,21 C2.89543,21 2,20.1046 2,19 L2,5 Z" fill="currentColor"></path>
//           </g>
//         </g>
//       </g>
//     </svg>
//   );
// }


// function IconClassifyFill() {
//   return (
//     <svg width="15px" height="15px" viewBox="0 0 24 24">
//       <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
//         <g transform="translate(-384.000000, -432.000000)">
//           <g transform="translate(384.000000, 432.000000)">
//             <path d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5935,23.2578 L12.5819,23.2595 L12.5109,23.295 L12.4919,23.2987 L12.4767,23.295 L12.4057,23.2595 C12.3958,23.2564 12.387,23.259 12.3821,23.2649 L12.378,23.2758 L12.3609,23.7031 L12.3659,23.7235 L12.3769,23.7357 L12.4805,23.8097 L12.4953,23.8136 L12.5071,23.8097 L12.6107,23.7357 L12.6233,23.7197 L12.6267,23.7031 L12.6096,23.2758 C12.6076,23.2657 12.601,23.2593 12.5935,23.2578 Z M12.8584,23.1453 L12.8445,23.1473 L12.6598,23.2397 L12.6499,23.2499 L12.6472,23.2611 L12.6651,23.6906 L12.6699,23.7034 L12.6784,23.7105 L12.8793,23.8032 C12.8914,23.8069 12.9022,23.803 12.9078,23.7952 L12.9118,23.7812 L12.8777,23.1665 C12.8753,23.1546 12.8674,23.147 12.8584,23.1453 Z M12.143,23.1473 C12.1332,23.1424 12.1222,23.1453 12.1156,23.1526 L12.1099,23.1665 L12.0758,23.7812 C12.0751,23.7927 12.0828,23.8019 12.0926,23.8046 L12.1083,23.8032 L12.3092,23.7105 L12.3186,23.7024 L12.3225,23.6906 L12.3404,23.2611 L12.3372,23.2485 L12.3278,23.2397 L12.143,23.1473 Z" fill-rule="nonzero"></path>
//             <path d="M15.5858,2.75742 C16.3668,1.97637 17.6332,1.97637 18.4142,2.75742 L21.2426,5.58584 C22.0237,6.36689 22.0237,7.63322 21.2426,8.41427 L18.4142,11.2427 C17.6332,12.0237 16.3668,12.0237 15.5858,11.2427 L12.7574,8.41427 C11.9763,7.63322 11.9763,6.36689 12.7574,5.58584 L15.5858,2.75742 Z M9,3.00009 C10.1046,3.00009 11,3.89552 11,5.00009 L11,9.00009 C11,10.1047 10.1046,11.00009 9,11.00009 L5,11.00009 C3.89543,11.00009 3,10.1047 3,9.00009 L3,5.00009 C3,3.89552 3.89543,3.00009 5,3.00009 L9,3.00009 Z M21,15.0001 C21,13.8955 20.1046,13.0001 19,13.0001 L15,13.0001 C13.8954,13.0001 13,13.8955 13,15.0001 L13,19.0001 C13,20.1047 13.8954,21.0001 15,21.0001 L19,21.0001 C20.1046,21.0001 21,20.1047 21,19.0001 L21,15.0001 Z M9,13.0001 C10.1046,13.0001 11,13.8955 11,15.0001 L11,19.0001 C11,20.1047 10.1046,21.0001 9,21.0001 L5,21.0001 C3.89543,21.0001 3,20.1047 3,19.0001 L3,15.0001 C3,13.8955 3.89543,13.0001 5,13.0001 L9,13.0001 Z" fill="currentColor"></path>
//           </g>
//         </g>
//       </g>
//     </svg>
//   );
// }

import IconFolderFill from '~icons/mingcute/folder-fill'
import IconGridFill from '~icons/mingcute/grid-fill'
import IconArrowRight from '~icons/mingcute/arrow-right-fill'


function renderSubtree(tree: InternalTreeNode, expandDepth: number, depth: number) {
  return (
    <TreeView.Item
      label={
        tree.url ? (
          <a href={tree.url} className='hover:font-bold group' onClick={e => e.stopPropagation()}>
            {tree.label}
            <IconArrowRight className='inline transition opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0' width={12} height={12} />
          </a>
        ) : tree.label
      }
      icon={<IconFolderFill width={15} height={15} />}
      endIcon={<div className='text-xs px-1'>{tree.count}篇</div>}
      defaultExpanded={depth <= expandDepth}
      key={tree.label}
    >
      {tree.children.map(child => {
        if ('children' in child) {
          return renderSubtree(child, expandDepth, depth + 1);
        } else {
          return (
            <TreeView.Item
              label={
                <a href={child.url} className='hover:font-bold group'>
                  {child.label}
                  <IconArrowRight className='inline transition opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0' width={12} height={12} />
                </a>
              }
              icon={<IconGridFill width={15} height={15} />}
              endIcon={<div className='text-xs px-1'>{child.count}篇</div>}
              key={child.label}
            />
          )
        }
      })}
    </TreeView.Item>
  )
}

export interface CategoryTreeProps {
  categories: {
    label: string;
    url: string;
    count: number;
  }[];
  expandDepth?: number;
}

export default function CategoryTree({
  categories,
  expandDepth = 2,
}: CategoryTreeProps) {
  const tree = parseCategoriesToTree(categories);
  return (
    <div>
      <h2 className='font-bold text-lg flex items-center p-2'><IconCategory className='w-5 h-5 mr-1' />分类树</h2>
      <TreeView className='plate-bg border-highlight p-2 rounded-xl overflow-hidden'>
        {
          tree.children.map(child => {
            if ('children' in child) {
              return renderSubtree(child, expandDepth, 1);
            } else {
              return (
                <TreeView.Item
                  label={
                    <a href={child.url} className='hover:font-bold group'>
                      {child.label}
                      <IconArrowRight className='inline transition opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0' width={12} height={12} />
                    </a>
                  }
                  icon={<IconGridFill width={15} height={15} />}
                  endIcon={<div className='text-xs px-1'>{child.count}篇</div>}
                  key={child.label}
                />
              )
            }
          })
        }
      </TreeView>
    </div>
    
  )
}
