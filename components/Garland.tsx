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
        // 1. 背景：实心奢华银色 (去除透明度)
        // 使用 createLinearGradient 制造金属光泽
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#E8E8EC'); // 实心亮银白
        gradient.addColorStop(0.5, '#C0C0C8'); // 实心金属灰
        gradient.addColorStop(1, '#E8E8EC');
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
        // 改回：只在正中间绘制一次，因为新几何体 UV 是标准的
        ctx.fillText(textToDraw, canvas.width / 2, canvas.height / 2);
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


    // === 新增：自定义几何体生成，确保飘带“铺”在树上 ===
  const ribbonGeometry = useMemo(() => {
    // 增加分段数以保证平滑
    const segments = 512;
    const points = ribbonCurve.getPoints(segments);
    const ribbonGeometry = useMemo(() => {
    const segments = 512;
    // 获取点，但不使用 FrenetFrames
    const points = ribbonCurve.getPoints(segments);
    
    const positions = [];
    const uvs = [];
    const indices = [];
    const width = 0.35;

    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        
        // === 修复逻辑：自定义标架，使飘带始终平铺在树体表面 ===
        
        // 1. 获取当前点的切线向量 (Tangent)
        // 使用 getTangentAt (0~1)
        const tVal = i / segments;
        const tangent = ribbonCurve.getTangentAt(tVal).normalize();

        // 2. 获取径向向量 (Radial Vector) - 即平面的法线方向
        // 假设树是直立在 Y 轴上的，径向就是 (x, 0, z) 的归一化
        const radial = new THREE.Vector3(p.x, 0, p.z).normalize();

        // 3. 计算宽度方向向量 (Width Vector / Binormal)
        // 宽度方向应该是：垂直于径向(Normal)，也垂直于切线(Tangent)
        // 这样生成的面的法线就是 Radial，即面朝外
        const widthAxis = new THREE.Vector3().crossVectors(radial, tangent).normalize();

        // 顶点生成
        const v1 = p.clone().addScaledVector(widthAxis, width / 2);
        const v2 = p.clone().addScaledVector(widthAxis, -width / 2);

        positions.push(v1.x, v1.y, v1.z);
        positions.push(v2.x, v2.y, v2.z);

        // UV映射
        const u = (i / segments) * (spiralLoops * 1.5);
        uvs.push(u, 1); 
        uvs.push(u, 0); 
    }

    // 构建三角形索引
    for (let i = 0; i < segments; i++) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
  }, [ribbonCurve, spiralLoops]);

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
      {/* 1. 灯带 (保持不变) */}
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

      {/* 2. 飘带 - 使用哑光材质 */}
      <mesh geometry={ribbonGeometry}>
        <meshStandardMaterial // 改用 Standard 材质
          ref={ribbonMatRef}
          map={texture}
          color="#ffffff"
          roughness={0.8}   // 高粗糙度，哑光效果
          metalness={0.0}   // 无金属感，防止反光干扰文字
          emissive="#000000"
          side={THREE.DoubleSide}
          toneMapped={false} // 保持颜色鲜艳
          transparent={false} // 不透明
        />
      </mesh>
    </group>
  );
}
