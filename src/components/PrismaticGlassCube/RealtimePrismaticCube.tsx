import { Canvas } from '@react-three/fiber';
import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';

import {
  type PointerState,
  PrismaticScene,
  type RenderSettings,
} from './PrismaticCubeScene';
import PrismaticRuntimePerformance from './PrismaticRuntimePerformance';
import styles from './PrismaticGlassCubeCanvas.module.css';

export default function RealtimePrismaticCube() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<PointerState>({ x: 0, y: 0, inside: 0 });
  const renderSettings = useRef<RenderSettings>({ sampleCount: 24 });
  const qualityFactor = useRef(1);
  const [compact, setCompact] = useState(
    () => window.matchMedia('(max-width: 44rem)').matches,
  );
  const [documentVisible, setDocumentVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(true);
  const motionEnabled = !reducedMotion;
  const continuousRendering = visible && documentVisible && motionEnabled;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const compactQuery = window.matchMedia('(max-width: 44rem)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncDocumentVisibility = () => setDocumentVisible(!document.hidden);
    const syncMedia = () => {
      setCompact(compactQuery.matches);
      setReducedMotion(motionQuery.matches);
    };
    syncMedia();
    syncDocumentVisibility();

    const observer = new IntersectionObserver(entries => {
      setVisible(entries[0]?.isIntersecting ?? true);
    }, { rootMargin: '140px' });
    observer.observe(root);

    document.addEventListener('visibilitychange', syncDocumentVisibility);
    compactQuery.addEventListener('change', syncMedia);
    motionQuery.addEventListener('change', syncMedia);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncDocumentVisibility);
      compactQuery.removeEventListener('change', syncMedia);
      motionQuery.removeEventListener('change', syncMedia);
    };
  }, []);

  const applyQualityFactor = useCallback((factor: number) => {
    qualityFactor.current = factor;
    const minimumSamples = compact ? 8 : 14;
    const maximumSamples = compact ? 12 : 24;
    renderSettings.current.sampleCount = Math.round(
      THREE.MathUtils.lerp(minimumSamples, maximumSamples, factor),
    );
  }, [compact]);

  useEffect(() => {
    applyQualityFactor(qualityFactor.current);
  }, [applyQualityFactor]);

  useEffect(() => {
    if (motionEnabled) return;
    pointer.current = { x: 0, y: 0, inside: 0 };
  }, [motionEnabled]);

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!motionEnabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointer.current.x = THREE.MathUtils.clamp(
      (event.clientX - rect.left) / rect.width * 2 - 1,
      -1,
      1,
    );
    pointer.current.y = THREE.MathUtils.clamp(
      -((event.clientY - rect.top) / rect.height * 2 - 1),
      -1,
      1,
    );
    pointer.current.inside = 1;
  };

  const onPointerLeave = () => {
    pointer.current = { x: 0, y: 0, inside: 0 };
  };

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${motionEnabled ? styles.interactive : ''} ${ready ? styles.ready : ''}`}
      data-render-mode="raytraced"
      aria-hidden="true"
      onPointerEnter={motionEnabled ? onPointerMove : undefined}
      onPointerMove={motionEnabled ? onPointerMove : undefined}
      onPointerLeave={onPointerLeave}
    >
      <Canvas
        key={compact ? 'compact' : 'desktop'}
        className={styles.canvas}
        camera={{ fov: compact ? 32 : 27, near: 0.1, far: 40, position: [0, 0.05, 8.6] }}
        dpr={compact ? [1.2, 1.7] : [1.45, 2.1]}
        frameloop={continuousRendering ? 'always' : 'demand'}
        gl={{
          alpha: false,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        performance={{
          debounce: 180,
          min: compact ? 0.82 : 0.78,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 1);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.76;
          setReady(true);
        }}
      >
        <PrismaticScene
          compact={compact}
          motionEnabled={motionEnabled}
          pointer={pointer}
          renderSettings={renderSettings}
        />
        <PrismaticRuntimePerformance
          active={continuousRendering}
          initialFactor={qualityFactor.current}
          onQualityChange={applyQualityFactor}
          pointer={pointer}
        />
      </Canvas>
    </div>
  );
}
