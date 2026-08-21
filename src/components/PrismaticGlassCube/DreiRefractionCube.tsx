import { MeshRefractionMaterial } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import {
  AnimatedCube,
  OpticalField,
  type PointerState,
  useGeneratedCube,
} from './PrismaticCubeScene';
import PrismaticRuntimePerformance from './PrismaticRuntimePerformance';
import styles from './PrismaticGlassCubeCanvas.module.css';

function paintSoftCard(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  color: string,
  opacity: number,
) {
  context.save();
  context.translate(x, y);
  context.scale(radiusX, radiusY);
  const gradient = context.createRadialGradient(0, 0, 0, 0, 0, 1);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.42, color);
  gradient.addColorStop(1, 'transparent');
  context.globalAlpha = opacity;
  context.fillStyle = gradient;
  context.fillRect(-1, -1, 2, 2);
  context.restore();
}

function createStudioEnvironment() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create the Drei refraction environment.');

  context.fillStyle = '#030407';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalCompositeOperation = 'lighter';

  // Broad white cards create the neutral reflections. The coloured cards are
  // deliberately separated in the environment: RGB only splits after the
  // material traces each wavelength with a different IOR.
  paintSoftCard(context, 520, 88, 310, 42, '#ffffff', 1);
  paintSoftCard(context, 500, 430, 260, 46, '#f4f8ff', 0.82);
  paintSoftCard(context, 84, 255, 48, 205, '#f8fbff', 0.88);
  paintSoftCard(context, 940, 250, 54, 190, '#fff8f3', 0.78);
  paintSoftCard(context, 294, 286, 130, 92, '#eef5ff', 0.30);
  paintSoftCard(context, 748, 318, 145, 104, '#fff4ee', 0.26);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

function DreiGlassCube({
  bounces,
  compact,
  motionEnabled,
  pointer,
}: {
  bounces: number;
  compact: boolean;
  motionEnabled: boolean;
  pointer: React.MutableRefObject<PointerState>;
}) {
  const { geometry } = useGeneratedCube();
  const environment = useMemo(() => createStudioEnvironment(), []);

  useEffect(() => () => {
    environment.dispose();
    geometry.dispose();
  }, [environment, geometry]);

  return (
    <AnimatedCube compact={compact} motionEnabled={motionEnabled} pointer={pointer}>
      <mesh geometry={geometry}>
        <MeshRefractionMaterial
          aberrationStrength={0.0345}
          bounces={bounces}
          color="#ffffff"
          envMap={environment}
          fastChroma={false}
          fresnel={0}
          ior={1.45}
          opacity={1}
          toneMapped
        />
      </mesh>
    </AnimatedCube>
  );
}

function DreiRefractionScene({
  bounces,
  compact,
  motionEnabled,
  pointer,
}: {
  bounces: number;
  compact: boolean;
  motionEnabled: boolean;
  pointer: React.MutableRefObject<PointerState>;
}) {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <OpticalField compact={compact} motionEnabled={motionEnabled} pointer={pointer} />
      <DreiGlassCube
        bounces={bounces}
        compact={compact}
        motionEnabled={motionEnabled}
        pointer={pointer}
      />
    </>
  );
}

export default function DreiRefractionCube() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<PointerState>({ x: 0, y: 0, inside: 0 });
  const [compact, setCompact] = useState(
    () => window.matchMedia('(max-width: 44rem)').matches,
  );
  const [documentVisible, setDocumentVisible] = useState(true);
  const [qualityFactor, setQualityFactor] = useState(1);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(true);
  const motionEnabled = !reducedMotion;
  const continuousRendering = visible && documentVisible && motionEnabled;
  const minimumBounces = compact ? 3 : 4;
  const maximumBounces = compact ? 5 : 7;
  const bounces = Math.round(
    THREE.MathUtils.lerp(minimumBounces, maximumBounces, qualityFactor),
  );

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
      data-render-mode="drei-refraction"
      aria-hidden="true"
      onPointerEnter={motionEnabled ? onPointerMove : undefined}
      onPointerMove={motionEnabled ? onPointerMove : undefined}
      onPointerLeave={onPointerLeave}
    >
      <Canvas
        key={compact ? 'compact' : 'desktop'}
        className={styles.canvas}
        camera={{ fov: compact ? 32 : 27, near: 0.1, far: 40, position: [0, 0.05, 8.6] }}
        dpr={compact ? [1.1, 1.45] : [1.25, 1.75]}
        frameloop={continuousRendering ? 'always' : 'demand'}
        gl={{
          alpha: false,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        performance={{
          debounce: 180,
          min: compact ? 0.84 : 0.80,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 1);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.84;
          setReady(true);
        }}
      >
        <DreiRefractionScene
          bounces={bounces}
          compact={compact}
          motionEnabled={motionEnabled}
          pointer={pointer}
        />
        <PrismaticRuntimePerformance
          active={continuousRendering}
          initialFactor={qualityFactor}
          onQualityChange={setQualityFactor}
          pointer={pointer}
        />
      </Canvas>
    </div>
  );
}
