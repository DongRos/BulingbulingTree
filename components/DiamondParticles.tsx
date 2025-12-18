import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CONFIG } from '../constants';

interface DiamondParticlesProps {
  mode: 'WISH' | 'CHAOS';
}

export default function DiamondParticles({ mode }: DiamondParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { particleCount, treeHeight, treeRadius } = CONFIG;

  const { targetPositions, chaosPositions, randomRotations, scales } = useMemo(() => {
    const tPos = new Float32Array(particleCount * 3);
    const cPos = new Float32Array(particleCount * 3);
    const rRot = new Float32Array(particleCount * 3);
    const sc = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const yNorm = Math.random(); 
      const y = (yNorm - 0.5) * treeHeight; 
      const rAtHeight = (1 - yNorm) * treeRadius;
      const theta = Math.random() * Math.PI * 2;
      const r = rAtHeight * Math.sqrt(Math.random()); 
      
      tPos[i * 3] = r * Math.cos(theta);
      tPos[i * 3 + 1] = y;
      tPos[i * 3 + 2] = r * Math.sin(theta);

      const chaosRadius = 12 + Math.random() * 20;
      const chaosTheta = Math.random() * Math.PI * 2;
      const chaosPhi = Math.acos(2 * Math.random() - 1);
      
      cPos[i * 3] = chaosRadius * Math.sin(chaosPhi) * Math.cos(chaosTheta);
      cPos[i * 3 + 1] = chaosRadius * Math.sin(chaosPhi) * Math.sin(chaosTheta) * 0.4;
      cPos[i * 3 + 2] = chaosRadius * Math.cos(chaosPhi);

      rRot[i * 3] = (Math.random() - 0.5) * 1.5;
      rRot[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      rRot[i * 3 + 2] = (Math.random() - 0.5) * 1.5;

      sc[i] = 0.04 + Math.random() * 0.14;
    }

    return { targetPositions: tPos, chaosPositions: cPos, randomRotations: rRot, scales: sc };
  }, [particleCount, treeHeight, treeRadius]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const currentPositions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) arr[i] = chaosPositions[i];
    return arr;
  }, [chaosPositions, particleCount]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const isWish = mode === 'WISH';
    const lerpFactor = isWish ? 0.04 : 0.02;

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;

      let tx = isWish ? targetPositions[idx] : chaosPositions[idx];
      let ty = isWish ? targetPositions[idx + 1] : chaosPositions[idx + 1];
      let tz = isWish ? targetPositions[idx + 2] : chaosPositions[idx + 2];

      if (isWish) {
         ty += Math.sin(time * 0.5 + tx) * 0.04; // Very subtle luxury drift
      } else {
         const angle = time * 0.15 + i * 0.01;
         tx += Math.cos(angle) * 1.5;
         tz += Math.sin(angle) * 1.5;
      }

      currentPositions[idx] = THREE.MathUtils.lerp(currentPositions[idx], tx, lerpFactor);
      currentPositions[idx + 1] = THREE.MathUtils.lerp(currentPositions[idx + 1], ty, lerpFactor);
      currentPositions[idx + 2] = THREE.MathUtils.lerp(currentPositions[idx + 2], tz, lerpFactor);

      dummy.position.set(currentPositions[idx], currentPositions[idx + 1], currentPositions[idx + 2]);
      dummy.rotation.set(
        time * randomRotations[idx] + i,
        time * randomRotations[idx + 1] + i,
        time * randomRotations[idx + 2]
      );
      dummy.scale.setScalar(scales[i]);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]} frustumCulled={false}>
      <octahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial
        color="#ffffff"
        roughness={0.01}
        metalness={0.05}
        transmission={0.96} 
        thickness={2.5}
        ior={2.417} 
        clearcoat={1}
        clearcoatRoughness={0}
        emissive="#ccf2ff"
        emissiveIntensity={0.12}
        toneMapped={false}
      />
    </instancedMesh>
  );
}