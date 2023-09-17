// @ts-nocheck
// waline's decleration files are incomplete, disable type check temporarily.
import { createRef, useEffect, useRef } from 'react';
import { init } from '@waline/client';
import '@waline/client/dist/waline.css';
import '@waline/client/waline-meta.css';

import type { WalineInstance, WalineInitOptions } from '@waline/client';
import styles from './Waline.module.css'

export type WalineOptions = Omit<WalineInitOptions, 'el'>;

const Waline = (props: WalineOptions) => {
  const walineInstanceRef = useRef<WalineInstance | null>(null);
  const containerRef = createRef<HTMLDivElement>();

  useEffect(() => {
    walineInstanceRef.current = init({
      ...props,
      dark: 'html.dark',
      el: containerRef.current,
    });

    return () => walineInstanceRef.current?.destroy();
  }, []);

  useEffect(() => {
    walineInstanceRef.current?.update({
      ...props,
    });
  }, [props]);

  return <div ref={containerRef} className={styles.waline}></div>;
};

export default Waline;