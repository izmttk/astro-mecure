import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import { useScroll } from 'react-use';
import IconChevronLeft from '~icons/tabler/chevron-left';
import IconChevronRight from '~icons/tabler/chevron-right';
import styles from './Horizontal.module.css';
import useElementSize from '@/hooks/useElementSize';
import { twMerge } from 'tailwind-merge';


enum ActionTypes {
  RegisterItem,
  UnregisterItem,
}
type Action = 
  | { type: ActionTypes.RegisterItem; element: HTMLElement }
  | { type: ActionTypes.UnregisterItem; element: HTMLElement }


const initialState: HTMLElement[] = [];
function itemsReducer(state = initialState, action: Action) {
  switch (action.type) {

  case ActionTypes.RegisterItem:
    return state.includes(action.element) ? [...state] : [...state, action.element];

  case ActionTypes.UnregisterItem:
    return state.filter(item => item !== action.element);

  default:
    throw new Error('Unrecognized action type');
  }
}

const ItemsStoreContext = createContext<HTMLElement[] | null>(null);
function useStore() {
  const context = useContext(ItemsStoreContext);
  if (context === null) {
    throw new Error('<Horizonral.Item /> should be warpped by <Horizonral />.');
  }
  return context;
}

const ItemsDispatchContext = createContext<React.Dispatch<Action> | null>(null);
function useDispatch() {
  const context = useContext(ItemsDispatchContext);
  if (context === null) {
    throw new Error('<Horizonral.Item /> should be warpped by <Horizonral />');
  }
  return context;
}

export interface HorizontalItemProps extends React.PropsWithChildren<React.ComponentPropsWithoutRef<'div'>> {}
function HorizontalItem({
  children,
  className,
  ...rest
}: HorizontalItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  useEffect(() => {
    if (ref.current) {
      dispatch({
        type: ActionTypes.RegisterItem,
        element: ref.current,
      });
    }
    return () => {
      if (ref.current) {
        dispatch({
          type: ActionTypes.UnregisterItem,
          element: ref.current,
        });
      }
    }
  }, [dispatch]);
  return (
    <div ref={ref} className={twMerge('flex-none', className)} {...rest}>
      {children}
    </div>
  )
}
HorizontalItem.displayName = 'Horizonal.Item';

interface IconButtonProps extends React.PropsWithChildren<React.ComponentPropsWithoutRef<'button'>> {
  icon?: React.ReactNode
}
function IconButton({
  className,
  icon,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button tabIndex={-1} className={twMerge(
      'w-6 h-6 rounded-full p-[0.1875rem] flex justify-center items-center',
      // 'plate-bg plate-shadow border-highlight text-black dark:text-white',
      'hover:bg-gray-400/30',
      'outline-none',
      className
    )} {...rest}>
      {icon}
      {children}
    </button>
  )
}

function findLeftOverflowItem(items: HTMLElement[], container: HTMLElement, padding: number) {
  const containerRect = container.getBoundingClientRect();
  items = items.sort((a, b) => b.getBoundingClientRect().x - a.getBoundingClientRect().x);
  return items.find(item => {
    const itemRect = item.getBoundingClientRect();
    return itemRect.x < containerRect.x + padding;
  })
}

function findRightOverflowItem(items: HTMLElement[], container: HTMLElement, padding: number) {
  const containerRect = container.getBoundingClientRect();
  items = items.sort((a, b) => a.getBoundingClientRect().x - b.getBoundingClientRect().x);
  return items.find(item => {
    const itemRect = item.getBoundingClientRect();
    return itemRect.x + itemRect.width > containerRect.x + containerRect.width - padding;
  })
}

export interface HorizontalProps extends React.PropsWithChildren<React.ComponentPropsWithoutRef<'div'>> {
  containerClassName?: string;
}
function Horizontal({
  className,
  containerClassName,
  children,
  ...rest
}: HorizontalProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [elelemtRef, elementSize] = useElementSize<HTMLDivElement>();
  
  const scrollSize = {
    width: ref.current?.scrollWidth ?? 0,
    height: ref.current?.scrollHeight ?? 0,
  }
  const scrollPos = useScroll(ref);

  let isStart = true, isEnd = true;
  const margin = 8;
  if (scrollPos.x < margin) {
    isStart = true;
  } else {
    isStart = false;
  }
  if (scrollPos.x + elementSize.width > scrollSize.width - margin) {
    isEnd = true;
  } else {
    isEnd = false;
  }

  const [items, dispatch] = useReducer(itemsReducer, initialState);
  const handleLeftArrowBtnClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (ref.current) {
      const padding = 30;
      const prev = findLeftOverflowItem(items, ref.current, padding);
      if (prev) {
        const containerRect = ref.current.getBoundingClientRect();
        const prevRect = prev.getBoundingClientRect();
        ref.current.scrollTo({
          left: scrollPos.x + prevRect.x - containerRect.x - padding - 1,
          behavior: 'smooth',
        })
      }
    }

  }, [items, scrollPos]);
  const handleRightArrowBtnClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (ref.current) {
      const padding = 30;
      const next = findRightOverflowItem(items, ref.current, padding);
      if (next) {
        const containerRect = ref.current.getBoundingClientRect();
        const nextRect = next.getBoundingClientRect();
        ref.current.scrollTo({
          left: scrollPos.x + nextRect.x + nextRect.width - containerRect.x - containerRect.width + padding + 1,
          behavior: 'smooth',
        })
      }
    }
  }, [items, scrollPos]);

  return (
    <div className={twMerge('relative', className)} {...rest}>
      <div ref={e => {
        if (e) {
          ref.current = e;
          elelemtRef(e);
        }
      }} className={twMerge(
        'overflow-x-auto scrollbar-none p-2 flex flex-nowrap',
        isStart && !isEnd ? styles.gradientMaskLeft : null,
        !isStart && !isEnd ? styles.gradientMaskBoth : null,
        !isStart && isEnd ? styles.gradientMaskRight : null,
        containerClassName,
      )}>
        <ItemsStoreContext.Provider value={items}>
          <ItemsDispatchContext.Provider value={dispatch}>
            {children}
          </ItemsDispatchContext.Provider>
        </ItemsStoreContext.Provider>
      </div>
      {!isStart && (
        <div className='absolute inset-y-0 left-0 flex items-center'>
          <IconButton icon={<IconChevronLeft className='w-4 h-4' />} onClick={handleLeftArrowBtnClick} />
        </div>
      )}
      {!isEnd && (
        <div className='absolute inset-y-0 right-0 flex items-center'>
          <IconButton icon={<IconChevronRight className='w-4 h-4' />} onClick={handleRightArrowBtnClick} />
        </div>
      )}
    </div>
    // <pre>
    //   elementSize: {JSON.stringify(elementSize)} <br />
    //   scrollSize:  {JSON.stringify(scrollSize)} <br />
    //   scrollPos:   {JSON.stringify(scrollPos)} <br />
    //   isStart:     {JSON.stringify(isStart)} <br />
    //   isEnd:       {JSON.stringify(isEnd)} <br />
    // </pre>
  )
}
Horizontal.displayName = 'Horizonal';

export default Object.assign(Horizontal, {
  Item: HorizontalItem,
});
