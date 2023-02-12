import React, { useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import Polymorphic, { withPolymorphic } from '../Polymorphic';
import { useSpring, animated } from '@react-spring/web';
import useWindowScrollDirection from '../../hooks/useWindowsScrollDirection';
import useCallbackRef from '../../hooks/useCallbackRef';
import { twMerge } from 'tailwind-merge';
import { useLockBodyScroll, useWindowSize } from 'react-use';
import useElementSize from '../../hooks/useElementSize';

const ContentConfigContext = React.createContext<{
  variant: 'underline' | 'highlight' | 'filled';
} | null>(null);

enum ActionTypes {
  setCollapseOpen,
  setCollapseNode,
}
type Action = 
  | { type: ActionTypes.setCollapseOpen, open: boolean }
  | { type: ActionTypes.setCollapseNode, node: React.ReactNode };

type States = { 
  open: boolean,
  node: React.ReactNode,
};

const initialStates: States = {
  open: false,
  node: null,
}

function collapseReducer(states = initialStates, action: Action) {
  switch (action.type) {
    
  case ActionTypes.setCollapseOpen:
    return {
      ...states,
      open: action.open,
    }
  case ActionTypes.setCollapseNode:
    return {
      ...states,
      node: action.node
    }
  default:
    throw new Error('Unrecognized action type');
  }
}
const CollapseStoreContext = React.createContext<States | null>(null);
const CollapseDispatchContext = React.createContext<React.Dispatch<Action> | null>(null);



export interface NavbarLogoProps extends React.PropsWithChildren {}
const NavbarLogo =  withPolymorphic<'div', NavbarLogoProps>(React.forwardRef(({
  className,
  ...rest
}, ref: React.Ref<HTMLDivElement>) => {

  return (
    <Polymorphic ref={ref} className={twMerge(
      'h-full flex justify-center items-center',
      className
    )} {...rest}></Polymorphic>
  )
}))

export interface NavbarContentProps extends React.PropsWithChildren<React.ComponentPropsWithoutRef<'div'>> {
  variant?: 'underline' | 'highlight' | 'filled';
}
const NavbarContent = React.forwardRef(({
  variant = 'underline',
  className,
  ...rest
}: NavbarContentProps, ref: React.Ref<HTMLDivElement>) => {
  const config = {
    variant,
  }

  return (
    <ContentConfigContext.Provider value={config}>
      <div ref={ref} className={twMerge(
        'flex flex-nowrap items-center h-full',
        className,
      )} {...rest}></div>
    </ContentConfigContext.Provider>
  )
})


export interface NavbarItemProps extends React.PropsWithChildren {
  isActive?: boolean;
  activeClassName?: string;
};

const NavbarItem = withPolymorphic<'div', NavbarItemProps>(React.forwardRef(({
  isActive = false,
  activeClassName,
  className,
  ...rest
}, ref: React.Ref<HTMLDivElement>) => {

  const context = useContext(ContentConfigContext);

  if (context === null) {
    throw new Error('<Navbar.Item /> should be wrapped by <Navbar.Content />.')
  }
  return (
    <Polymorphic ref={ref} className={twMerge(
      'flex items-center relative',
      isActive && 'font-bold',
      isActive && context.variant === 'underline' ? 'h-full text-primary-500 after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:rounded-full after:bg-primary-500' : null,
      isActive && context.variant === 'highlight' ? 'text-primary-600 dark:text-primary-400 rounded-full bg-primary-400/30 dark:bg-primary-600/30' : null,
      isActive && context.variant === 'filled' ? 'text-gray-100 rounded-full bg-primary-600' : null,
      isActive && activeClassName,
      className,
    )} {...rest}></Polymorphic>
  )
}));


export interface NavbarCollapseProps extends React.PropsWithChildren {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const NavbarCollapse = ({
  open,
  onOpenChange,
  children,
}: NavbarCollapseProps) => {
  const states = useContext(CollapseStoreContext);
  const dispatch = useContext(CollapseDispatchContext);
  if (states === null || dispatch === null) {
    throw new Error('<Navbar.Collapse /> should be warpped by <Navbar />.');
  }
  useEffect(() => {
    if (typeof open === 'boolean') {
      dispatch({
        type: ActionTypes.setCollapseOpen,
        open: open,
      })
    }
  }, [open]);
  useEffect(() => {
    if (onOpenChange && states.open !== open) {
      onOpenChange(states.open);
    }
  }, [states.open]);

  useEffect(() => {
    dispatch({
      type: ActionTypes.setCollapseNode,
      node: children,
    })
    return () => {
      dispatch({
        type: ActionTypes.setCollapseNode,
        node: null,
      })
    }
  }, [children]);

  return null;
};


export interface NavbarCollapseTriggerProps extends React.PropsWithChildren<React.ComponentPropsWithoutRef<'button'>> {

}

const NavbarCollapseTrigger = React.forwardRef<HTMLButtonElement, NavbarCollapseTriggerProps>(({
  className,
  children,
  ...rest
}, ref) => {
  const states = useContext(CollapseStoreContext);
  const dispatch = useContext(CollapseDispatchContext);
  if (states === null || dispatch === null) {
    throw new Error('<Navbar.Trigger /> should be warpped by <Navbar />.');
  }
  const handleClick = () => {
    dispatch({
      type: ActionTypes.setCollapseOpen,
      open: !states.open
    })
  }
  return (
    <button ref={ref} className={className} {...rest} onClick={handleClick}>{children}</button>
  )
});


export interface NavbarProps extends React.PropsWithChildren<React.ComponentPropsWithoutRef<'nav'>> {
  position?: 'floating' | 'static' | 'sticky';
  show?: boolean;
  hideOnScroll?: boolean;
  onShowChange?: (isShow: boolean) => void;
}

const Navbar = React.forwardRef<HTMLElement, NavbarProps>(({
  position = 'sticky',
  show,
  hideOnScroll = false,
  onShowChange,
  className,
  children,
  ...rest
}, ref) => {
  
  const direction = useWindowScrollDirection();
  const shouldHide = position !== 'static' && hideOnScroll && direction.vertical === 'down';
  const isShow = show ?? !shouldHide;
  const [states, dispatch] = useReducer(collapseReducer, initialStates);

  // no render when onShowChange changed
  const handleShowChange = useCallbackRef(onShowChange);
  useEffect(() => {
    handleShowChange && handleShowChange(!shouldHide);
  }, [shouldHide]);

  const [translateSpring] = useSpring(() => ({
    to: {
      transform: isShow ? 'translateY(0%)' : 'translateY(-100%)',
    },
    config: {
      tension: 300,
      friction: 30,
    }
  }), [isShow]);

  const [collapseContentRef, collapseContentSize] = useElementSize<HTMLDivElement>();
  // useLockBodyScroll(states.open);
  const [collapseSpring] = useSpring(() => ({
    to: {
      height: states.open ? `${collapseContentSize.height}px` : '0',
      translateY: states.open ? '0' : '-50%',
      opacity: states.open ? 1 : 0,
    },
    config: {
      tension: 300,
      friction: 30,
    }
  }), [states.open, collapseContentSize.height]);

  return (
    <animated.nav ref={ref} className={twMerge(
      position === 'floating' ? 'fixed top-0 left-0' : null,
      position === 'static' ? 'static' : null,
      position === 'sticky' ? 'sticky top-0 left-0' : null,
      'w-full h-[3.75rem] z-50',
      // 'transition-transform duration-300',
      // !isShow ? '-translate-y-full' : null,
      className,
    )} style={translateSpring} {...rest}>
      <CollapseStoreContext.Provider value={states}>
        <CollapseDispatchContext.Provider value={dispatch}>
          <div className={twMerge(
            'shadow-md shadow-gray-900/[0.05] dark:shadow-gray-900/50',
            'bg-white/80 border-b border-gray-600/20 dark:bg-gray-800/75 dark:border-gray-50/[0.06]',
            'backdrop-blur-md backdrop-saturate-150',
          )}>
            <div className='flex h-[3.75rem]'>{children}</div>
            {states.node && (
              <animated.div style={collapseSpring} className='overflow-hidden'>
                <div ref={collapseContentRef}>
                  {states.node}
                </div>
              </animated.div>
            )}
          </div>
        </CollapseDispatchContext.Provider>
      </CollapseStoreContext.Provider>
      {/* curPos:{JSON.stringify(curPos)}<br/>
      prevPos:{JSON.stringify(prevPos)}<br/> */}
    </animated.nav>
  )
})


export default Object.assign(Navbar, {
  Content: NavbarContent,
  Item: NavbarItem,
  Logo: NavbarLogo,
  Collapse: NavbarCollapse,
  Trigger: NavbarCollapseTrigger,
})