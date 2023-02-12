import { useEffect, useRef, useState } from 'react';

interface State {
  horizontal: 'left' | 'right' | 'unchanged',
  vertical: 'up' | 'down' | 'unchanged',
}

const useWindowScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<State>({
    horizontal: 'unchanged',
    vertical: 'unchanged',
  });
  const prev = useRef<{
    x: number;
    y: number;
  } | null>(null);
  useEffect(() => {
    const handler = () => {
      const { pageXOffset, pageYOffset } = window;
      if (prev.current === null) {
        prev.current = {
          x: pageXOffset,
          y: pageYOffset
        }
      } else {
        const direction: State = {
          horizontal: 'unchanged',
          vertical: 'unchanged',
        };
        if (pageXOffset > prev.current.x) {
          direction.horizontal = 'left';
          prev.current.x = pageYOffset;
        } else if (pageXOffset < prev.current.x) {
          direction.horizontal = 'right';
          prev.current.x = pageXOffset;
        } else {
          direction.horizontal = 'unchanged';
        }
        if (pageYOffset > prev.current.y) {
          direction.vertical = 'down';
          prev.current.y = pageYOffset;
        } else if (pageYOffset < prev.current.y) {
          direction.vertical = 'up';
          prev.current.y = pageYOffset;
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

  return scrollDirection;
};

export default useWindowScrollDirection;
