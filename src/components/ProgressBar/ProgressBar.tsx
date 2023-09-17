import { animated, useSpring } from '@react-spring/web';

import { twMerge } from 'tailwind-merge';
export interface ProgressBarProps extends React.ComponentPropsWithoutRef<'div'> {
  progress: number;
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
}

const ProgressBar = ({
  progress = 0,
  style,
  className,
  onAnimationStart,
  onAnimationEnd,
  ...rest
}: ProgressBarProps) => {
  const [spring] = useSpring(() => ({
    from: {
      width: '0%',
      opacity: 1,
    },
    to: async (next, cancel) => {
      await next({
        width: `${progress > 100 ? 100 : progress}%`,
        opacity: 1,
        config: {
          tension: 300,
          friction: 30,
        }
      });
      if (progress >= 100) {
        await next({
          opacity: 0,
          config: {
            tension: 600,
            friction: 30,
          }
        })
      }
    },
    onStart: onAnimationStart,
    onRest: onAnimationEnd,
  }), [progress]);
  return (
    progress > 0 ? <animated.div style={{
      ...style,
      ...spring
    }} className={twMerge(
      'fixed top-0 left-0 h-1 bg-primary-500 z-[100] rounded-r-full',
      'after:absolute after:w-12 after:h-1 after:right-0 after:top-0 after:bg-primary-700 after:blur-sm after:rotate-6 after:-translate-y-1/2',
      ' dark:after:bg-primary-400',
      className
    )} {...rest}></animated.div> : null
  ) 
}

export default ProgressBar