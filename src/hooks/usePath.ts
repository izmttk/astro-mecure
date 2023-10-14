import { useState, useEffect } from 'react'

const patchHistoryMethod = (method: 'pushState' | 'replaceState', eventName: string) => {
  const history = window.history;
  const original = history[method];

  history[method] = function (state) {
    const result = original.apply(this, arguments as any);
    const event = new Event(eventName);

    (event as any).state = state;

    window.dispatchEvent(event);

    return result;
  };
};

const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
  patchHistoryMethod('pushState', 'pushstate');
  patchHistoryMethod('replaceState', 'replacestate');
}

const usePath = () => {
  if (!isBrowser) return undefined;
  
  const initialPath = window.location.pathname;
  const [path, setPath] = useState(initialPath)
  useEffect(()=>{
    const onChange = () => {
      setPath(window.location.pathname)
    }
    window.addEventListener('popstate', onChange);
    window.addEventListener('pushstate', onChange);
    window.addEventListener('replacestate', onChange);
    return () => {
      window.removeEventListener('popstate', onChange);
      window.removeEventListener('pushstate', onChange);
      window.removeEventListener('replacestate', onChange);
    }
  }, [])

  return path
}

export default usePath;