import { useEffect, useRef, useState } from 'react';

export default function useToc(headings: string[], topMargin = 0) {
  const [active, setActive] = useState<string | null>(null);
  const activeRef = useRef<string | null>(null);

  useEffect(() => {
    const elements = headings
      .map(heading => document.getElementById(heading))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      setActive(null);
      return;
    }

    let frame = 0;
    const updateActive = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const threshold = Math.max(topMargin, 72) + 24;
        let nextActive = elements[0].id;

        for (const element of elements) {
          if (element.getBoundingClientRect().top <= threshold) {
            nextActive = element.id;
          } else {
            break;
          }
        }

        if (activeRef.current !== nextActive) {
          activeRef.current = nextActive;
          setActive(nextActive);
        }
      });
    };

    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    document.addEventListener('astro:after-swap', updateActive);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
      document.removeEventListener('astro:after-swap', updateActive);
    };
  }, [headings, topMargin]);

  return { active };
}
