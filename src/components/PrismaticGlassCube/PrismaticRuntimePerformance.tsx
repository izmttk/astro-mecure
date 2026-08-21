import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { type MutableRefObject, useCallback, useRef } from 'react';

import type { PointerState } from './PrismaticCubeScene';

const POINTER_REGRESSION_INTERVAL_SECONDS = 0.08;
const POINTER_MOVEMENT_EPSILON = 0.0018;

function performanceBounds(refreshRate: number): [number, number] {
  return refreshRate > 90 ? [48, 72] : [38, 52];
}

export default function PrismaticRuntimePerformance({
  active,
  initialFactor = 1,
  onQualityChange,
  pointer,
}: {
  active: boolean;
  initialFactor?: number;
  onQualityChange: (factor: number) => void;
  pointer: MutableRefObject<PointerState>;
}) {
  const regress = useThree(state => state.performance.regress);
  const factor = useRef(initialFactor);
  const previousPointer = useRef({ x: 0, y: 0 });
  const lastRegressionAt = useRef(-Infinity);

  useFrame(({ clock }) => {
    const current = pointer.current;
    const movement = Math.abs(current.x - previousPointer.current.x)
      + Math.abs(current.y - previousPointer.current.y);

    if (
      active
      && current.inside > 0.5
      && movement > POINTER_MOVEMENT_EPSILON
      && clock.elapsedTime - lastRegressionAt.current >= POINTER_REGRESSION_INTERVAL_SECONDS
    ) {
      regress();
      lastRegressionAt.current = clock.elapsedTime;
    }

    previousPointer.current.x = current.x;
    previousPointer.current.y = current.y;
  });

  const handleChange = useCallback((api: { factor: number }) => {
    factor.current = api.factor;
    onQualityChange(api.factor);
  }, [onQualityChange]);

  return (
    <>
      <AdaptiveDpr />
      {active && (
        <PerformanceMonitor
          bounds={performanceBounds}
          factor={factor.current}
          iterations={6}
          ms={300}
          onChange={handleChange}
          step={0.2}
          threshold={0.67}
        />
      )}
    </>
  );
}
