import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import Scene from './components/Scene';
import UIOverlay from './components/UIOverlay';

export default function App() {
  const [mode, setMode] = useState<'WISH' | 'CHAOS'>('WISH');
  const [blurLevel, setBlurLevel] = useState(0);
  const [titleText, setTitleText] = useState("Noel Cyberpunk");
// 新增：副标题状态
  const [subtitleText, setSubtitleText] = useState("HAUTE COUTURE");
  const [snowLevel, setSnowLevel] = useState(0.5);

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
          {/* 删除 ribbonText */}
          <Scene mode={mode} blurLevel={blurLevel} titleText={titleText} snowLevel={snowLevel} />
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
        titleText={titleText}
        setTitleText={setTitleText}
        // 传递副标题状态
        subtitleText={subtitleText}
        setSubtitleText={setSubtitleText}
        snowLevel={snowLevel}
        setSnowLevel={setSnowLevel}
      />
    </div>
  );
}
