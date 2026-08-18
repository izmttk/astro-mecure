import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { type MutableRefObject, type PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

import {
  createOpticalDustGeometry,
  createOpticalDustMaterial,
  createOpticalFieldMaterial,
} from './createOpticalFieldMaterials';
import { createRaytracedGlassMaterial } from './createRaytracedGlassMaterial';
import styles from './PrismaticGlassCubeCanvas.module.css';

type SceneState = 'loading' | 'ready' | 'failed';

interface PointerState {
  x: number;
  y: number;
  inside: number;
}

interface SceneProps {
  compact: boolean;
  pointer: MutableRefObject<PointerState>;
  reducedMotion: boolean;
}

interface GeneratedCube {
  geometry: RoundedBoxGeometry;
  halfExtents: THREE.Vector3;
  radius: number;
  rotation: THREE.Euler;
}

function useGeneratedCube(): GeneratedCube {
  return useMemo(() => {
    const size = 2;
    const halfExtents = new THREE.Vector3(size * 0.5, size * 0.5, size * 0.5);
    const radius = size * 0.038;
    const geometry = new RoundedBoxGeometry(size, size, size, 3, radius);
    geometry.center();
    geometry.computeVertexNormals();

    return {
      geometry,
      halfExtents,
      radius,
      rotation: new THREE.Euler(0, Math.PI / 4, Math.PI / 4, 'XYZ'),
    };
  }, []);
}

function createScratchTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create the glass scratch texture.');

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.lineCap = 'round';
  context.strokeStyle = 'rgb(255 255 255 / 70%)';

  const strokes = [
    [116, 210, 344, 188, 0.8],
    [640, 154, 858, 232, 0.62],
    [208, 472, 385, 544, 0.46],
    [552, 410, 812, 386, 0.68],
    [712, 690, 902, 744, 0.5],
    [142, 786, 330, 720, 0.58],
  ] as const;

  for (const [startX, startY, endX, endY, width] of strokes) {
    context.lineWidth = width;
    context.beginPath();
    context.moveTo(startX, startY);
    context.quadraticCurveTo(
      (startX + endX) * 0.5 + 9,
      (startY + endY) * 0.5 - 5,
      endX,
      endY,
    );
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function GlassCube({ compact, pointer, reducedMotion }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const { geometry, halfExtents, radius, rotation } = useGeneratedCube();
  const autoYaw = useRef(0);
  const frozenYaw = useRef(rotation.y);
  const wasHovered = useRef(false);
  const glass = useMemo(
    () => createRaytracedGlassMaterial(halfExtents, radius, compact),
    [compact, halfExtents, radius],
  );
  const scratchTexture = useMemo(() => createScratchTexture(), []);
  const worldToLocal = useMemo(() => new THREE.Matrix4(), []);

  useEffect(() => () => {
    geometry.dispose();
    glass.dispose();
    scratchTexture.dispose();
  }, [geometry, glass, scratchTexture]);

  useFrame((_, delta) => {
    if (!group.current) return;

    const hovered = pointer.current.inside > 0.5;

    if (hovered && !wasHovered.current) {
      // Freeze the exact visible pose instead of recomputing it from elapsed
      // time. Pointer parallax is then applied relative to that pose.
      frozenYaw.current = group.current.rotation.y;
    } else if (!hovered && wasHovered.current) {
      // Resume automatic motion from the interacted pose, avoiding a snap back
      // to either the authored transform or the pre-hover timeline.
      autoYaw.current = group.current.rotation.y - rotation.y;
    }

    if (!hovered && !reducedMotion) autoYaw.current += delta * 0.042;

    const hover = hovered ? 1 : 0;
    const baseYaw = hovered ? frozenYaw.current : rotation.y + autoYaw.current;
    const targetX = rotation.x - pointer.current.y * 0.17 * hover;
    const targetY = baseYaw + pointer.current.x * 0.28 * hover;
    const targetZ = rotation.z + pointer.current.x * 0.022 * hover;

    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 4.7, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 4.2, delta);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, targetZ, 4.5, delta);
    group.current.updateMatrixWorld();

    glass.uniforms.uModelMatrix.value.copy(group.current.matrixWorld);
    glass.uniforms.uNormalMatrix.value.getNormalMatrix(group.current.matrixWorld);
    worldToLocal.copy(group.current.matrixWorld).invert();
    glass.uniforms.uCameraLocal.value.copy(camera.position).applyMatrix4(worldToLocal);
    wasHovered.current = hovered;
  });

  return (
    <group
      ref={group}
      rotation={[rotation.x, rotation.y, rotation.z]}
      scale={compact ? 0.72 : 0.90}
    >
      <mesh geometry={geometry}>
        <primitive object={glass.material} attach="material" />
      </mesh>

      <mesh geometry={geometry} scale={1.0016} renderOrder={8}>
        <meshBasicMaterial
          alphaMap={scratchTexture}
          blending={THREE.AdditiveBlending}
          color="#eef7ff"
          depthWrite={false}
          opacity={compact ? 0.035 : 0.055}
          polygonOffset
          polygonOffsetFactor={-1}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  );
}

function OpticalField({ compact, pointer, reducedMotion }: SceneProps) {
  const { gl, size } = useThree();
  const planeGeometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
  const dustGeometry = useMemo(() => createOpticalDustGeometry(compact), [compact]);
  const field = useMemo(() => createOpticalFieldMaterial(compact), [compact]);
  const dust = useMemo(() => createOpticalDustMaterial(), []);
  const smoothPointer = useRef(new THREE.Vector2());
  const smoothHover = useRef(0);

  useEffect(() => () => {
    planeGeometry.dispose();
    dustGeometry.dispose();
    field.material.dispose();
    dust.material.dispose();
  }, [dust, dustGeometry, field, planeGeometry]);

  useFrame(({ clock }, delta) => {
    const targetX = reducedMotion ? 0 : pointer.current.x;
    const targetY = reducedMotion ? 0 : pointer.current.y;
    const targetHover = reducedMotion ? 0 : pointer.current.inside;

    smoothPointer.current.x = THREE.MathUtils.damp(
      smoothPointer.current.x,
      targetX,
      5.2,
      delta,
    );
    smoothPointer.current.y = THREE.MathUtils.damp(
      smoothPointer.current.y,
      targetY,
      5.2,
      delta,
    );
    smoothHover.current = THREE.MathUtils.damp(smoothHover.current, targetHover, 5.8, delta);

    const time = reducedMotion ? 0 : clock.elapsedTime;
    const aspect = size.width / Math.max(size.height, 1);
    const pixelRatio = gl.getPixelRatio();

    field.uniforms.uTime.value = time;
    field.uniforms.uHover.value = smoothHover.current;
    field.uniforms.uAspect.value = aspect;
    field.uniforms.uPointer.value.copy(smoothPointer.current);

    dust.uniforms.uTime.value = time;
    dust.uniforms.uHover.value = smoothHover.current;
    dust.uniforms.uAspect.value = aspect;
    dust.uniforms.uPixelRatio.value = pixelRatio;
    dust.uniforms.uPointer.value.copy(smoothPointer.current);
  });

  return (
    <>
      <mesh frustumCulled={false} renderOrder={-100} geometry={planeGeometry}>
        <primitive object={field.material} attach="material" />
      </mesh>
      <points frustumCulled={false} renderOrder={-90} geometry={dustGeometry}>
        <primitive object={dust.material} attach="material" />
      </points>
    </>
  );
}

function PrismaticScene(props: SceneProps) {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <OpticalField {...props} />
      <GlassCube {...props} />
    </>
  );
}

export default function PrismaticGlassCubeCanvas() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<PointerState>({ x: 0, y: 0, inside: 0 });
  const [state, setState] = useState<SceneState>('loading');
  const [compact, setCompact] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const forcedColors = window.matchMedia('(forced-colors: active)');
    const compactQuery = window.matchMedia('(max-width: 44rem)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMedia = () => {
      setCompact(compactQuery.matches);
      setReducedMotion(motionQuery.matches);
      if (forcedColors.matches) setState('failed');
    };
    syncMedia();

    const observer = new IntersectionObserver(entries => {
      setVisible(entries[0]?.isIntersecting ?? true);
    }, { rootMargin: '140px' });
    observer.observe(root);

    compactQuery.addEventListener('change', syncMedia);
    motionQuery.addEventListener('change', syncMedia);
    forcedColors.addEventListener('change', syncMedia);

    return () => {
      observer.disconnect();
      compactQuery.removeEventListener('change', syncMedia);
      motionQuery.removeEventListener('change', syncMedia);
      forcedColors.removeEventListener('change', syncMedia);
    };
  }, []);

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
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
    pointer.current.x = 0;
    pointer.current.y = 0;
    pointer.current.inside = 0;
  };

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${state === 'ready' ? styles.ready : ''} ${state === 'failed' ? styles.failed : ''}`}
      aria-hidden="true"
      onPointerEnter={onPointerMove}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {state !== 'failed' && (
        <Canvas
          className={styles.canvas}
          camera={{ fov: compact ? 32 : 27, near: 0.1, far: 40, position: [0, 0.05, 8.6] }}
          dpr={compact ? [1.2, 1.7] : [1.45, 2.1]}
          frameloop={visible && !reducedMotion ? 'always' : 'demand'}
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
            setState('ready');
          }}
        >
          <PrismaticScene compact={compact} pointer={pointer} reducedMotion={reducedMotion} />
        </Canvas>
      )}
    </div>
  );
}
