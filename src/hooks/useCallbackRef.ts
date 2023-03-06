import { useEffect, useMemo, useRef } from 'react';

export default function useCallbackRef<T extends (...args: any[]) => any>(callback: T | undefined): T {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });
  return useMemo(() => ((...args) => callbackRef.current?.(...args)) as T, []);
}
