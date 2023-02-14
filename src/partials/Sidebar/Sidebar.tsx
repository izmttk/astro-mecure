import type React from "react";
import ScrollArea from "@/components/ScrollArea";

import { useStore } from "@nanostores/react";
import { 
  navbarSize as navbarSizeStore, 
  navbarVisible as navbarVisibleStore,
  sidebarDrawerVisible as sidebarDrawerVisibleStore,
} from "@/store/states";
import { animated, useSpring } from "@react-spring/web";
import Drawer from "@/components/Drawer";
import { twMerge } from "tailwind-merge";
import ThemeToggle from "@/components/ThemeToggle";
import useBreakpoints from "@/hooks/useBreakpoints";
import NoSSR from "@/components/NoSSR";
import SearchToggle from "@/components/SearchToggle";

export interface CustomSidebarProps extends React.PropsWithChildren<React.ComponentPropsWithoutRef<'aside'>> {
  showSidebarOnDesktop?: boolean;
}


export default function CustomSidebar({
  showSidebarOnDesktop = true,
  className,
  children,
  ...rest
}: CustomSidebarProps) {
  const isMd = useBreakpoints('md');
  if (isMd && !showSidebarOnDesktop) {
    return null;
  }

  const navbarVisible = useStore(navbarVisibleStore);
  const navbarSize = useStore(navbarSizeStore);
  // const viewportSize = useWindowSize();

  const [spring, api] = useSpring(() => ({
    to: { 
      top: navbarVisible ? navbarSize.height : 0,
    },
    config: {
      tension: 300,
      friction: 30,
    },
  }), [navbarVisible, navbarSize]);

  const drawerVisible = useStore(sidebarDrawerVisibleStore);
  const setDrawerVisible = (show: boolean) => {
    sidebarDrawerVisibleStore.set(show);
  }

  const sidebarContent = (
    <ScrollArea type='scroll' className='h-full' containerClassName='items-center space-y-4 p-3' useMask={false}>
      {children}
    </ScrollArea>
  )
  return (
    <NoSSR>
      {isMd ? (
        <animated.aside style={{
          height: spring.top.to(value => `calc(100vh - ${value}px)`),
          ...spring
        }} className={twMerge(
          'max-h-screen sticky top-0',
          className
        )} {...rest}>
          {sidebarContent}
        </animated.aside>
      ) : (
        <Drawer open={drawerVisible} onOpenChange={setDrawerVisible}>
          <Drawer.Content>
            <div className="px-3 h-14 flex gap-2 items-center">
              <SearchToggle onOpenChange={(open) => { open && setDrawerVisible(false) }} />
              <ThemeToggle />
              <Drawer.Close className='ml-auto' />
            </div>
            <aside className={twMerge(
              'h-[calc(100%_-_3.5rem)]',
              className
            )}>
              {sidebarContent}
            </aside>
          </Drawer.Content>
        </Drawer>
      )}
    </NoSSR>
  )
}