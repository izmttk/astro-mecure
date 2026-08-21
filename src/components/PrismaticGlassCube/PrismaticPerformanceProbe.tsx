import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import {
  type PointerState,
  PrismaticScene,
  type RenderSettings,
} from './PrismaticCubeScene';
import styles from './PrismaticGlassCubeCanvas.module.css';

const PROFILE_SAMPLE_SCHEDULE = [1, 1, 2, 1] as const;
const PROFILE_FRAME_DELAY_MS = 180;
const REALTIME_DESKTOP_BUDGET_MS = 24;
const REALTIME_COMPACT_BUDGET_MS = 28;
const REALTIME_SAFETY_FACTOR = 1.15;

export interface PrismaticPerformanceProfile {
  estimatedRealtimeFrameMs: number;
  recommendedMode: 'raytraced' | 'ascii';
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

function PerformanceController({
  compact,
  onComplete,
  renderSettings,
}: {
  compact: boolean;
  onComplete: (profile: PrismaticPerformanceProfile) => void;
  renderSettings: React.MutableRefObject<RenderSettings>;
}) {
  const { camera, gl, invalidate, scene } = useThree();
  const measurements = useRef<Array<{ milliseconds: number; samples: number }>>([]);
  const passIndex = useRef(0);
  const reported = useRef(false);
  const timeout = useRef<number>();

  useEffect(() => {
    invalidate();
    return () => {
      if (timeout.current !== undefined) window.clearTimeout(timeout.current);
    };
  }, [invalidate]);

  const scheduleNextFrame = useCallback(() => {
    if (timeout.current !== undefined || reported.current) return;
    timeout.current = window.setTimeout(() => {
      timeout.current = undefined;
      invalidate();
    }, PROFILE_FRAME_DELAY_MS);
  }, [invalidate]);

  useFrame(() => {
    renderSettings.current.sampleCount = PROFILE_SAMPLE_SCHEDULE[passIndex.current] ?? 1;
  }, -100);

  useFrame(() => {
    if (reported.current) return;

    const sampleCount = renderSettings.current.sampleCount;
    const startedAt = performance.now();
    gl.setRenderTarget(null);
    gl.clear(true, true, true);
    gl.render(scene, camera);
    gl.getContext().finish();
    const renderTime = performance.now() - startedAt;

    // The first pass includes shader compilation and is intentionally treated
    // as warm-up. The remaining 1/2-sample passes estimate marginal ray cost.
    if (passIndex.current > 0) {
      measurements.current.push({ milliseconds: renderTime, samples: sampleCount });
    }
    passIndex.current += 1;

    if (passIndex.current < PROFILE_SAMPLE_SCHEDULE.length) {
      scheduleNextFrame();
      return;
    }

    const oneSampleTimes = measurements.current
      .filter(measurement => measurement.samples === 1)
      .map(measurement => measurement.milliseconds);
    const twoSampleTime = measurements.current
      .find(measurement => measurement.samples === 2)?.milliseconds;
    const oneSampleTime = median(oneSampleTimes);
    const measuredMarginal = (twoSampleTime ?? oneSampleTime * 1.65) - oneSampleTime;
    const marginalSampleTime = clamp(
      measuredMarginal,
      oneSampleTime * 0.18,
      oneSampleTime * 1.35,
    );
    const baseFrameTime = Math.max(0, oneSampleTime - marginalSampleTime);
    const realtimeSamples = compact ? 12 : 24;
    const sampledRealtimeFrameMs = baseFrameTime + marginalSampleTime * realtimeSamples;
    const realtimePixelRatio = clamp(
      window.devicePixelRatio || 1,
      compact ? 1.2 : 1.45,
      compact ? 1.7 : 2.1,
    );
    const pixelLoadScale = Math.pow(realtimePixelRatio / gl.getPixelRatio(), 2);
    const estimatedRealtimeFrameMs = sampledRealtimeFrameMs
      * pixelLoadScale
      * REALTIME_SAFETY_FACTOR;
    const realtimeBudget = compact
      ? REALTIME_COMPACT_BUDGET_MS
      : REALTIME_DESKTOP_BUDGET_MS;

    reported.current = true;
    onComplete({
      estimatedRealtimeFrameMs,
      recommendedMode: estimatedRealtimeFrameMs <= realtimeBudget
        ? 'raytraced'
        : 'ascii',
    });
  }, 1);

  return null;
}

export default function PrismaticPerformanceProbe({
  onComplete,
}: {
  onComplete: (profile: PrismaticPerformanceProfile) => void;
}) {
  const pointer = useRef<PointerState>({ x: 0, y: 0, inside: 0 });
  const renderSettings = useRef<RenderSettings>({ sampleCount: 1 });
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const compactQuery = window.matchMedia('(max-width: 44rem)');
    const syncCompact = () => setCompact(compactQuery.matches);
    syncCompact();
    compactQuery.addEventListener('change', syncCompact);
    return () => compactQuery.removeEventListener('change', syncCompact);
  }, []);

  return (
    <div className={styles.probe} aria-hidden="true">
      <Canvas
        camera={{ fov: compact ? 32 : 27, near: 0.1, far: 40, position: [0, 0.05, 8.6] }}
        dpr={compact ? [1, 1.35] : [1.15, 1.65]}
        frameloop="demand"
        gl={{
          alpha: false,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 1);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.76;
        }}
      >
        <PrismaticScene
          compact={compact}
          motionEnabled={false}
          pointer={pointer}
          renderSettings={renderSettings}
        />
        <PerformanceController
          compact={compact}
          onComplete={onComplete}
          renderSettings={renderSettings}
        />
      </Canvas>
    </div>
  );
}
