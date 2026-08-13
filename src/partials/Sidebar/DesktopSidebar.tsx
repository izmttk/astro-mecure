import { animated, useSpring } from '@react-spring/web';
import { useAtomValue } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  navbarSize as navbarSizeAtom,
  navbarVisible as navbarVisibleAtom,
} from '@/store/atoms';

export interface DesktopSidebarProps extends React.PropsWithChildren {
  className?: string;
}

const SCROLL_EDGE_THRESHOLD = 2;

export default function DesktopSidebar({
  className,
  children,
}: DesktopSidebarProps) {
  const navbarVisible = useAtomValue(navbarVisibleAtom);
  const navbarSize = useAtomValue(navbarSizeAtom);
  const navbarHeight = navbarSize.height || 60;
  const targetTop = navbarVisible ? navbarHeight : 0;
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const updateScrollEdges = useCallback(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) {
      return;
    }

    const maxScrollTop = Math.max(
      0,
      scrollElement.scrollHeight - scrollElement.clientHeight,
    );

    setCanScrollUp(scrollElement.scrollTop > SCROLL_EDGE_THRESHOLD);
    setCanScrollDown(
      scrollElement.scrollTop < maxScrollTop - SCROLL_EDGE_THRESHOLD,
    );
  }, []);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) {
      return;
    }

    const resizeObserver = new ResizeObserver(updateScrollEdges);
    resizeObserver.observe(scrollElement);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    updateScrollEdges();
    window.addEventListener('resize', updateScrollEdges, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScrollEdges);
    };
  }, [updateScrollEdges]);

  const spring = useSpring({
    top: targetTop,
    config: {
      tension: 300,
      friction: 30,
    },
  });

  return (
    <aside
      className={twMerge('relative hidden self-stretch md:block', className)}
      aria-label="博客侧栏"
    >
      <animated.div
        className="sticky w-full overflow-hidden"
        style={{
          top: spring.top,
          height: spring.top.to(value => `calc(100dvh - ${value}px)`),
        }}
      >
        <div
          ref={scrollRef}
          data-sidebar-scroll
          data-fade-top={canScrollUp || undefined}
          data-fade-bottom={canScrollDown || undefined}
          className="sidebar-scroll h-full overflow-y-auto overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/50"
          tabIndex={0}
          aria-label="侧栏内容"
          onScroll={updateScrollEdges}
        >
          <div ref={contentRef} className="w-full">
            {children}
          </div>
        </div>
      </animated.div>
    </aside>
  );
}
