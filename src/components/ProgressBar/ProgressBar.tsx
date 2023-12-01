import ProgressBarComponent, { type ProgressBarRef } from './ProgressBarComponent';
import { useEffect, useRef } from 'react';
import NoSSR from '../NoSSR';

export default function ProgressBar() {
  const ref = useRef<ProgressBarRef>(null);


  useEffect(() => {
    let id: NodeJS.Timeout | null = null;
    function start() {
      ref.current?.reset();
      if (id) {
        clearInterval(id);
      }
      id = setInterval(() => {
        if (ref.current && ref.current?.get() < 90) {
          ref.current?.add(10);
        }
      }, 500)
    }
    function finish() {
      if (id) {
        clearInterval(id);
      }
      id = null;
      ref.current?.complete();
    }

    document.addEventListener('astro:before-preparation', start);
    document.addEventListener('astro:after-preparation', finish);
    return () => {
      document.removeEventListener('astro:before-preparation', start);
      document.removeEventListener('astro:after-preparation', finish);
      if (id) {
        clearInterval(id);
      }
    }
  }, [])

  return (
    <NoSSR>
      <ProgressBarComponent ref={ref} />
    </NoSSR>
  );
}
