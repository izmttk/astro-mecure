import { lazy, Suspense, useCallback, useEffect, useState } from 'react';

import type { DetectedGpuProfile } from './PrismaticGpuTierGate';
import styles from './PrismaticGlassCubeCanvas.module.css';

const AsciiPrismaticCube = lazy(() => import('./AsciiPrismaticCube'));
const DreiRefractionCube = lazy(() => import('./DreiRefractionCube'));
const PrismaticGpuTierGate = lazy(() => import('./PrismaticGpuTierGate'));
const RealtimePrismaticCube = lazy(() => import('./RealtimePrismaticCube'));

type RenderMode =
  | 'checking'
  | 'detecting-gpu'
  | 'raytraced'
  | 'drei-refraction'
  | 'ascii'
  | 'fallback';

export type PrismaticCubeRenderer = 'adaptive' | 'drei-refraction';

interface DebugRendererInfo {
  UNMASKED_RENDERER_WEBGL: number;
}

function isSoftwareRenderer(context: WebGL2RenderingContext) {
  const debugInfo = context.getExtension('WEBGL_debug_renderer_info') as
    | DebugRendererInfo
    | null;
  if (!debugInfo) return false;

  const renderer = String(context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
  return /swiftshader|llvmpipe|software|microsoft basic render/i.test(renderer);
}

export default function PrismaticGlassCubeCanvas({
  renderer = 'adaptive',
}: {
  renderer?: PrismaticCubeRenderer;
}) {
  const [mode, setMode] = useState<RenderMode>('checking');
  const [constrained, setConstrained] = useState(false);

  useEffect(() => {
    const forcedColors = window.matchMedia('(forced-colors: active)');
    const detectCapability = () => {
      if (forcedColors.matches) {
        setMode('fallback');
        return;
      }

      const preferredCanvas = document.createElement('canvas');
      const preferredContext = preferredCanvas.getContext('webgl2', {
        failIfMajorPerformanceCaveat: true,
        powerPreference: 'high-performance',
      });

      if (preferredContext) {
        const software = isSoftwareRenderer(preferredContext);
        preferredContext.getExtension('WEBGL_lose_context')?.loseContext();
        if (software) {
          setConstrained(true);
          setMode('ascii');
          return;
        }

        setConstrained(false);
        setMode(renderer === 'drei-refraction' ? 'drei-refraction' : 'detecting-gpu');
        return;
      }

      // A browser may reject an expensive context while still offering enough
      // WebGL2 for the lightweight ASCII scene.
      const compatibilityCanvas = document.createElement('canvas');
      const compatibilityContext = compatibilityCanvas.getContext('webgl2', {
        powerPreference: 'default',
      });

      if (!compatibilityContext) {
        setMode('fallback');
        return;
      }

      compatibilityContext.getExtension('WEBGL_lose_context')?.loseContext();
      setConstrained(true);
      setMode(renderer === 'drei-refraction' ? 'drei-refraction' : 'ascii');
    };

    detectCapability();
    forcedColors.addEventListener('change', detectCapability);
    return () => forcedColors.removeEventListener('change', detectCapability);
  }, [renderer]);

  const handleGpuTier = useCallback((profile: DetectedGpuProfile) => {
    setConstrained(profile.tier <= 1);
    setMode(profile.tier >= 3 ? 'raytraced' : 'ascii');
  }, []);

  return (
    <>
      {mode === 'ascii' && (
        <Suspense
          fallback={(
            <div
              className={styles.root}
              data-render-mode="loading-ascii"
              aria-hidden="true"
            />
          )}
        >
          <AsciiPrismaticCube constrained={constrained} />
        </Suspense>
      )}
      {mode === 'drei-refraction' && (
        <Suspense
          fallback={(
            <div
              className={styles.root}
              data-render-mode="loading-drei-refraction"
              aria-hidden="true"
            />
          )}
        >
          <DreiRefractionCube />
        </Suspense>
      )}
      {mode === 'detecting-gpu' && (
        <Suspense fallback={null}>
          <PrismaticGpuTierGate onComplete={handleGpuTier} />
        </Suspense>
      )}
      {mode === 'raytraced' && (
        <Suspense
          fallback={(
            <div
              className={styles.root}
              data-render-mode="loading-raytraced"
              aria-hidden="true"
            />
          )}
        >
          <RealtimePrismaticCube />
        </Suspense>
      )}
      {(mode === 'checking' || mode === 'detecting-gpu' || mode === 'fallback') && (
        <div
          className={styles.root}
          data-render-mode={mode}
          aria-hidden="true"
        />
      )}
    </>
  );
}
