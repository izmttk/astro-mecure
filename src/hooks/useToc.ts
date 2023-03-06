import { useEffect, useMemo, useState } from 'react';

export default function useToc(headings: string[], topMargin: number = 0) {
  const [visibleList, setVisibleList] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = decodeURI(entry.target.id);
        if (entry.intersectionRatio > 0) {
          setVisibleList(value => {
            if (value.includes(id)) {
              return value;
            }
            return [...value, id];
          });
        } else {
          setVisibleList(value => {
            if (!value.includes(id)) {
              return value;
            }
            return value.filter(item => item !== id)
          });
        }
      })
    }, {
      threshold: [0, 1],
      rootMargin: `${-topMargin}px 0px -66% 0px`,
    });

    headings.forEach(heading => {
      const element = document.querySelector(`#${CSS.escape(heading)}`);
      if (element) {
        observer.observe(element);
      }
    })

    return () => {
      observer.disconnect();
    }
  }, [headings, topMargin]);
  const visible = headings.filter(heading => visibleList.includes(heading));

  useEffect(() => {
    if (visible.length > 0) {
      setActive(visible[0]);
    }
  }, [visible]);

  return {
    active: active,
    visible: visible
  };
}