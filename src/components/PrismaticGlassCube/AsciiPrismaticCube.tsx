import { AsciiRenderer, Outlines } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

import {
  OpticalField,
  type PointerState,
} from './PrismaticCubeScene';
import styles from './PrismaticGlassCubeCanvas.module.css';

interface AsciiPrismaticCubeProps {
  constrained?: boolean;
}

const ASCII_CHARACTERS = ' .:-+#';

function DemandFrameDriver({ active, frameRate }: { active: boolean; frameRate: number }) {
  const { invalidate } = useThree();

  useEffect(() => {
    invalidate();
    if (!active) return;

    let timeout: number | undefined;
    const tick = () => {
      invalidate();
      timeout = window.setTimeout(tick, 1_000 / frameRate);
    };
    timeout = window.setTimeout(tick, 1_000 / frameRate);

    return () => {
      if (timeout !== undefined) window.clearTimeout(timeout);
    };
  }, [active, frameRate, invalidate]);

  return null;
}

function AsciiCubeMotion({
  children,
  compact,
  motionEnabled,
  pointer,
}: {
  children: ReactNode;
  compact: boolean;
  motionEnabled: boolean;
  pointer: React.MutableRefObject<PointerState>;
}) {
  const group = useRef<THREE.Group>(null);
  const baseRotation = useMemo(
    () => new THREE.Euler(0, Math.PI / 4, Math.PI / 4, 'XYZ'),
    [],
  );
  const autoYaw = useRef(0);
  const frozenYaw = useRef(baseRotation.y);
  const wasHovered = useRef(false);

  useFrame((_, delta) => {
    if (!group.current) return;

    const hovered = motionEnabled && pointer.current.inside > 0.5;
    if (hovered && !wasHovered.current) {
      frozenYaw.current = group.current.rotation.y;
    } else if (!hovered && wasHovered.current) {
      autoYaw.current = group.current.rotation.y - baseRotation.y;
    }

    if (!hovered && motionEnabled) autoYaw.current += delta * 0.042;

    const hover = hovered ? 1 : 0;
    const targetX = baseRotation.x - pointer.current.y * 0.17 * hover;
    const targetY = (hovered ? frozenYaw.current : baseRotation.y + autoYaw.current)
      + pointer.current.x * 0.28 * hover;
    const targetZ = baseRotation.z + pointer.current.x * 0.022 * hover;

    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 4.7, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 4.2, delta);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, targetZ, 4.5, delta);
    wasHovered.current = hovered;
  });

  return (
    <group
      ref={group}
      rotation={[baseRotation.x, baseRotation.y, baseRotation.z]}
      scale={compact ? 0.72 : 0.90}
    >
      {children}
    </group>
  );
}

function AsciiCube({
  compact,
  motionEnabled,
  pointer,
}: {
  compact: boolean;
  motionEnabled: boolean;
  pointer: React.MutableRefObject<PointerState>;
}) {
  const geometry = useMemo(() => {
    const roundedCube = new RoundedBoxGeometry(2, 2, 2, 4, 0.115);
    roundedCube.center();
    roundedCube.computeVertexNormals();
    return roundedCube;
  }, []);

  useEffect(() => () => {
    geometry.dispose();
  }, [geometry]);

  return (
    <AsciiCubeMotion compact={compact} motionEnabled={motionEnabled} pointer={pointer}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#b8c5d6"
          emissive="#020307"
          emissiveIntensity={0.035}
          metalness={0.04}
          roughness={0.78}
        />
        <Outlines
          angle={0}
          color="#ffffff"
          screenspace={false}
          thickness={4.4}
          toneMapped={false}
        />
      </mesh>
    </AsciiCubeMotion>
  );
}

function AsciiKeyLight() {
  const light = useRef<THREE.SpotLight>(null);
  const scene = useThree(state => state.scene);
  const target = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    scene.add(target);
    if (light.current) light.current.target = target;
    return () => {
      scene.remove(target);
    };
  }, [scene, target]);

  return (
    <spotLight
      ref={light}
      angle={0.76}
      color="#f4f8ff"
      decay={1.45}
      distance={18}
      intensity={78}
      penumbra={0.86}
      position={[-4.8, 5.4, 3.1]}
    />
  );
}

function OpticalBackgroundScene({
  compact,
  motionEnabled,
  pointer,
}: {
  compact: boolean;
  motionEnabled: boolean;
  pointer: React.MutableRefObject<PointerState>;
}) {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <OpticalField compact={compact} motionEnabled={motionEnabled} pointer={pointer} />
    </>
  );
}

function AsciiCubeScene({
  compact,
  constrained,
  motionEnabled,
  pointer,
}: {
  compact: boolean;
  constrained: boolean;
  motionEnabled: boolean;
  pointer: React.MutableRefObject<PointerState>;
}) {
  return (
    <>
      <color attach="background" args={['#000000']} />

      <AsciiKeyLight />
      <AsciiCube compact={compact} motionEnabled={motionEnabled} pointer={pointer} />

      <AsciiRenderer
        bgColor="transparent"
        characters={ASCII_CHARACTERS}
        color={false}
        fgColor="#aab5c4"
        invert
        resolution={constrained ? 0.205 : compact ? 0.23 : 0.25}
      />
    </>
  );
}

export default function AsciiPrismaticCube({
  constrained = false,
}: AsciiPrismaticCubeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<PointerState>({ x: 0, y: 0, inside: 0 });
  const [asciiReady, setAsciiReady] = useState(false);
  const [backgroundReady, setBackgroundReady] = useState(false);
  const [compact, setCompact] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(true);
  const motionEnabled = !reducedMotion;
  const continuousRendering = visible && documentVisible && motionEnabled;
  const frameRate = constrained ? 10 : 16;
  const ready = asciiReady && backgroundReady;

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
      data-render-mode="ascii"
      data-render-quality={constrained ? 'constrained' : 'standard'}
      aria-hidden="true"
      onPointerEnter={motionEnabled ? onPointerMove : undefined}
      onPointerMove={motionEnabled ? onPointerMove : undefined}
      onPointerLeave={onPointerLeave}
    >
      <Canvas
        className={`${styles.canvas} ${styles.backgroundCanvas}`}
        camera={{ fov: 30, near: 0.1, far: 10, position: [0, 0, 5] }}
        dpr={constrained ? 1 : [1, 1.25]}
        frameloop="demand"
        gl={{
          alpha: false,
          antialias: false,
          powerPreference: constrained ? 'default' : 'high-performance',
          stencil: false,
        }}
        style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 1);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.76;
          setBackgroundReady(true);
        }}
      >
        <OpticalBackgroundScene
          compact={compact}
          motionEnabled={motionEnabled}
          pointer={pointer}
        />
        <DemandFrameDriver active={continuousRendering} frameRate={frameRate} />
      </Canvas>

      <Canvas
        className={`${styles.canvas} ${styles.asciiCanvas}`}
        camera={{ fov: compact ? 32 : 27, near: 0.1, far: 40, position: [0, 0.05, 8.6] }}
        dpr={1}
        frameloop="demand"
        gl={{
          alpha: false,
          antialias: false,
          powerPreference: constrained ? 'default' : 'high-performance',
          stencil: false,
        }}
        style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 1);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.82;
          setAsciiReady(true);
        }}
      >
        <AsciiCubeScene
          compact={compact}
          constrained={constrained}
          motionEnabled={motionEnabled}
          pointer={pointer}
        />
        <DemandFrameDriver active={continuousRendering} frameRate={frameRate} />
      </Canvas>
    </div>
  );
}
