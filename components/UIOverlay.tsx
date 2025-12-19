import React, { useState } from 'react'; // 引入 useState

interface UIOverlayProps {
  currentMode: 'WISH' | 'CHAOS';
  setMode: (mode: 'WISH' | 'CHAOS') => void;
  blurLevel: number;
  setBlurLevel: (val: number) => void;
  titleText: string;
  setTitleText: (val: string) => void;
  // 新增副标题 Props
  subtitleText: string;
  setSubtitleText: (val: string) => void;


  snowLevel: number;
  setSnowLevel: (val: number) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  currentMode, setMode, blurLevel, setBlurLevel, 
  titleText, setTitleText, subtitleText, setSubtitleText, snowLevel, setSnowLevel 
}) => {

  // 新增：控制右上角菜单展开状态
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Title */}
      <div className="absolute top-12 left-0 right-0 text-center z-10 opacity-80 mix-blend-screen flex flex-col items-center">
         <input 
            value={titleText}
            onChange={(e) => setTitleText(e.target.value)}
            {/* 修改：末尾添加 caret-white 以强制显示白色光标 */}
            className="font-serif text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 tracking-widest uppercase text-center bg-transparent border-none outline-none w-full cursor-text pointer-events-auto caret-white"
            style={{ textShadow: '0 0 30px rgba(255,255,255,0.2)' }}
         />
         {/* 修改：将 P 标签改为 Input 标签 */}
         <input 
            value={subtitleText}
            onChange={(e) => setSubtitleText(e.target.value)}
            className="font-sans text-xs text-gray-400 mt-2 tracking-[0.3em] text-center bg-transparent border-none outline-none w-full cursor-text pointer-events-auto uppercase"
         />
      </div>

      {/* === 右上角折叠菜单 === */}
      <div className="absolute top-32 md:top-12 right-4 z-30 flex flex-col items-end">
        {/* 展开/收起按钮 - 极简奢华风格 */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="pointer-events-auto text-xs tracking-[0.2em] text-gray-300 hover:text-white border border-white/20 px-4 py-2 backdrop-blur-sm transition-all hover:border-white/50 uppercase"
        >
          {isMenuOpen ? 'CLOSE CONTROLS' : 'CONTROLS +'}
        </button>

        {/* 折叠的内容面板 */}
        {isMenuOpen && (
          <div className="mt-4 pointer-events-auto flex flex-col gap-6 items-end p-6 bg-black/40 backdrop-blur-md border border-white/10 w-64 transition-all animate-in fade-in slide-in-from-top-4">
             

            {/* 1. Lens Focus Slider */}
            <div className="flex flex-col gap-2 items-end w-full">
              <label className="text-[10px] tracking-[0.2em] text-gray-500">LENS FOCUS</label>
               <input 
                 type="range" min="0" max="1" step="0.01" value={blurLevel}
                 onChange={(e) => setBlurLevel(parseFloat(e.target.value))}
                 className="w-full h-[2px] bg-white/20 appearance-none cursor-pointer rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
               />
            </div>

            {/* 2. Snowfall Slider */}
            <div className="flex flex-col gap-2 items-end w-full">
              <label className="text-[10px] tracking-[0.2em] text-gray-500">SNOWFALL</label>
               <input 
                 type="range" min="0" max="1" step="0.01" value={snowLevel}
                 onChange={(e) => setSnowLevel(parseFloat(e.target.value))}
                 className="w-full h-[2px] bg-white/20 appearance-none cursor-pointer rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
               />
            </div>

          </div>
        )}
      </div>

      {/* === 底部按钮 (仅保留 Chaos 居中) === */}
      <div className="absolute bottom-12 left-0 right-0 z-20 flex justify-center items-center pointer-events-none">
        <button 
          onClick={() => setMode(currentMode === 'CHAOS' ? 'WISH' : 'CHAOS')} // 点击切换回 Wish 或保持 Chaos 逻辑自定，这里设为 Toggle
          className={`pointer-events-auto px-8 py-3 border transition-all duration-500 tracking-[0.3em] text-xs md:text-sm uppercase
            ${currentMode === 'CHAOS' 
              ? 'bg-red-900/20 border-red-500 text-red-500 shadow-[0_0_30px_rgba(220,38,38,0.3)]' 
              : 'bg-black/20 border-white/30 text-white hover:bg-white/10 hover:border-white'
            }`}
        >
          {currentMode === 'CHAOS' ? 'CALM DOWN' : 'UNLEASH CHAOS'}
        </button>
      </div>
    </>
  );
}
export default UIOverlay;
