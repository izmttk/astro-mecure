import useToc from '@/hooks/useToc';
import { twMerge } from 'tailwind-merge';
import type { MarkdownHeading } from 'astro';
import { animated, useSpring } from '@react-spring/web';
import useElementSize from '@/hooks/useElementSize';
import { useAtom, useSetAtom } from 'jotai';
import IconList from '~icons/tabler/list';

interface TocItem extends MarkdownHeading {
  children: TocItem[];
}

export interface TocProps {
  toc: TocItem[];
}

function flapToc(toc: TocItem[]) {
  const headings: MarkdownHeading[] = [];
  for (const tocItem of toc) {
    const { children, ...rest } = tocItem;
    headings.push(rest);
    headings.push(...flapToc(children));
  }
  return headings;
}

function findAncestors(toc: TocItem[], heading: string): MarkdownHeading[] {
  for (const tocItem of toc) {
    const { children, ...rest } = tocItem;
    if (rest.slug === heading) {
      return [rest];
    }
    const itemAncestors = findAncestors(children, heading);
    if (itemAncestors.length !== 0) {
      return [rest, ...itemAncestors];
    }
  }
  return [];
}


interface TableOfContentsItemProps {
  item: TocItem, 
  actived: string[]
}
const TableOfContentsItem = ({
  item,
  actived = []
}: TableOfContentsItemProps) => {
  const { depth, slug, text, children } = item;
  const isActive = actived.includes(slug);

  const [ref, size] = useElementSize<HTMLUListElement>();
  const [spring] = useSpring(() => ({
     to: {
      height: isActive ? `${size.height}px` : '0',
      translateY: isActive ? '0' : '-1rem',
      opacity: isActive ? 1 : 0
    },
    config: {
      tension: 300,
      friction: 30,
    }
  }), [isActive, size.height]);

  const handleClick = (e: React.MouseEvent) => {
    // e.preventDefault();
    // const target = document.querySelector(`#${CSS.escape(slug)}`);
    // if (target) {
    //   history.pushState(null, '', `#${slug}`);
    //   window.scrollTo({
    //     top: window.scrollY + target.getBoundingClientRect().y - navbarSize.height,
    //     behavior: 'smooth'
    //   });
    // }
  }
  return (
    <li key={slug}>
      <a className={twMerge(
        'px-3 py-1 relative block transition-colors duration-75 hover:bg-gray-600/10 dark:hover:bg-gray-400/10 rounded-md',
        isActive && 'before:absolute before:left-1 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:bg-primary-500 before:rounded-full',
        isActive && 'text-primary-600 dark:text-primary-400',
      )} href={`#${slug}`} onClick={handleClick}>{text}</a>
      {children.length > 0 && (
        <animated.div className='pl-4 overflow-hidden' style={spring}>
          <ul ref={ref}>
            {children.map((item) => (
              <TableOfContentsItem key={item.slug} item={item} actived={actived} />
            ))}
          </ul>
        </animated.div>
      )}
    </li>
  );
};

export default function Toc({
  toc
}: TocProps) {
  const headings = flapToc(toc);
  const {active, visible} = useToc(headings.map(heading => heading.slug));
  const activeAncestors = active ? findAncestors(toc, active).map(heading => heading.slug) : [];
  return (
    <nav className='text-sm plate-bg border-highlight p-3 rounded-xl'>
      <h2 className='font-bold text-lg flex items-center mb-1'><IconList className='w-5 h-5 mr-1' />目录</h2>
      <ul className="toc-root">
        {toc.map(item => <TableOfContentsItem key={item.slug} item={item} actived={activeAncestors} />)}
      </ul>
    </nav>
  )
}
