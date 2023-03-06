import React, { useMemo, useState } from 'react';
import { useIsomorphicLayoutEffect } from 'react-use';

interface Size {
  width: number
  height: number
}

function useElementSize<T extends HTMLElement = HTMLDivElement>(): [
  (node: T | null) => void,
  Size,
] {
  // Mutable values like 'ref.current' aren't valid dependencies
  // because mutating them doesn't re-render the component.
  // Instead, we use a state as a ref to be reactive.
  const [ref, setRef] = useState<T | null>(null)
  const [size, setSize] = useState<Size>({
    width: 0,
    height: 0,
  })

  const observer = useMemo(() => {
    return new ResizeObserver(entries => {
      entries.forEach(entry => {
        // this hooks return element size including border and padding
        setSize({
          width: entry.target.getBoundingClientRect().width,
          height: entry.target.getBoundingClientRect().height,
        })
      })
    })
  }, []);
  
  useIsomorphicLayoutEffect(() => {
    if (ref) {
      observer.observe(ref);
    }
    return () => {
      observer.disconnect();
    }
  }, [ref]);

  return [setRef, size];
}

export default useElementSize;