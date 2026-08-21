import { useFrame, useThree } from '@react-three/fiber';
import {
  type MutableRefObject,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

import {
  createOpticalDustGeometry,
  createOpticalDustMaterial,
  createOpticalFieldMaterial,
} from './createOpticalFieldMaterials';
import { createRaytracedGlassMaterial } from './createRaytracedGlassMaterial';

export interface PointerState {
  x: number;
  y: number;
  inside: number;
}

export interface RenderSettings {
  sampleCount: number;
}

export interface SceneInteractionProps {
  compact: boolean;
  motionEnabled: boolean;
  pointer: MutableRefObject<PointerState>;
}

export interface PrismaticSceneProps extends SceneInteractionProps {
  renderSettings: MutableRefObject<RenderSettings>;
}

interface GeneratedCube {
  geometry: RoundedBoxGeometry;
  halfExtents: THREE.Vector3;
  radius: number;
}

export function useGeneratedCube(): GeneratedCube {
  return useMemo(() => {
    const size = 2;
    const halfExtents = new THREE.Vector3(size * 0.5, size * 0.5, size * 0.5);
    const radius = size * 0.038;
    const geometry = new RoundedBoxGeometry(size, size, size, 3, radius);
    geometry.center();
    geometry.computeVertexNormals();
    // Every cube renderer uses a single material. Removing the constructor's
    // face groups also lets GPU BVHs use a single root (required by Drei's
    // MeshRefractionMaterial).
    geometry.clearGroups();

    return {
      geometry,
      halfExtents,
      radius,
    };
  }, []);
}

interface AnimatedCubeProps extends SceneInteractionProps {
  children: ReactNode;
  onTransform?: (group: THREE.Group, camera: THREE.Camera) => void;
}

export function AnimatedCube({
  children,
  compact,
  motionEnabled,
  onTransform,
  pointer,
}: AnimatedCubeProps) {
  const group = useRef<THREE.Group>(null);
  const rotation = useMemo(
    () => new THREE.Euler(0, Math.PI / 4, Math.PI / 4, 'XYZ'),
    [],
  );
  const autoYaw = useRef(0);
  const frozenYaw = useRef(rotation.y);
  const wasHovered = useRef(false);

  useFrame(({ camera }, delta) => {
    if (!group.current) return;

    const hovered = motionEnabled && pointer.current.inside > 0.5;

    if (hovered && !wasHovered.current) {
      frozenYaw.current = group.current.rotation.y;
    } else if (!hovered && wasHovered.current) {
      autoYaw.current = group.current.rotation.y - rotation.y;
    }

    if (!hovered && motionEnabled) autoYaw.current += delta * 0.042;

    const hover = hovered ? 1 : 0;
    const baseYaw = hovered ? frozenYaw.current : rotation.y + autoYaw.current;
    const targetX = rotation.x - pointer.current.y * 0.17 * hover;
    const targetY = baseYaw + pointer.current.x * 0.28 * hover;
    const targetZ = rotation.z + pointer.current.x * 0.022 * hover;

    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 4.7, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 4.2, delta);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, targetZ, 4.5, delta);
    group.current.updateMatrixWorld();
    onTransform?.(group.current, camera);
    wasHovered.current = hovered;
  });

  return (
    <group
      ref={group}
      rotation={[rotation.x, rotation.y, rotation.z]}
      scale={compact ? 0.72 : 0.90}
    >
      {children}
    </group>
  );
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

function GlassCube({ compact, motionEnabled, pointer, renderSettings }: PrismaticSceneProps) {
  const { geometry, halfExtents, radius } = useGeneratedCube();
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

  const updateGlassTransform = useCallback((group: THREE.Group, camera: THREE.Camera) => {
    glass.uniforms.uSampleCount.value = renderSettings.current.sampleCount;
    glass.uniforms.uModelMatrix.value.copy(group.matrixWorld);
    glass.uniforms.uNormalMatrix.value.getNormalMatrix(group.matrixWorld);
    worldToLocal.copy(group.matrixWorld).invert();
    glass.uniforms.uCameraLocal.value.copy(camera.position).applyMatrix4(worldToLocal);
  }, [glass, renderSettings, worldToLocal]);

  return (
    <AnimatedCube
      compact={compact}
      motionEnabled={motionEnabled}
      onTransform={updateGlassTransform}
      pointer={pointer}
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
    </AnimatedCube>
  );
}

export function OpticalField({ compact, motionEnabled, pointer }: SceneInteractionProps) {
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
    const targetX = motionEnabled ? pointer.current.x : 0;
    const targetY = motionEnabled ? pointer.current.y : 0;
    const targetHover = motionEnabled ? pointer.current.inside : 0;

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

    const time = motionEnabled ? clock.elapsedTime : 0;
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

export function PrismaticScene(props: PrismaticSceneProps) {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <OpticalField {...props} />
      <GlassCube {...props} />
    </>
  );
}
