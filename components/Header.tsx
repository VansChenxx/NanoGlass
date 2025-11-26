
import React from 'react';
import { Hexagon, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-4 md:px-8 flex flex-col items-center justify-center border-b border-slate-800 bg-[#070808]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Hexagon className="w-10 h-10 text-[#00b7d0] fill-[#00b7d0]/20 stroke-[1.5]" />
          <Sparkles className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          NanoGlass <span className="text-[#00b7d0] font-light">插画生成器</span>
        </h1>
      </div>
      <p className="text-slate-500 text-sm mt-2 max-w-md text-center">
        生成式 3D 插画 • 60% 玻璃 • 30% 银色/石膏 • 10% 点缀金属
      </p>
    </header>
  );
};