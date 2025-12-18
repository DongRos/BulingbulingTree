import React, { useMemo } from 'react';
import * as THREE from 'three';
import { CONFIG } from '../constants';
import { useFrame } from '@react-three/fiber';

interface GarlandProps {
    visible: boolean;
}

export default function Garland({ visible }: GarlandProps) {
  const { treeHeight, treeRadius, spiralLoops } = CONFIG;

  const curve = useMemo(() => {
    const points = [];
    const count = 100;
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const y = (t - 0.5) * treeHeight;
      const radius = (1 - t) * (treeRadius + 0.5); // Slightly outside tree
      const angle = t * Math.PI * 2 * spiralLoops;
      
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      ));
    }
    return new THREE.CatmullRomCurve3(points);
  }, [treeHeight, treeRadius, spiralLoops]);

  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if(materialRef.current) {
        // Pulse effect
        materialRef.current.emissiveIntensity = 2 + Math.sin(state.clock.elapsedTime * 2) * 1;
    }
  })

  // Fade out effect would require transparency management, simplified here to scale/visible toggle for performance
  if (!visible) return null;

  return (
    <mesh>
      <tubeGeometry args={[curve, 128, 0.08, 8, false]} />
      <meshStandardMaterial
        ref={materialRef}
        color={CONFIG.colors.garland}
        emissive={CONFIG.colors.garland}
        emissiveIntensity={2}
        roughness={0.2}
        metalness={0.8}
        toneMapped={false}
      />
    </mesh>
  );
}

import { useRef } from 'react';
