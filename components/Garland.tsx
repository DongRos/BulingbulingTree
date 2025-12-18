import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CONFIG } from '../constants';
import { useFrame } from '@react-three/fiber';

interface GarlandProps {
    visible: boolean;
    text: string; // 接收文字
}

export default function Garland({ visible, text }: GarlandProps) {
  const { treeHeight, treeRadius, spiralLoops } = CONFIG;

  // 1. 创建文字纹理
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 128; // 长条形纹理
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // 背景色 - 深香槟金/奢华黑金
        ctx.fillStyle = '#1a1a1a'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 金色边框
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 10;
        ctx.strokeRect(0,0, canvas.width, canvas.height);

        // 文字设置 - 奢华字体
        ctx.font = 'bold 60px "Playfair Display", serif';
        ctx.fillStyle = '#fff5d6'; // 浅金色文字
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 重复绘制文字以便在飘带上多次出现
        const textToDraw = `${text}  ✦  ${text}  ✦  ${text}`; 
        ctx.fillText(textToDraw, canvas.width / 2, canvas.height / 2);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(spiralLoops * 2, 1); // 根据螺旋圈数重复纹理
    return tex;
  }, [text, spiralLoops]);

  // 2. 曲线路径 (保持不变)
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

  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if(materialRef.current) {
        // 让纹理流动起来
        if (texture) texture.offset.x -= 0.002;
        // 呼吸灯效果
        materialRef.current.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  if (!visible) return null;

  return (
    <mesh>
      {/* tubeGeometry 参数调整:
         radius: 0.3 (变宽)
         radialSegments: 4 (变扁，接近长方体带子)
      */}
      <tubeGeometry args={[curve, 256, 0.3, 4, false]} />
      <meshStandardMaterial
        ref={materialRef}
        map={texture}
        color="#ffffff"
        emissive="#d4af37" // 金色自发光
        emissiveIntensity={0.5}
        roughness={0.3}
        metalness={0.9}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
