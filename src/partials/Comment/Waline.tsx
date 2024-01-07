// @ts-nocheck
// waline's decleration files are incomplete, disable type check temporarily.
import { createRef, useEffect, useImperativeHandle, useRef, forwardRef } from 'react';
import { init } from '@waline/client/full';
import baseStyles from '@waline/client/style?url';

import useStylesheet from '@/hooks/useStylesheet';

import type { WalineInstance, WalineInitOptions } from '@waline/client';
import styles from './Waline.module.css'

export type WalineOptions = Omit<WalineInitOptions, 'el'>;
export type CRefProps = {
  /* update waline instance props */
  update: WalineInstance['update'];
};

const Waline = forwardRef<CRefProps, WalineOptions>(
  (props, ref) => {
    const walineInstanceRef = useRef<WalineInstance | null>(null);
    const containerRef = createRef<HTMLDivElement>();
    
    useStylesheet(baseStyles);
    useEffect(() => {
      walineInstanceRef.current = init({
        ...props,
        dark: 'html.dark',
        el: containerRef.current,
      });

      return () => walineInstanceRef.current?.destroy?.();
    }, []);

    useImperativeHandle(ref, () => ({
      update: props => walineInstanceRef.current?.update?.({ ...props }),
    }));

    return <div ref={containerRef} className={styles.waline}></div>;
  }
)

export default Waline;