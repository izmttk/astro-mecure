import { useDetectGPU } from '@react-three/drei';
import { useEffect } from 'react';

export interface DetectedGpuProfile {
  tier: number;
  type: string;
}

export default function PrismaticGpuTierGate({
  onComplete,
}: {
  onComplete: (profile: DetectedGpuProfile) => void;
}) {
  const profile = useDetectGPU({
    failIfMajorPerformanceCaveat: true,
  });

  useEffect(() => {
    onComplete(profile);
  }, [onComplete, profile]);

  return null;
}
