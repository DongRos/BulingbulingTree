import React, { useState } from 'react'; // 引入 useState

interface UIOverlayProps {
  currentMode: 'WISH' | 'CHAOS';
  setMode: (mode: 'WISH' | 'CHAOS') => void;
  blurLevel: number;
  setBlurLevel: (val: number) => void;
  titleText: string;
  setTitleText: (val: string) => void;
  // 新增 Ribbon Props
  ribbonText: string;
  setRibbonText: (val: string) => void;
  snowLevel: number;
  setSnowLevel: (val: number) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  currentMode, setMode, blurLevel, setBlurLevel, 
  titleText, setTitleText, ribbonText, setRibbonText, snowLevel, setSnowLevel 
}) => {
  const [isEditingRibbon, setIsEditingRibbon] = useState(false); // 控制编辑状态

  return (
    <>
      {/* Title - 改为 Input 以支持编辑 */}
      <div className="absolute top-12 left-0 right-0 text-center z-10 opacity-80 mix-blend-screen flex flex-col items-center">
         <input 
            value={titleText}
            onChange={(e) => setTitleText(e.target.value)}
            className="font-serif text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 tracking-widest uppercase text-center bg-transparent border-none outline-none w-full cursor-text pointer-events-auto"
            style={{ textShadow: '0 0 30px rgba(255,255,255,0.2)' }}
         />
         <p className="font-sans text-xs text-gray-400 mt-2 tracking-[0.3em] pointer-events-none">H A U T E &nbsp; C O U T U R E</p>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-12 left-0 right-0 z-20 px-12 flex flex-col md:flex-row justify-between items-end md:items-center gap-6 pointer-events-none">
        
        {/* Left: Sliders Container */}
        <div className="pointer-events-auto flex flex-col gap-6 items-start">
            
            {/* 新增：左下角极简奢华修改按钮 */}
            <div className="flex flex-col gap-2 items-start">
              <label className="text-[10px] tracking-[0.2em] text-gray-500">CUSTOMIZE RIBBON</label>
              {isEditingRibbon ? (
                <input 
                  autoFocus
                  value={ribbonText}
                  onChange={(e) => setRibbonText(e.target.value)}
                  onBlur={() => setIsEditingRibbon(false)}
                  className="w-40 bg-transparent border-b border-white/50 text-white font-serif italic outline-none text-sm py-1"
                />
              ) : (
                <button 
                  onClick={() => setIsEditingRibbon(true)}
                  className="px-4 py-2 border border-white/20 bg-black/40 backdrop-blur-sm hover:bg-white/10 hover:border-white/50 transition-all duration-500 text-xs tracking-widest text-gray-300 hover:text-white font-serif"
                >
                  EDIT TEXT
                </button>
              )}
            </div>

            {/* Existing Blur Slider */}
            <div className="flex flex-col gap-2 items-start group">
              <label className="text-[10px] tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors duration-300">
                LENS FOCUS
              </label>
              <div className="relative w-32 h-6 flex items-center">
                 <input 
                   type="range" min="0" max="1" step="0.01" value={blurLevel}
                   onChange={(e) => setBlurLevel(parseFloat(e.target.value))}
                   className="w-full h-[2px] bg-white/20 appearance-none cursor-pointer rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                 />
              </div>
            </div>

            {/* New Snow Slider */}
            <div className="flex flex-col gap-2 items-start group">
              <label className="text-[10px] tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors duration-300">
                SNOWFALL
              </label>
              <div className="relative w-32 h-6 flex items-center">
                 <input 
                   type="range" min="0" max="1" step="0.01" value={snowLevel}
                   onChange={(e) => setSnowLevel(parseFloat(e.target.value))}
                   className="w-full h-[2px] bg-white/20 appearance-none cursor-pointer rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                 />
              </div>
            </div>

          </div>

        {/* Center: Action Buttons */}
        <div className="flex gap-4 pointer-events-auto mx-auto md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
          <button
            onClick={() => setMode('WISH')}
            className={`
              relative px-8 py-3 rounded-full border transition-all duration-500 ease-out backdrop-blur-md
              font-serif tracking-wider text-sm md:text-base
              ${currentMode === 'WISH' 
                ? 'bg-white/10 border-white/50 text-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                : 'bg-black/20 border-white/10 text-white/50 hover:bg-white/5 hover:text-white'}
            `}
          >
            <span className="mr-2">✨</span> WISH
          </button>

          <button
            onClick={() => setMode(currentMode === 'CHAOS' ? 'WISH' : 'CHAOS')}
            className={`
              relative px-8 py-3 rounded-full border transition-all duration-500 ease-out backdrop-blur-md
              font-serif tracking-wider text-sm md:text-base
              ${currentMode === 'CHAOS' 
                ? 'bg-purple-500/20 border-purple-400/50 text-purple-100 shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                : 'bg-black/20 border-white/10 text-white/50 hover:bg-white/5 hover:text-white'}
            `}
          >
            {currentMode === 'CHAOS' ? 'CLOSE CHAOS' : 'UNLEASH CHAOS'}
          </button>
        </div>

        {/* Right: Spacer for balance or future stats */}
        <div className="hidden md:block w-32"></div>

      </div>
    </>
  );
};

export default UIOverlay;
