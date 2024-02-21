import { animated, useSpring } from '@react-spring/web';
import { usePrevious } from 'react-use';
import { twMerge } from 'tailwind-merge';
import { forwardRef, useRef, useImperativeHandle } from 'react';
import useUncontrolled from '@/hooks/useUncontrolled';
export interface ProgressBarProps extends React.ComponentPropsWithoutRef<'div'> {
  progress?: number;
  onChange?: () => void;
}

export interface ProgressBarRef {
  set(progress: number): void;
  get(): number;
  add(delta: number) : void;
  complete() : void;
  reset() : void;
}

const ProgressBar = forwardRef<ProgressBarRef>(({
  progress,
  style,
  className,
  onChange,
  ...rest
}: ProgressBarProps, ref) => {
  const [progressCtrl, setProgressCtrl] = useUncontrolled({
    value: progress,
    defaultValue: 0,
    onChange: onChange,
  });

  const [spring, api] = useSpring(() => ({
    from: {
      width: '0%',
      opacity: 0,
    },
    to: async (next, cancel) => {
      await next({
        width: `${progressCtrl}%`,
        opacity: 1,
        config: {
          tension: 300,
          friction: 30,
        }
      });
      if (progressCtrl >= 100) {
        await next({
          opacity: 0,
        })
      }
    },
  }), [progressCtrl]);


  useImperativeHandle(ref, () => {
    return {
      set(progress: number) {
        setProgressCtrl(progress > 100 ? 100 : progress);
      },
      get() {
        return progressCtrl;
      },
      add(delta: number) {
        setProgressCtrl(progressCtrl + delta > 100 ? 100 : progressCtrl + delta);
      },
      reset() {
        api.set({
          width: '0%',
          opacity: 0,
        });
        setProgressCtrl(0);
      },
      complete() {
        setProgressCtrl(100);
      },
    };
  }, [progressCtrl]);

  return (
    progressCtrl > 0 ? <animated.div style={{
      ...style,
      ...spring
    }} className={twMerge(
      'fixed top-0 left-0 h-1 bg-gradient-to-r from-secondary-500 to-primary-500 z-[100] rounded-r-full',
      'after:absolute after:w-12 after:h-1 after:right-0 after:top-0 after:bg-primary-700 after:blur-sm after:rotate-6 after:-translate-y-1/2',
      ' dark:after:bg-primary-400',
      className
    )} {...rest}></animated.div> : null
  ) 
});

export default ProgressBar