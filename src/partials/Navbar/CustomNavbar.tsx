import Navbar from '@/components/Navbar';
import ThemeToggle from '@/components/ThemeToggle';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useMap } from 'react-use';

import IconChevronDown from '~icons/tabler/chevron-down';
import IconSidebarExpand from '~icons/tabler/layout-sidebar-right-expand'
import useBreakpoints from '@/hooks/useBreakpoints';
import usePath from '@/hooks/usePath';
import Menu, { type MenuConfig } from '@/components/Menu';
import NoSSR from '@/components/NoSSR';

import IconMenu2 from '~icons/tabler/menu-2';
import IconX from '~icons/tabler/x';
import { 
  navbarSize as navbarSizeAtom,
  navbarVisible as navbarVisibleAtom,
  sidebarDrawerVisible as sidebarDrawerVisibleAtom,
  hasThemeToggle as hasThemeToggleAtom,
  hasSearchToggle as hasSearchToggleAtom,
} from '@/store/atoms';
import Icon from '@/components/Icon';
import { useAtom, useSetAtom } from 'jotai';
import { twMerge } from 'tailwind-merge';
import ScrollArea from '@/components/ScrollArea';
import useElementSize from '@/hooks/useElementSize';
import SearchToggle from '@/components/SearchToggle';
import styles from './Navbar.module.css';
import { url } from '@/utils/url';
import { animated, useSpring } from '@react-spring/web';

interface IndicatorGeometry {
  left: number;
  top: number;
  width: number;
  height: number;
}


function SideToggle() {
  const [sideVisible, setSideVisible] = useAtom(sidebarDrawerVisibleAtom);
  const handleClick = () => {
    if (sideVisible) {
      setSideVisible(false);
    } else {
      setSideVisible(true);
    }
  }
  return (
    <button type="button" aria-label='打开侧栏' className={twMerge(
      'h-10 w-10 flex items-center justify-center rounded-full bg-gray-400/30 dark:bg-600/30',
    )} onClick={handleClick}><IconSidebarExpand className='h-5 w-5' /></button>
  )
}



export interface CustomNavbarProps extends React.PropsWithChildren<React.ComponentPropsWithoutRef<'nav'>>{
  containerClassName?: string;
  logo?: React.ReactNode;
  menu?: MenuConfig;
  hasThemeToggle?: boolean;
  hasSearchToggle?: boolean;
}


function pathEqual(source: string, target: string) {
  // ignore redundant trailing slash
  while (source.endsWith('/')) {
    source =  source.slice(0, source.length - 1);
  }
  while (target.endsWith('/')) {
    target =  target.slice(0, target.length - 1);
  }
  return source === target;
}

export default function CustomNavbar({
  containerClassName,
  menu = [],
  hasThemeToggle = true,
  hasSearchToggle = true,
  logo,
  ...rest
}: CustomNavbarProps) {
  const [map, {set, setAll}] = useMap<{[key: string]: boolean}>({});

  const [show, setShow] = useAtom(navbarVisibleAtom);
  const setHasSearchToggle = useSetAtom(hasSearchToggleAtom);
  const setHasThemeToggle = useSetAtom(hasThemeToggleAtom);
  const setNavbarSize = useSetAtom(navbarSizeAtom);
  useEffect(() => {
    setHasSearchToggle(hasSearchToggle);
  }, [hasSearchToggle]);
  useEffect(() => {
    setHasThemeToggle(hasThemeToggle);
  }, [hasThemeToggle]);

  const [active, setActive] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef(new Map<number, HTMLElement>());
  const [indicator, setIndicator] = useState<IndicatorGeometry | null>(null);

  const path = usePath();
  useEffect(() => {
    setActive(null);

    menu.forEach((item, index) => {
      if ('url' in item) {
        if (path && pathEqual(item.url, path)) {
          setActive(index);
        }
      }
    })
    
  }, [path]);

  const isMd = useBreakpoints('md');
  const indicatorIndex = hovered ?? focused ?? active;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateReducedMotion = () => setReducedMotion(media.matches);

    updateReducedMotion();
    if (media.addEventListener) {
      media.addEventListener('change', updateReducedMotion);
      return () => media.removeEventListener('change', updateReducedMotion);
    }

    media.addListener(updateReducedMotion);
    return () => media.removeListener(updateReducedMotion);
  }, []);

  const measureIndicator = useCallback(() => {
    const container = desktopMenuRef.current;
    const item = indicatorIndex === null
      ? null
      : itemRefs.current.get(indicatorIndex);

    if (!container || !item) {
      setIndicator(null);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    setIndicator({
      left: itemRect.left - containerRect.left + container.scrollLeft,
      top: itemRect.top - containerRect.top + container.scrollTop,
      width: itemRect.width,
      height: itemRect.height,
    });
  }, [indicatorIndex]);

  useLayoutEffect(() => {
    measureIndicator();
  }, [isMd, measureIndicator]);

  useEffect(() => {
    const container = desktopMenuRef.current;
    if (!container) {
      return;
    }

    const resizeObserver = new ResizeObserver(measureIndicator);
    resizeObserver.observe(container);
    itemRefs.current.forEach(item => resizeObserver.observe(item));

    return () => resizeObserver.disconnect();
  }, [isMd, measureIndicator, menu]);

  const indicatorSpring = useSpring({
    left: indicator?.left ?? 0,
    top: indicator?.top ?? 0,
    width: indicator?.width ?? 0,
    height: indicator?.height ?? 0,
    opacity: indicator ? 1 : 0,
    immediate: reducedMotion,
    config: {
      tension: hovered === null ? 340 : 420,
      friction: hovered === null ? 32 : 30,
      clamp: false,
    },
  });

  const [ref, size] = useElementSize<HTMLElement>();

  useEffect(() => {
    setNavbarSize(size);
  }, [size]);

  const renderMenuItems = (mobile = false) => menu.map((item, index) => {
    const interactionProps = mobile ? {} : {
      ref: (element: HTMLElement | null) => {
        if (element) {
          itemRefs.current.set(index, element);
        } else {
          itemRefs.current.delete(index);
        }
      },
      onPointerEnter: () => setHovered(index),
      onFocus: () => setFocused(index),
      onBlur: () => setFocused(null),
    };

    if ('url' in item) {
      return (
        <Navbar.Item {...interactionProps} as='a' href={item.url} isActive={active === index} aria-current={active === index ? 'page' : undefined} className={twMerge(
          mobile
            ? 'min-h-11 justify-center rounded-lg px-3 py-2'
            : 'z-10 min-h-9 px-3 py-1 flex-none rounded-full bg-transparent! text-current! transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/80 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent'
        )} key={item.url}>
          {item.icon && <Icon name={item.icon} width={18} height={18} className='mr-0.5' />}
          {item.label}
        </Navbar.Item>
      );
    }

    return (
      <Menu menu={item.children} open={map[index.toString()] ?? false} onOpenChange={(open: boolean) => set(index, open)} key={index}>
        <Navbar.Item {...interactionProps} as='button' type='button' className={twMerge(
          'cursor-pointer',
          mobile ? 'min-h-11 w-full justify-center rounded-lg px-3 py-2' : 'z-10 min-h-9 px-3 py-1 flex-none rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/80 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent'
        )}>
          {item.icon && <Icon name={item.icon} width={18} height={18} className='mr-0.5' />}
          {item.label}
          <IconChevronDown className='ml-1' />
        </Navbar.Item>
      </Menu>
    );
  });

  const desktopNavMenu = (
    <ScrollArea className='w-full h-full' containerClassName='flex! items-center px-2' edgeShadow={false}>
      <div
        ref={desktopMenuRef}
        className='relative flex h-full w-max min-w-full items-center'
        onPointerLeave={() => setHovered(null)}
      >
        <animated.div
          aria-hidden="true"
          data-navbar-indicator
          className={styles.glassIndicator}
          style={{
            left: indicatorSpring.left,
            top: indicatorSpring.top,
            width: indicatorSpring.width,
            height: indicatorSpring.height,
            opacity: indicatorSpring.opacity,
          }}
        />
        {renderMenuItems()}
      </div>
    </ScrollArea>
  );

  const mobileNavMenu = (
    <div className='grid grid-cols-2 gap-2 p-3'>
      {renderMenuItems(true)}
    </div>
  );

  const navCollapse = (
    <Navbar.Content className='block h-auto text-sm' variant='filled'>
      {mobileNavMenu}
    </Navbar.Content>
  );

  const onShowChange = useCallback((isShow: boolean) => {
    setShow(isShow);
    if (!isShow) {
      for (const key in map) {
        set(key, false);
      }
    }
  }, [map]);

  const onThemeMenuOpenChange = useCallback((open: boolean) => set('theme', open), []);
  const onNavCollapseOpenChange = useCallback((open: boolean) => set('collapse', open), []);

  return (
    <Navbar ref={ref} position='floating' {...rest} hideOnScroll={isMd} transparentOnTop show={show} onShowChange={onShowChange}>
      <div className={twMerge(
        'flex items-center w-full h-full text-sm',
        styles.navbarContainer,
        containerClassName
      )}>
        {!isMd && (
          <Navbar.Content className='md:ml-3 space-x-2'>
            <Navbar.Trigger className={twMerge(
              'h-10 w-10 flex items-center justify-center rounded-full bg-gray-400/30 dark:bg-600/30',
            )} aria-label={map['collapse'] ? '关闭主导航' : '打开主导航'}>
              {map['collapse'] ? <IconX className='h-5 w-5' /> : <IconMenu2 className='h-5 w-5' />}
            </Navbar.Trigger>
          </Navbar.Content>
        )}
        {logo && (
          <Navbar.Logo as='a' href={url('/')} aria-label="logo" className={isMd ? 'mr-3' : 'mx-auto'}>
            {logo}
          </Navbar.Logo>
        )}
        {isMd && (
          <Navbar.Content className='mr-auto w-0 flex-1' variant='filled'>
            {desktopNavMenu}
          </Navbar.Content>
        )}
        <Navbar.Content className='md:ml-3 space-x-2'>
          {hasSearchToggle && isMd && <SearchToggle className={styles.glassAction} />}
          {hasThemeToggle && isMd && <ThemeToggle className={styles.glassAction} open={map['theme'] ?? false} onOpenChange={onThemeMenuOpenChange} />}
          {!isMd && <SideToggle />}
        </Navbar.Content>
      </div>
      {!isMd && (
        <Navbar.Collapse open={map['collapse'] ?? false} onOpenChange={onNavCollapseOpenChange}>
          {navCollapse}
        </Navbar.Collapse>
      )}
    </Navbar>
  )
}
