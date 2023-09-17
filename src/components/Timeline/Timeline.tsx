import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface TimelineItemProps extends React.PropsWithChildren<React.ComponentPropsWithoutRef<'div'>> {
  label: string;
  icon?: React.ReactElement;
  lineVariant?: 'solid' | 'dashed' | 'dotted';
}

const TimelineItem = forwardRef<HTMLDivElement, TimelineItemProps>(({
  className,
  label,
  icon,
  lineVariant,
  children,
  ...rest
}, ref) => {
  return (
    <div ref={ref} className={twMerge(
      'pl-4 relative',
      'before:absolute before:left-0 before:top-0 before:-translate-x-1/2 before:h-full before:border-l-2 before:mt-4',
      'last:before:h-[calc(100%_-_1rem)]',
      'before:border-gray-300 dark:before:border-gray-700',
      className,
    )} {...rest}>
      <div className={twMerge(
        'h-8 leading-8 relative  font-semibold',
      )}>
        <div className={twMerge(
          'absolute -left-4 top-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[.65rem] min-h-[.65rem] rounded-full',
          'bg-gray-200 dark:bg-gray-800 ring-2 ring-gray-300 dark:ring-gray-700'
        )}>{icon}</div>
        {label}
      </div>
      <div className='my-2'>{children}</div>
    </div>
  )
})

export interface TimelineProps extends React.PropsWithChildren<React.ComponentPropsWithoutRef<'div'>> {
  
}

const Timeline = forwardRef<HTMLDivElement, TimelineProps>(({
  className,
  children,
  ...rest
}, ref) => {
  return (
    <div ref={ref} className={twMerge(
      'pl-3',
      className,
    )} {...rest}>{children}</div>
  )
});



export default Object.assign(Timeline, {
  Item: TimelineItem,
})

