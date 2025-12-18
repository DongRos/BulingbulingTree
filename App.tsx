import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import Scene from './components/Scene';
import UIOverlay from './components/UIOverlay';

export default function App() {
  const [mode, setMode] = useState<'WISH' | 'CHAOS'>('WISH');
  const [blurLevel, setBlurLevel] = useState(0);

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden">
      <Canvas
        dpr={[1, 2]} 
        camera={{ position: [0, 0, 22], fov: 40 }}
        gl={{ 
          antialias: false,
          stencil: false,
          depth: true,
          powerPreference: 'high-performance',
          alpha: false
        }}
      >
        <Suspense fallback={null}>
          <Scene mode={mode} blurLevel={blurLevel} />
        </Suspense>
      </Canvas>
      
      <Loader 
        containerStyles={{ background: 'black' }} 
        innerStyles={{ width: '200px', background: '#333' }}
        barStyles={{ background: '#fff' }}
        dataStyles={{ color: '#fff', fontFamily: 'Inter' }}
      />
      
      <UIOverlay 
        currentMode={mode} 
        setMode={setMode} 
        blurLevel={blurLevel}
        setBlurLevel={setBlurLevel}
      />
    </div>
  );
}
