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
        // 1. 背景：奢华银色，带一点透明感
        // 使用 createLinearGradient 制造金属光泽
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(220, 220, 225, 0.4)'); // 亮银
        gradient.addColorStop(0.5, 'rgba(192, 192, 200, 0.8)'); // 灰银
        gradient.addColorStop(1, 'rgba(220, 220, 225, 0.4)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 2. 边框：极细银边
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 4;
        ctx.strokeRect(0,0, canvas.width, canvas.height);
        
// 文字设置 - 奢华字体 (字体稍微调小一点，防止撑满边缘)
        ctx.font = 'bold italic 40px "Playfair Display", serif';
        
        // 修改：奢华金色渐变文字
        const textGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        textGradient.addColorStop(0, '#D4AF37'); // 古典金
        textGradient.addColorStop(0.5, '#FFF8E1'); // 高光金
        textGradient.addColorStop(1, '#D4AF37');
        ctx.fillStyle = textGradient;
        
        ctx.shadowColor = 'rgba(255, 215, 0, 0.8)'; 
        ctx.shadowBlur = 10;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const textToDraw = `${text}   ✦   ${text}   ✦   ${text}`; 
        // 修改：分别在高度的 25% 和 75% 处绘制文字
        // 这样当 radialSegments 为 2 时，带子的正面和反面正好各显示一行文字
        ctx.fillText(textToDraw, canvas.width / 2, canvas.height * 0.25);
        ctx.fillText(textToDraw, canvas.width / 2, canvas.height * 0.75);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(spiralLoops * 1.5, 1);
    // 开启各向异性过滤，防止侧面看文字模糊
    tex.anisotropy = 16; 
    return tex;
  }, [text, spiralLoops]);

 // 2. 曲线路径 (拆分为灯带和飘带两条，实现交错)
  const { lightCurve, ribbonCurve } = useMemo(() => {
    const pLight = [];
    const pRibbon = [];
    const count = 100;
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const y = (t - 0.5) * treeHeight;
      const radius = (1 - t) * (treeRadius + 0.5); 
      
      // 灯带的基础角度
      const angle = t * Math.PI * 2 * spiralLoops;
      pLight.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));

      // 飘带的角度：偏移 Math.PI (180度)，使其位于树的对面，与灯带交错互不遮挡
      const angleRibbon = angle + Math.PI; 
      pRibbon.push(new THREE.Vector3(Math.cos(angleRibbon) * radius, y, Math.sin(angleRibbon) * radius));
    }
    return { 
      lightCurve: new THREE.CatmullRomCurve3(pLight), 
      ribbonCurve: new THREE.CatmullRomCurve3(pRibbon) 
    };
  }, [treeHeight, treeRadius, spiralLoops]);

  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const ribbonMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

  useFrame((state) => {
    // 原始呼吸灯带逻辑
    if(materialRef.current) {
        materialRef.current.emissiveIntensity = 2 + Math.sin(state.clock.elapsedTime * 3) * 1.5;
    }
    // 飘带流动逻辑
    if (ribbonMatRef.current && texture) {
        texture.offset.x -= 0.0015; // 缓慢流动
    }
  });

  if (!visible) return null;

  return (
    <group>
      {/* 1. 呼吸闪烁灯带 - 使用 lightCurve */}
      <mesh>
        <tubeGeometry args={[lightCurve, 128, 0.04, 8, false]} />
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

      {/* 2. 奢华银色文字飘带 - 使用 ribbonCurve */}
      <mesh>
        {/* 修改：
            radius -> 0.25 (稍微变宽)
            radialSegments -> 2 (关键：设为2会变成扁平的长方形带子)
            tubularSegments -> 512 (增加平滑度) 
        */}
        <tubeGeometry args={[ribbonCurve, 512, 0.25, 2, false]} />
        <meshPhysicalMaterial
          ref={ribbonMatRef}
          map={texture}
          color="#ffffff"
          transparent
          opacity={0.95}
          roughness={0.2}
          metalness={1.0} // 强金属感
          clearcoat={1.0} // 表面清漆，增加光泽
          clearcoatRoughness={0.1}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
