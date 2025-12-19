import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CONFIG } from '../constants';
import { useFrame } from '@react-three/fiber';

interface GarlandProps {
    visible: boolean;
    // 删除 text prop
}

export default function Garland({ visible }: GarlandProps) {
  const { treeHeight, treeRadius, spiralLoops } = CONFIG;

  // 删除 texture useMemo

  // 恢复为单条曲线逻辑 (灯带)
  const curve = useMemo(() => {
    const points = [];
    const count = 100;
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const y = (t - 0.5) * treeHeight;
      const radius = (1 - t) * (treeRadius + 0.5); 
      
      const angle = t * Math.PI * 2 * spiralLoops;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
    }
    return new THREE.CatmullRomCurve3(points);
  }, [treeHeight, treeRadius, spiralLoops]);

  // 删除 ribbonGeometry useMemo

  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  // 删除 ribbonMatRef

  useFrame((state) => {
    // 保留呼吸灯带逻辑
    if(materialRef.current) {
        materialRef.current.emissiveIntensity = 2 + Math.sin(state.clock.elapsedTime * 3) * 1.5;
    }
    // 删除飘带流动逻辑
  });

  if (!visible) return null;

  return (
    // 直接返回 Mesh，不再需要 Group 包裹，也不需要飘带 Mesh
    <mesh>
      <tubeGeometry args={[curve, 128, 0.04, 8, false]} />
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
