import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import DiamondParticles from './DiamondParticles';
import Garland from './Garland';
import PostEffects from './PostEffects';

interface SceneProps {
  mode: 'WISH' | 'CHAOS';
  blurLevel: number;
}

export default function Scene({ mode, blurLevel }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Elegant, very slow rotation
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 20]} />
      <OrbitControls 
        enablePan={false} 
        minDistance={8} 
        maxDistance={35} 
        autoRotate={false} 
        enableDamping={true}
        dampingFactor={0.05}
      />

      {/* Stable Studio Lighting */}
      <ambientLight intensity={0.4} color="#001133" />
      <pointLight position={[15, 15, 15]} intensity={2} color="#ffffff" />
      <pointLight position={[-15, -10, -15]} intensity={1.5} color="#4455ff" />
      <spotLight position={[0, 20, 0]} angle={0.3} penumbra={1} intensity={2} color="#ccf2ff" />

      <Environment preset="night" background={false} />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />

      {/* --- HIGH-DENSITY LUXURY COLD MIST --- */}
      {/* Layered for volume and size variation, depthWrite: false to prevent flickering */}
      <group position={[0, -2, 0]}>
        {/* 1. Core Vapor - Very dense, small particles */}
        <Sparkles 
          count={8000} 
          scale={[5, 14, 5]} 
          size={1.2} 
          speed={0.15} 
          opacity={0.3} 
          noise={0.1} 
          color="#ffffff" 
          depthWrite={false}
        />
        
        {/* 2. Rising Frost - Medium particles with upward bias */}
        <Sparkles 
          count={4000} 
          scale={[10, 16, 10]} 
          size={2.8} 
          speed={0.4} 
          opacity={0.2} 
          noise={0.6} 
          color="#e0f7ff" 
          depthWrite={false}
        />

        {/* 3. Twinkling Ice Crystals - Sharp, fine highlights */}
        <Sparkles 
          count={3000} 
          scale={[12, 18, 12]} 
          size={0.7} 
          speed={0.8} 
          opacity={0.6} 
          noise={2.0} 
          color="#b3e5fc" 
          depthWrite={false}
        />

        {/* 4. Large Soft Bokeh - Luxurious blurred aura */}
        <Sparkles 
          count={500} 
          scale={[18, 20, 18]} 
          size={10} 
          speed={0.1} 
          opacity={0.1} 
          noise={0.2} 
          color="#ffffff" 
          depthWrite={false}
        />
      </group>

      <group ref={groupRef}>
        <DiamondParticles mode={mode} />
        <Garland visible={mode === 'WISH'} />
        
        {/* Topper Star - Refined */}
        {mode === 'WISH' && (
          <mesh position={[0, 6.2, 0]}>
            <icosahedronGeometry args={[0.55, 0]} />
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#ffffff" 
              emissiveIntensity={3}
              toneMapped={false}
            />
          </mesh>
        )}
      </group>

      <PostEffects blurLevel={blurLevel} />
    </>
  );
}
