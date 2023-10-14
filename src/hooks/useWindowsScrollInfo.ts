import { useEffect, useRef, useState } from 'react';

interface State {
  horizontal: 'left' | 'right' | 'unchanged',
  vertical: 'up' | 'down' | 'unchanged',
}

const useWindowScrollInfo = () => {
  const [scrollDirection, setScrollDirection] = useState<State>({
    horizontal: 'unchanged',
    vertical: 'unchanged',
  });
  const [isTop, setIsTop] = useState(false);
  const prev = useRef<{
    x: number;
    y: number;
  } | null>(null);
  useEffect(() => {
    const handler = () => {
      const { scrollX, scrollY } = window;
      if (scrollY === 0) {
        setIsTop(true);
      } else {
        setIsTop(false);
      }
      if (prev.current === null) {
        prev.current = {
          x: scrollX,
          y: scrollY
        }
      } else {
        const direction: State = {
          horizontal: 'unchanged',
          vertical: 'unchanged',
        };
        if (scrollX > prev.current.x) {
          direction.horizontal = 'left';
          prev.current.x = scrollY;
        } else if (scrollX < prev.current.x) {
          direction.horizontal = 'right';
          prev.current.x = scrollX;
        } else {
          direction.horizontal = 'unchanged';
        }
        if (scrollY > prev.current.y) {
          direction.vertical = 'down';
          prev.current.y = scrollY;
        } else if (scrollY < prev.current.y) {
          direction.vertical = 'up';
          prev.current.y = scrollY;
        } else {
          direction.vertical = 'unchanged';
        }
        setScrollDirection(state => {
          if (state.horizontal === direction.horizontal && state.vertical === direction.vertical) {
            return state;
          } else {
            return direction;
          }
        });
      }
    };

    //We have to update window scroll at mount, before subscription.
    //Window scroll may be changed between render and effect handler.
    handler();

    window.addEventListener('scroll', handler, {
      capture: false,
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', handler, {
        capture: false,
      });
    };
  }, []);

  return {
    direction: scrollDirection,
    isTop,
  };
};

export default useWindowScrollInfo;
