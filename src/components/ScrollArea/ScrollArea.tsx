import * as RadixScrollArea from '@radix-ui/react-scroll-area';

import { useMeasure, useScroll } from 'react-use';
import { useRef } from 'react';
import styles from './ScrollArea.module.css';
import { twMerge } from 'tailwind-merge';
import useElementSize from '@/hooks/useElementSize';

export interface ScrollAreaProps extends RadixScrollArea.ScrollAreaProps {
  containerClassName?: string;
  hasThumb?: boolean;
  edgeClassName?: string;
  useMask?: boolean;
  edgeShadow?: boolean;
}

const scrollBarClass = twMerge(
  'flex select-none touch-none',
  'data-[orientation=vertical]:px-0.5 data-[orientation=vertical]:py-2',
  'data-[orientation=horizontal]:px-2 data-[orientation=horizontal]:py-0.5',
  'data-[orientation=vertical]:w-[0.5625rem] data-[orientation=horizontal]:h-[0.5625rem] data-[orientation=horizontal]:flex-col',
  styles.scrollbar,
)

const scrollThumbClass = twMerge(
  'flex-1 bg-gray-500/30 rounded-full relative',
  'before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[2rem] before:min-h-[2rem]',
)

const edgeClass = 'absolute from-background-light dark:from-background-dark to-transparent z-10 pointer-events-none';

export default function ScrollArea({
  className,
  containerClassName,
  hasThumb = true,
  edgeShadow = true,
  edgeClassName,
  useMask = true,
  children,
  ...rest
}: ScrollAreaProps) {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const {width: elementWidth, height: elementHeight} = size;

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const {x: scrollX, y: scrollY} = useScroll(scrollRef);
  const scrollHeight = scrollRef.current?.scrollHeight ?? 0;
  const scrollWidth = scrollRef.current?.scrollWidth?? 0;

  const margin = 8;
  const isAtTop = scrollY < margin;
  const isAtBottom = scrollY + elementHeight > scrollHeight - margin;
  const isAtLeft = scrollX < margin;
  const isAtRight = scrollX + elementWidth > scrollWidth - margin;
  return (
    <RadixScrollArea.Root className={twMerge(
      'overflow-hidden relative',
      className
    )} {...rest}>
      <RadixScrollArea.Viewport ref={(e) => {
        if (e) {
          ref(e);
          scrollRef.current = e;
        }
      }} className={twMerge(
        '!block w-full h-full',
        !hasThumb && '!overflow-scroll',
        edgeShadow && useMask && styles.gradientMask,
        edgeShadow && useMask && !isAtTop && styles.topMask,
        edgeShadow && useMask && !isAtBottom && styles.bottomMask,
        edgeShadow && useMask && !isAtLeft && styles.leftMask,
        edgeShadow && useMask && !isAtRight && styles.rightMask,
        containerClassName,
      )} asChild>
        {children}
      </RadixScrollArea.Viewport>
      {edgeShadow && !useMask && !isAtTop && <div className={twMerge('top-0 h-8 inset-x-0 bg-gradient-to-b', edgeClass, edgeClassName)}></div>}
      {edgeShadow && !useMask && !isAtBottom && <div className={twMerge('bottom-0 h-8 inset-x-0 bg-gradient-to-t', edgeClass, edgeClassName)}></div>}
      {edgeShadow && !useMask && !isAtLeft && <div className={twMerge('left-0 w-8 inset-y-0 bg-gradient-to-r', edgeClass, edgeClassName)}></div>}
      {edgeShadow && !useMask && !isAtRight && <div className={twMerge('right-0 w-8 inset-y-0 bg-gradient-to-l', edgeClass, edgeClassName)}></div>}
      {hasThumb && (
        <>
          <RadixScrollArea.Scrollbar orientation='vertical' className={scrollBarClass}>
            <RadixScrollArea.Thumb className={scrollThumbClass} />
          </RadixScrollArea.Scrollbar>
          <RadixScrollArea.Scrollbar orientation='horizontal' className={scrollBarClass}>
            <RadixScrollArea.Thumb className={scrollThumbClass} />
          </RadixScrollArea.Scrollbar>
        </>
      )}
    </RadixScrollArea.Root>
  )
}
