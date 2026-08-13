import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';
import type { MarkdownHeading } from 'astro';
import { useAtomValue } from 'jotai';
import { twMerge } from 'tailwind-merge';

import useElementSize from '@/hooks/useElementSize';
import useToc from '@/hooks/useToc';
import { navbarSize as navbarSizeAtom } from '@/store/atoms';

import IconChevronRight from '~icons/tabler/chevron-right';
import IconChevronsDown from '~icons/tabler/chevrons-down';
import IconChevronsUp from '~icons/tabler/chevrons-up';
import IconFoldDown from '~icons/tabler/fold-down';
import IconFoldUp from '~icons/tabler/fold-up';
import IconListTree from '~icons/tabler/list-tree';

interface TocItem extends MarkdownHeading {
  children: TocItem[];
}

interface FlatTocItem extends MarkdownHeading {
  parentSlugs: string[];
}

export interface TocProps {
  toc: TocItem[];
}

function flattenToc(toc: TocItem[], parentSlugs: string[] = []): FlatTocItem[] {
  return toc.flatMap(item => [
    {
      depth: item.depth,
      slug: item.slug,
      text: item.text,
      parentSlugs,
    },
    ...flattenToc(item.children, [...parentSlugs, item.slug]),
  ]);
}

function findPath(toc: TocItem[], slug: string): string[] {
  for (const item of toc) {
    if (item.slug === slug) {
      return [item.slug];
    }
    const childPath = findPath(item.children, slug);
    if (childPath.length > 0) {
      return [item.slug, ...childPath];
    }
  }
  return [];
}

function findBranchSlugs(toc: TocItem[]): string[] {
  return toc.flatMap(item => [
    ...(item.children.length > 0 ? [item.slug] : []),
    ...findBranchSlugs(item.children),
  ]);
}

interface TocTreeItemProps {
  item: TocItem;
  active: string | null;
  activePath: string[];
  expanded: Set<string>;
  onToggle: (slug: string) => void;
  registerActiveRow: (element: HTMLDivElement | null) => void;
  onNavigate: (event: React.MouseEvent<HTMLAnchorElement>, slug: string) => void;
}

interface TocItemLabelProps {
  text: string;
  interacting: boolean;
}

const IDLE_LABEL_MASK = 'linear-gradient(90deg, black 0, black calc(100% - 24px), transparent 100%)';
const MOVING_LABEL_MASK = 'linear-gradient(90deg, transparent 0, black 16px, black calc(100% - 16px), transparent 100%)';

function TocItemLabel({ text, interacting }: TocItemLabelProps) {
  const [viewportRef, viewportSize] = useElementSize<HTMLSpanElement>();
  const [contentRef, contentSize] = useElementSize<HTMLSpanElement>();
  const [reduceMotion, setReduceMotion] = useState(false);
  const overflow = Math.max(0, Math.ceil(contentSize.width - viewportSize.width));
  const isOverflowing = overflow > 1;
  const isScrolling = interacting && isOverflowing && !reduceMotion;
  const scrollDuration = Math.max(1000, overflow * 28);
  const returnDuration = Math.min(560, Math.max(280, overflow * 6));

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReduceMotion(media.matches);

    updatePreference();
    media.addEventListener('change', updatePreference);
    return () => media.removeEventListener('change', updatePreference);
  }, []);

  const maskImage = !isOverflowing
    ? 'none'
    : isScrolling
      ? MOVING_LABEL_MASK
      : IDLE_LABEL_MASK;

  return (
    <span
      ref={viewportRef}
      className="block min-w-0 overflow-hidden whitespace-nowrap"
      style={{ maskImage, WebkitMaskImage: maskImage }}
    >
      <span
        ref={contentRef}
        className="inline-block whitespace-nowrap will-change-transform"
        style={{
          transform: isScrolling
            ? `translate3d(${-overflow}px, 0, 0)`
            : 'translate3d(0, 0, 0)',
          transitionDelay: isScrolling ? '240ms' : '0ms',
          transitionDuration: `${isScrolling ? scrollDuration : returnDuration}ms`,
          transitionProperty: 'transform',
          transitionTimingFunction: isScrolling
            ? 'linear'
            : 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {text}
      </span>
    </span>
  );
}

function TocTreeItem({
  item,
  active,
  activePath,
  expanded,
  onToggle,
  registerActiveRow,
  onNavigate,
}: TocTreeItemProps) {
  const isCurrent = item.slug === active;
  const isActiveBranch = activePath.includes(item.slug);
  const hasChildren = item.children.length > 0;
  const isExpanded = expanded.has(item.slug);
  const [pointerInside, setPointerInside] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const [childrenRef, childrenSize] = useElementSize<HTMLUListElement>();
  const childrenSpring = useSpring({
    height: isExpanded ? childrenSize.height : 0,
    opacity: isExpanded ? 1 : 0,
    transform: isExpanded
      ? 'translate3d(0, 0, 0) scale(1)'
      : 'translate3d(0, -8px, 0) scale(0.985)',
    config: {
      duration: isExpanded ? 280 : 220,
      easing: isExpanded
        ? value => 1 - Math.pow(1 - value, 3)
        : value => value * value,
    },
  });

  return (
    <li className="relative">
      <div
        ref={isCurrent ? registerActiveRow : undefined}
        onPointerEnter={() => setPointerInside(true)}
        onPointerLeave={() => setPointerInside(false)}
        onFocusCapture={() => setFocusInside(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setFocusInside(false);
          }
        }}
        className={twMerge(
          'group relative z-10 mx-1 flex min-h-7 items-center rounded-lg transition-[color,background-color,transform] duration-200',
          'hover:bg-gray-600/10 dark:hover:bg-gray-400/10',
          isActiveBranch && 'text-primary-600 dark:text-primary-400',
          isCurrent && 'font-semibold text-primary-700 dark:text-primary-300',
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            className="ml-0.5 flex h-6 w-7 flex-none items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-600/10 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
            aria-label={`${isExpanded ? '收起' : '展开'}“${item.text}”的子目录`}
            aria-expanded={isExpanded}
            onClick={() => onToggle(item.slug)}
          >
            <IconChevronRight
              className={twMerge(
                'h-4 w-4 transition-transform duration-200',
                isExpanded && 'rotate-90',
              )}
            />
          </button>
        ) : (
          <span className="ml-0.5 block h-6 w-7 flex-none" aria-hidden="true" />
        )}
        <a
          className="min-w-0 flex-1 overflow-hidden py-1 pr-2 leading-5"
          href={`#${item.slug}`}
          onClick={event => onNavigate(event, item.slug)}
          aria-current={isCurrent ? 'location' : undefined}
          title={item.text}
        >
          <TocItemLabel
            text={item.text}
            interacting={pointerInside || focusInside}
          />
        </a>
      </div>

      {hasChildren && (
        <animated.div
          className="relative overflow-hidden"
          style={childrenSpring}
          aria-hidden={!isExpanded}
        >
          <ul
            ref={childrenRef}
            className="relative py-px pl-7 before:absolute before:bottom-3 before:left-5 before:top-0 before:w-px before:bg-gray-400/28 dark:before:bg-gray-500/30"
          >
            {item.children.map(child => (
              <TocTreeItem
                key={child.slug}
                item={child}
                active={active}
                activePath={activePath}
                expanded={expanded}
                onToggle={onToggle}
                registerActiveRow={registerActiveRow}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </animated.div>
      )}
    </li>
  );
}

export default function Toc({ toc }: TocProps) {
  const flatItems = useMemo(() => flattenToc(toc), [toc]);
  const headingSlugs = useMemo(() => flatItems.map(item => item.slug), [flatItems]);
  const navbarSize = useAtomValue(navbarSizeAtom);
  const { active } = useToc(headingSlugs, navbarSize.height);
  const activeItem = flatItems.find(item => item.slug === active) ?? flatItems[0];
  const activePath = useMemo(() => active ? findPath(toc, active) : [], [active, toc]);
  const branchSlugs = useMemo(() => findBranchSlugs(toc), [toc]);
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(findBranchSlugs(toc)));
  const treeViewportRef = useRef<HTMLDivElement | null>(null);
  const treeRegionRef = useRef<HTMLDivElement | null>(null);
  const activeRowRef = useRef<HTMLDivElement | null>(null);
  const [treeContentRef, treeContentSize] = useElementSize<HTMLDivElement>();
  const [indicator, setIndicator] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const allExpanded = branchSlugs.every(slug => expanded.has(slug));

  useEffect(() => {
    setExpanded(current => {
      const next = new Set(current);
      activePath.slice(0, -1).forEach(slug => next.add(slug));
      return next;
    });
  }, [activePath.join('/')]);

  useEffect(() => {
    const treeRegion = treeRegionRef.current;
    if (!treeRegion) {
      return;
    }
    if (collapsed) {
      treeRegion.setAttribute('inert', '');
    } else {
      treeRegion.removeAttribute('inert');
    }
  }, [collapsed]);

  useLayoutEffect(() => {
    const activeRow = activeRowRef.current;
    const viewport = treeViewportRef.current;
    const activeIsVisible = activePath
      .slice(0, -1)
      .every(slug => expanded.has(slug));

    if (collapsed || !activeRow || !viewport || !activeIsVisible) {
      setIndicator(value => value.height === 0 ? value : { ...value, height: 0 });
      return;
    }

    const measureActiveRow = () => {
      let top = 0;
      let left = 0;
      let offsetElement: HTMLElement | null = activeRow;

      while (offsetElement && offsetElement !== viewport) {
        top += offsetElement.offsetTop;
        left += offsetElement.offsetLeft;
        offsetElement = offsetElement.offsetParent as HTMLElement | null;
      }

      return offsetElement === viewport
        ? {
            top,
            left,
            width: activeRow.offsetWidth,
            height: activeRow.offsetHeight,
          }
        : null;
    };

    const activeRowLayout = measureActiveRow();
    if (!activeRowLayout) {
      return;
    }

    const targetScrollTop = activeRowLayout.top
      - (viewport.clientHeight - activeRowLayout.height) / 2;
    const maxScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);

    viewport.scrollTo({
      top: Math.min(maxScrollTop, Math.max(0, targetScrollTop)),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });

    const frame = requestAnimationFrame(() => {
      const layout = measureActiveRow();
      if (!layout) {
        return;
      }

      // Offset metrics stay in the viewport's local layout coordinates, so the
      // module's expand/collapse transform is not applied to them twice.
      setIndicator(layout);
    });

    return () => cancelAnimationFrame(frame);
  }, [active, activePath.join('/'), collapsed, expanded, treeContentSize.height]);

  const registerActiveRow = useCallback((element: HTMLDivElement | null) => {
    activeRowRef.current = element;
  }, []);

  const toggleItem = useCallback((slug: string) => {
    setExpanded(current => {
      const next = new Set(current);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setExpanded(allExpanded ? new Set() : new Set(branchSlugs));
  }, [allExpanded, branchSlugs]);

  const navigateToHeading = useCallback((
    event: React.MouseEvent<HTMLAnchorElement>,
    slug: string,
  ) => {
    const target = document.getElementById(slug);
    if (!target) {
      return;
    }

    event.preventDefault();
    history.replaceState(null, '', `#${encodeURIComponent(slug)}`);
    const top = window.scrollY + target.getBoundingClientRect().top - (navbarSize.height || 60) - 20;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }, [navbarSize.height]);

  const moduleSpring = useSpring({
    height: collapsed ? 0 : treeContentSize.height,
    opacity: collapsed ? 0 : 1,
    transform: collapsed
      ? 'translate3d(0, -12px, 0) scale(0.975)'
      : 'translate3d(0, 0, 0) scale(1)',
    filter: collapsed ? 'blur(2px)' : 'blur(0px)',
    config: {
      duration: collapsed ? 260 : 320,
      easing: collapsed
        ? value => value * value
        : value => 1 - Math.pow(1 - value, 3),
    },
  });

  const collapsedSummarySpring = useSpring({
    opacity: collapsed ? 1 : 0,
    transform: collapsed
      ? 'translate3d(0, 0, 0) scale(1)'
      : 'translate3d(0, 8px, 0) scale(0.97)',
    config: {
      duration: collapsed ? 320 : 200,
      easing: collapsed
        ? value => 1 - Math.pow(1 - value, 3)
        : value => value * value,
    },
  });

  const indicatorSpring = useSpring({
    top: indicator.top,
    left: indicator.left,
    width: indicator.width,
    height: indicator.height,
    opacity: collapsed || indicator.height === 0 ? 0 : 1,
    config: {
      tension: 360,
      friction: 32,
    },
  });

  if (!activeItem) {
    return null;
  }

  return (
    <nav
      className="plate-bg overflow-hidden rounded-xl border-highlight text-sm"
      aria-label="文章目录"
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <IconListTree className="h-5 w-5 flex-none text-primary-500" />
        <h2 className="font-bold">目录</h2>
        <span className="ml-auto text-xs tabular-nums text-gray-500 dark:text-gray-400">
          {flatItems.findIndex(item => item.slug === activeItem.slug) + 1}/{flatItems.length}
        </span>
        {branchSlugs.length > 0 && !collapsed && (
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-600/10 hover:text-primary-600 dark:text-gray-400 dark:hover:bg-gray-400/10 dark:hover:text-primary-400"
            aria-label={allExpanded ? '收起全部子目录' : '展开全部子目录'}
            title={allExpanded ? '收起全部' : '展开全部'}
            onClick={toggleAll}
          >
            {allExpanded
              ? <IconChevronsUp className="h-5 w-5" />
              : <IconChevronsDown className="h-5 w-5" />}
          </button>
        )}
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-600/10 hover:text-primary-600 dark:text-gray-400 dark:hover:bg-gray-400/10 dark:hover:text-primary-400"
          aria-label={collapsed ? '展开文章目录' : '收起文章目录'}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed(value => !value)}
        >
          {collapsed
            ? <IconFoldDown className="h-5 w-5" />
            : <IconFoldUp className="h-5 w-5" />}
        </button>
      </div>

      <animated.div
        className="overflow-hidden"
        style={{
          height: collapsedSummarySpring.opacity.to(value => `${value * 52}px`),
          opacity: collapsedSummarySpring.opacity,
          transform: collapsedSummarySpring.transform,
        }}
        aria-hidden={!collapsed}
      >
        <a
          href={`#${activeItem.slug}`}
          onClick={event => navigateToHeading(event, activeItem.slug)}
          className="mx-3 mb-3 flex min-h-10 items-center px-2 py-1 text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
          title={activeItem.text}
          tabIndex={collapsed ? 0 : -1}
        >
          <IconChevronRight className="h-4 w-4 flex-none opacity-55" />
          <span className="ml-2 line-clamp-2 min-w-0 font-medium">{activeItem.text}</span>
        </a>
      </animated.div>

      <animated.div
        ref={treeRegionRef}
        className="origin-top overflow-hidden"
        style={moduleSpring}
        aria-hidden={collapsed}
      >
        <div ref={treeContentRef}>
          <div
            ref={treeViewportRef}
            className="relative max-h-[min(28rem,52dvh)] overflow-y-auto overscroll-contain px-2 pb-3 pr-3"
          >
            {!collapsed && (
              <animated.div
                data-toc-indicator
                aria-hidden="true"
                className="pointer-events-none absolute top-0 rounded-lg bg-primary-500/10 ring-1 ring-inset ring-primary-500/14 shadow-[0_4px_14px_rgb(59_130_246/6%)] dark:bg-primary-400/10 dark:ring-primary-400/13 dark:shadow-[0_4px_16px_rgb(96_165_250/5%)]"
                style={indicatorSpring}
              />
            )}
            <ul>
              {toc.map(item => (
                <TocTreeItem
                  key={item.slug}
                  item={item}
                  active={active}
                  activePath={activePath}
                  expanded={expanded}
                  onToggle={toggleItem}
                  registerActiveRow={registerActiveRow}
                  onNavigate={navigateToHeading}
                />
              ))}
            </ul>
          </div>
        </div>
      </animated.div>
    </nav>
  );
}
