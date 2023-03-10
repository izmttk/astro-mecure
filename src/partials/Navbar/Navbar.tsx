import type React from 'react';
import Navbar from '@/components/Navbar';
import Logo from './Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { useEffect, useState } from 'react';

import { useLocation, useMap } from 'react-use';
import type { MenuConfig } from '@/components/Menu';

import IconChevronDown from '~icons/tabler/chevron-down';
import IconSidebarExpand from '~icons/tabler/layout-sidebar-right-expand'
import useBreakpoints from '@/hooks/useBreakpoints';
import Menu from '@/components/Menu';
import NoSSR from '@/components/NoSSR';

import IconMenu2 from '~icons/tabler/menu-2';
import IconX from '~icons/tabler/x';
import { 
  navbarSize as navbarSizeStore,
  navbarVisible as navbarVisibleStore,
  sidebarDrawerVisible as sidebarDrawerVisibleStore,
  hasThemeToggle as hasThemeToggleStore,
  hasSearchToggle as hasSearchToggleStore,
} from '@/store/states';
import Icon from '@/components/Icon';
import { useStore } from '@nanostores/react';
import { twMerge } from 'tailwind-merge';
import ScrollArea from '@/components/ScrollArea';
import useElementSize from '@/hooks/useElementSize';
import SearchToggle from '@/components/SearchToggle';
import styles from './Navbar.module.css';


function SideToggle() {
  const sideVisible = useStore(sidebarDrawerVisibleStore);
  const handleClick = () => {
    if (sideVisible) {
      sidebarDrawerVisibleStore.set(false);
    } else {
      sidebarDrawerVisibleStore.set(true);
    }
  }
  return (
    <button aria-label='Sidebar Toggle' className={twMerge(
      'p-1.5 rounded-full bg-gray-400/30 dark:bg-600/30',
    )} onClick={handleClick}><IconSidebarExpand className='h-5 w-5' /></button>
  )
}


export interface NavbarConfig {
  menu?: MenuConfig;
  hasThemeToggle?: boolean;
  hasSearchToggle?: boolean;
}

export interface CustomNavbarProps extends React.PropsWithChildren<React.ComponentPropsWithoutRef<'nav'>>{
  containerClassName?: string;
  config: NavbarConfig;
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
  config,
  ...rest
}: CustomNavbarProps) {
  const {
    menu = [],
    hasThemeToggle = true,
    hasSearchToggle = true,
  } = config;
  const [map, {set, setAll}] = useMap<{[key: string]: boolean}>({});

  const show = useStore(navbarVisibleStore);

  useEffect(() => {
    hasSearchToggleStore.set(hasSearchToggle);
  }, [hasSearchToggle]);
  useEffect(() => {
    hasThemeToggleStore.set(hasThemeToggle);
  }, [hasThemeToggle]);

  const onShowChange = (isShow: boolean) => {
    navbarVisibleStore.set(isShow);
    if (!isShow) {
      for (const key in map) {
        set(key, false);
      }
    }
  }

  const [active, setActive] = useState<number | null>(null);

  const location = useLocation();
  useEffect(() => {
    menu.forEach((item, index) => {
      if ('url' in item) {
        if (location.pathname && pathEqual(item.url, location.pathname)) {
          setActive(index);
        }
      }
    })
    
  }, [location]);

  const isMd = useBreakpoints('md');
  const [ref, size] = useElementSize<HTMLElement>();

  useEffect(() => {
    navbarSizeStore.set(size);
  }, [size]);



  const navMenu = (
    <ScrollArea className='w-full h-full px-2' containerClassName='!flex items-center'>
      {menu.map((item, index) => {
        if ('url' in item) {
          return (
            <Navbar.Item as='a' href={item.url}  isActive={active === index} className='px-3 py-1 flex-none' key={index}>
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
    <Navbar.Content className='h-16 text-sm' variant='highlight'>
      {navMenu}
    </Navbar.Content>
  );

  return (
    <Navbar ref={ref} position='floating' {...rest} hideOnScroll show={show} onShowChange={onShowChange}>
      <NoSSR>
        <div className={twMerge(
          'flex items-center w-full h-full text-sm',
          styles.navbarContainer,
          containerClassName
        )}>
          {!isMd && (
            <Navbar.Content className='md:ml-3 space-x-2'>
              <Navbar.Trigger className={twMerge(
                'p-1.5 rounded-full bg-gray-400/30 dark:bg-600/30',
              )}>
                {map['collapse'] ? <IconX className='h-5 w-5' /> : <IconMenu2 className='h-5 w-5' />}
              </Navbar.Trigger>
            </Navbar.Content>
          )}
          <Navbar.Logo as='a' href={import.meta.env.BASE_URL} aria-label="logo" className={isMd ? 'mr-3' : 'mx-auto'}>
            <Logo className='h-10' />
          </Navbar.Logo>
          {isMd && (
            <Navbar.Content className='mr-auto w-0 flex-1' variant='highlight'>
              {navMenu}
            </Navbar.Content>
          )}
          <Navbar.Content className='md:ml-3 space-x-2'>
            {hasSearchToggle && isMd && <SearchToggle />}
            {hasThemeToggle && isMd && <ThemeToggle open={map['theme'] ?? false} onOpenChange={(open: boolean) => set('theme', open)} />}
            {!isMd && <SideToggle />}
          </Navbar.Content>
        </div>
        {!isMd && (
          <Navbar.Collapse open={map['collapse'] ?? false} onOpenChange={(open: boolean) => set('collapse', open)}>
            {navCollapse}
          </Navbar.Collapse>
        )}
      </NoSSR>
    </Navbar>
  )
}
