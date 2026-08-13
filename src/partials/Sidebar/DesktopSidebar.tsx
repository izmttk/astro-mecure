import { animated, useSpring } from '@react-spring/web';
import { useAtomValue } from 'jotai';
import { twMerge } from 'tailwind-merge';

import {
  navbarSize as navbarSizeAtom,
  navbarVisible as navbarVisibleAtom,
} from '@/store/atoms';

export interface DesktopSidebarProps extends React.PropsWithChildren {
  className?: string;
}

export default function DesktopSidebar({
  className,
  children,
}: DesktopSidebarProps) {
  const navbarVisible = useAtomValue(navbarVisibleAtom);
  const navbarSize = useAtomValue(navbarSizeAtom);
  const navbarHeight = navbarSize.height || 60;
  const targetTop = navbarVisible ? navbarHeight : 0;

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
          data-sidebar-scroll
          className="sidebar-scroll h-full overflow-y-auto overscroll-contain"
        >
          {children}
        </div>
      </animated.div>
    </aside>
  );
}
