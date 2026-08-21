import { useEffect, useState } from 'react';

import ProgressBarComponent from './ProgressBarComponent';

type ProgressPhase = 'idle' | 'loading' | 'complete';
type TimerHandle = ReturnType<typeof setTimeout>;

const SHOW_DELAY_MS = 110;
const MIN_VISIBLE_MS = 280;
const COMPLETE_HOLD_MS = 240;
const FADE_DURATION_MS = 220;
const FAILSAFE_DURATION_MS = 30_000;

export default function ProgressBar() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<ProgressPhase>('idle');

  useEffect(() => {
    const timers = new Set<TimerHandle>();
    let navigationId = 0;
    let navigationActive = false;
    let visibleNow = false;
    let shownAt = 0;

    const schedule = (callback: () => void, delay: number) => {
      let timer: TimerHandle;
      timer = setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
      return timer;
    };

    const clearTimers = () => {
      timers.forEach(timer => clearTimeout(timer));
      timers.clear();
    };

    const setVisibleState = (nextVisible: boolean) => {
      visibleNow = nextVisible;
      setVisible(nextVisible);
    };

    const advance = (target: number) => {
      if (!navigationActive) return;
      setProgress(current => Math.max(current, target));
    };

    const scheduleTrickle = (currentNavigationId: number) => {
      schedule(() => {
        if (
          !navigationActive ||
          !visibleNow ||
          currentNavigationId !== navigationId
        ) {
          return;
        }

        setProgress(current => {
          const ceiling = 90;
          if (current >= ceiling) return current;

          const remaining = ceiling - current;
          const increment = Math.max(
            0.7,
            remaining * (0.055 + Math.random() * 0.04),
          );
          return Math.min(ceiling, current + increment);
        });

        scheduleTrickle(currentNavigationId);
      }, 230 + Math.random() * 260);
    };

    const finish = (currentNavigationId = navigationId) => {
      if (
        !navigationActive ||
        currentNavigationId !== navigationId
      ) {
        return;
      }

      navigationActive = false;
      clearTimers();

      // A navigation that finishes before the reveal delay should stay invisible.
      if (!visibleNow) {
        setProgress(0);
        setPhase('idle');
        return;
      }

      const elapsed = performance.now() - shownAt;
      const completionDelay = Math.max(0, MIN_VISIBLE_MS - elapsed);

      schedule(() => {
        if (currentNavigationId !== navigationId) return;

        setProgress(100);
        setPhase('complete');

        schedule(() => {
          if (currentNavigationId !== navigationId) return;

          setVisibleState(false);
          schedule(() => {
            if (currentNavigationId !== navigationId) return;
            setProgress(0);
            setPhase('idle');
          }, FADE_DURATION_MS);
        }, COMPLETE_HOLD_MS);
      }, completionDelay);
    };

    const start = () => {
      clearTimers();
      const currentNavigationId = ++navigationId;
      navigationActive = true;
      setPhase('loading');
      setProgress(5);

      const reveal = () => {
        if (
          !navigationActive ||
          currentNavigationId !== navigationId
        ) {
          return;
        }

        shownAt = performance.now();
        setVisibleState(true);
        setProgress(current => Math.max(current, 12));
        scheduleTrickle(currentNavigationId);
      };

      if (visibleNow) {
        reveal();
      } else {
        schedule(reveal, SHOW_DELAY_MS);
      }

      schedule(() => finish(currentNavigationId), FAILSAFE_DURATION_MS);
    };

    const prepared = () => advance(76);
    const beforeSwap = () => advance(86);
    const afterSwap = () => advance(94);
    const pageLoaded = () => finish();

    document.addEventListener('astro:before-preparation', start);
    document.addEventListener('astro:after-preparation', prepared);
    document.addEventListener('astro:before-swap', beforeSwap);
    document.addEventListener('astro:after-swap', afterSwap);
    document.addEventListener('astro:page-load', pageLoaded);

    return () => {
      clearTimers();
      document.removeEventListener('astro:before-preparation', start);
      document.removeEventListener('astro:after-preparation', prepared);
      document.removeEventListener('astro:before-swap', beforeSwap);
      document.removeEventListener('astro:after-swap', afterSwap);
      document.removeEventListener('astro:page-load', pageLoaded);
    };
  }, []);

  return (
    <ProgressBarComponent
      progress={progress}
      visible={visible}
      complete={phase === 'complete'}
    />
  );
}
