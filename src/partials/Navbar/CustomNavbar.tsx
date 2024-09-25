import Navbar from '@/components/Navbar';
import ThemeToggle from '@/components/ThemeToggle';
import { useCallback, useEffect, useState } from 'react';

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
    <button aria-label='Sidebar Toggle' className={twMerge(
      'p-2 rounded-full bg-gray-400/30 dark:bg-600/30',
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
  const [ref, size] = useElementSize<HTMLElement>();

  useEffect(() => {
    setNavbarSize(size);
  }, [size]);

  const navMenu = (
    <ScrollArea className='w-full h-full' containerClassName='!flex items-center px-2'>
      {menu.map((item, index) => {
        if ('url' in item) {
          return (
            <Navbar.Item as='a' href={item.url}  isActive={active === index} className={twMerge(
              'px-3 py-1 flex-none',
              'transition-transform duration-100 ease-out hover:-translate-y-1'
             )} key={index}>
              {item.icon && <Icon name={item.icon} width={18} height={18} className='mr-0.5' />}
              {item.label}
            </Navbar.Item>
          );
        } else {
          return (
            <Menu menu={item.children} open={map[index.toString()] ?? false} onOpenChange={(open: boolean) => set(index, open)} key={index}>
              <Navbar.Item as='button' className='px-3 py-1 cursor-pointer flex-none'>
                {item.icon && <Icon name={item.icon} width={18} height={18} className='mr-0.5' />}
                {item.label}
                <IconChevronDown className='ml-1' />
              </Navbar.Item>
            </Menu>
          )
        }
      })}
    </ScrollArea>
  );

  const navCollapse = (
    <Navbar.Content className='h-16 text-sm' variant='filled'>
      {navMenu}
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
              'p-2 rounded-full bg-gray-400/30 dark:bg-600/30',
            )}>
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
            {navMenu}
          </Navbar.Content>
        )}
        <Navbar.Content className='md:ml-3 space-x-2'>
          {hasSearchToggle && isMd && <SearchToggle />}
          {hasThemeToggle && isMd && <ThemeToggle open={map['theme'] ?? false} onOpenChange={onThemeMenuOpenChange} />}
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