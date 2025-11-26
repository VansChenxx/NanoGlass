
import React, { useRef, useState } from 'react';
import { BackgroundColor, ModelTier, AspectRatio, GenerationConfig, MaterialLayer, Viewpoint, SecondaryMaterialType, GlassStyle, AccentColor, MetalTexture } from '../types';
import { Settings2, Moon, Sun, Zap, Star, Monitor, Smartphone, Square, Layers, Copy, Sliders, Eye, Upload, X, ImageIcon, Cylinder, Box, Droplets, Palette, Wand2, Grid, Plus, AlignJustify, Hash, Maximize } from 'lucide-react';

interface ControlsProps {
  config: GenerationConfig;
  setConfig: React.Dispatch<React.SetStateAction<GenerationConfig>>;
  isGenerating: boolean;
}

const predefinedAccents: { value: string; label: string; bg: string; ring?: string }[] = [
    { value: '#070808', label: '暗夜黑金', bg: 'bg-[#070808]', ring: 'ring-gray-600' },
    { value: '#00b7d0', label: '极光青', bg: 'bg-[#00b7d0]', ring: 'ring-cyan-500' },
    { value: '#FF5500', label: '熔岩橙', bg: 'bg-[#FF5500]', ring: 'ring-orange-500' },
    { value: '#9900FF', label: '电光紫', bg: 'bg-[#9900FF]', ring: 'ring-purple-500' },
    { value: '#FF00CC', label: '霓虹粉', bg: 'bg-[#FF00CC]', ring: 'ring-pink-500' },
    { value: '#CCFF00', label: '酸性绿', bg: 'bg-[#CCFF00]', ring: 'ring-lime-500' },
    { value: '#FFD700', label: '流光金', bg: 'bg-[#FFD700]', ring: 'ring-yellow-500' },
];

export const Controls: React.FC<ControlsProps> = ({ config, setConfig, isGenerating }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  
  const updateConfig = (key: keyof GenerationConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateMaterial = (index: number, field: keyof MaterialLayer, value: any) => {
    const newMaterials = [...config.materials] as [MaterialLayer, MaterialLayer, MaterialLayer];
    newMaterials[index] = { ...newMaterials[index], [field]: value };
    updateConfig('materials', newMaterials);
  };

  const handleMaterialTypeChange = (type: SecondaryMaterialType) => {
    const newMaterials = [...config.materials] as [MaterialLayer, MaterialLayer, MaterialLayer];
    if (type === 'silver') {
      newMaterials[1].name = `银色金属 (${getMetalTextureLabel(config.metalTexture || MetalTexture.Matte)})`;
    } else {
      newMaterials[1].name = '白色石膏 (White Plaster)';
    }
    setConfig(prev => ({ ...prev, secondaryMaterialType: type, materials: newMaterials }));
  };

  const handleMetalTextureChange = (texture: MetalTexture) => {
      const newMaterials = [...config.materials] as [MaterialLayer, MaterialLayer, MaterialLayer];
      newMaterials[1].name = `银色金属 (${getMetalTextureLabel(texture)})`;
      setConfig(prev => ({ ...prev, metalTexture: texture, materials: newMaterials }));
  };

  const getMetalTextureLabel = (t: MetalTexture) => {
      switch(t) {
          case MetalTexture.Brushed: return '拉丝';
          case MetalTexture.Patterned: return '纹理';
          default: return '磨砂';
      }
  };
  
  const handleAccentChange = (color: string) => {
    const newMaterials = [...config.materials] as [MaterialLayer, MaterialLayer, MaterialLayer];
    
    // Check if it's a predefined color to give it a nice name
    const preset = predefinedAccents.find(p => p.value === color);
    const name = preset ? `${preset.label}金属` : `自定义金属 (${color})`;

    newMaterials[2].name = name;
    setConfig(prev => ({ ...prev, accentColor: color, materials: newMaterials }));
  };

  const handleGlassStyleChange = (style: GlassStyle) => {
    const newMaterials = [...config.materials] as [MaterialLayer, MaterialLayer, MaterialLayer];
    const nameMap: Record<GlassStyle, string> = {
        'clear': '极致通透 (Invisible Glass)',
        'frosted': '磨砂玻璃 (Frosted Glass)',
        'smoked': '烟熏玻璃 (Smoked Glass)'
    };
    newMaterials[0].name = nameMap[style];
    setConfig(prev => ({ ...prev, glassStyle: style, materials: newMaterials }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateConfig('referenceImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    updateConfig('referenceImage', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const totalRatio = config.materials.reduce((sum, m) => sum + m.ratio, 0);

  const getSimplicityLabel = (level: number) => {
    switch (level) {
      case 1: return '具象细节 (Detailed)';
      case 2: return '精简结构 (Simplified)';
      case 3: return '现代简约 (Balanced)';
      case 4: return '极简主义 (Minimalist)';
      case 5: return '抽象几何 (Abstract)';
      default: return '标准 (Standard)';
    }
  };

  // Helper for metal button style
  const metalBtnClass = "bg-gradient-to-b from-slate-700 to-slate-900 border border-slate-600 hover:border-[#00b7d0] shadow-md transition-all active:scale-95";
  const activeMetalBtnClass = "bg-gradient-to-b from-[#00b7d0]/20 to-[#00b7d0]/5 border-[#00b7d0] text-[#00b7d0] shadow-[0_0_10px_rgba(0,183,208,0.2)]";

  return (
    <div className="bg-[#070808] rounded-xl border border-slate-800 p-6 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-2 text-[#00b7d0] font-medium border-b border-slate-800 pb-4">
        <Settings2 className="w-5 h-5" />
        <h2>生成配置</h2>
      </div>

      {/* Model Selection */}
      <div className="space-y-3">
        <label className="text-slate-500 text-xs font-bold uppercase tracking-wider">模型引擎</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            disabled={isGenerating}
            onClick={() => updateConfig('model', ModelTier.Standard)}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
              config.model === ModelTier.Standard
                ? activeMetalBtnClass
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
            }`}
          >
            <Zap className={`w-5 h-5 ${config.model === ModelTier.Standard ? 'text-[#00b7d0]' : 'text-slate-500'}`} />
            <span className="text-sm font-medium">Flash 2.5</span>
          </button>
          <button
             disabled={isGenerating}
            onClick={() => updateConfig('model', ModelTier.Pro)}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
              config.model === ModelTier.Pro
                ? 'bg-gradient-to-b from-purple-500/20 to-purple-900/10 border-purple-500 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
            }`}
          >
            <Star className={`w-5 h-5 ${config.model === ModelTier.Pro ? 'text-purple-400' : 'text-slate-500'}`} />
            <span className="text-sm font-medium">Pro 3.0</span>
          </button>
        </div>
      </div>

      {/* Reference Image */}
      <div className="space-y-3">
        <label className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-3 h-3" /> 参考图片 / 垫图
        </label>
        
        {!config.referenceImage ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-900 hover:border-[#00b7d0]/50 transition-all ${isGenerating ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <Upload className="w-5 h-5 text-slate-500" />
            <span className="text-xs text-slate-500">点击上传参考图</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden border border-slate-700 group bg-black">
             <img src={config.referenceImage} alt="Ref" className="w-full h-32 object-contain opacity-80" />
             <div className="absolute top-2 right-2 flex gap-2">
                 <button 
                  onClick={removeImage}
                  disabled={isGenerating}
                  className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-full shadow-lg backdrop-blur-sm"
                >
                  <X className="w-3 h-3" />
                </button>
             </div>
             <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm p-2 rounded text-[10px] text-slate-300 border border-white/10 flex items-center gap-2">
                 <Wand2 className="w-3 h-3 text-purple-400" />
                 <span>作为结构与构图参考</span>
             </div>
          </div>
        )}
      </div>

       {/* Simplicity Level */}
       <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-3 h-3" /> 风格/抽象度
          </label>
          <span className="text-[#00b7d0] text-[10px] font-mono bg-[#00b7d0]/10 px-2 py-0.5 rounded border border-[#00b7d0]/20">
            {getSimplicityLabel(config.simplicityLevel || 3)}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          disabled={isGenerating}
          value={config.simplicityLevel || 3}
          onChange={(e) => updateConfig('simplicityLevel', parseInt(e.target.value))}
          className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-[#00b7d0]"
        />
      </div>

      {/* Material Configuration */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex justify-between items-center">
          <label className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-3 h-3" /> 材质配比 & 质感
          </label>
          <span className={`text-xs font-mono px-2 py-0.5 rounded ${totalRatio === 100 ? 'text-green-400 bg-green-900/20' : 'text-orange-400 bg-orange-900/20'}`}>
            总计: {totalRatio}%
          </span>
        </div>

        <div className="space-y-4">
          {/* Layer 1: Glass */}
          <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="uppercase flex items-center gap-1"><Droplets className="w-3 h-3" /> 玻璃 (Glass)</span>
                <span>{config.materials[0].ratio}%</span>
            </div>
            
            <div className="flex gap-1">
                {[
                    { val: GlassStyle.Clear, label: '通透' },
                    { val: GlassStyle.Frosted, label: '磨砂' },
                    { val: GlassStyle.Smoked, label: '烟熏' }
                ].map(opt => (
                    <button 
                    key={opt.val}
                    onClick={() => handleGlassStyleChange(opt.val)}
                    className={`flex-1 text-[10px] py-1.5 rounded transition-all ${config.glassStyle === opt.val ? metalBtnClass + ' text-white' : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'}`}
                    >
                    {opt.label}
                    </button>
                ))}
            </div>

            <input
                type="range"
                min="0"
                max="100"
                step="5"
                disabled={isGenerating}
                value={config.materials[0].ratio}
                onChange={(e) => updateMaterial(0, 'ratio', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00b7d0]"
              />
          </div>

          {/* Layer 2: Silver vs Plaster */}
          <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-800 space-y-3">
             <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="uppercase flex items-center gap-1"><Cylinder className="w-3 h-3" /> 实体 (Solid)</span>
                <span>{config.materials[1].ratio}%</span>
            </div>
            
            <div className="flex gap-1">
               <button 
                 onClick={() => handleMaterialTypeChange('silver')}
                 className={`flex-1 text-[10px] py-1.5 rounded flex items-center justify-center gap-1 transition-all ${config.secondaryMaterialType === 'silver' ? metalBtnClass + ' text-white' : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'}`}
               >
                 银色金属
               </button>
               <button 
                 onClick={() => handleMaterialTypeChange('plaster')}
                 className={`flex-1 text-[10px] py-1.5 rounded flex items-center justify-center gap-1 transition-all ${config.secondaryMaterialType === 'plaster' ? metalBtnClass + ' text-white' : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'}`}
               >
                 白色石膏
               </button>
            </div>

            {/* Sub-options for Silver Texture */}
            {config.secondaryMaterialType === 'silver' && (
                <div className="grid grid-cols-3 gap-1 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    {[
                        { val: MetalTexture.Matte, label: '磨砂', icon: Maximize },
                        { val: MetalTexture.Brushed, label: '拉丝', icon: AlignJustify },
                        { val: MetalTexture.Patterned, label: '纹理', icon: Hash }
                    ].map(opt => (
                        <button
                            key={opt.val}
                            onClick={() => handleMetalTextureChange(opt.val)}
                            className={`flex flex-col items-center gap-1 py-1.5 rounded-md border text-[10px] transition-all ${
                                config.metalTexture === opt.val
                                ? 'bg-slate-700/50 border-[#00b7d0] text-white'
                                : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                            }`}
                        >
                            <opt.icon className="w-3 h-3" />
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}

            <input
                type="range"
                min="0"
                max="100"
                step="5"
                disabled={isGenerating}
                value={config.materials[1].ratio}
                onChange={(e) => updateMaterial(1, 'ratio', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00b7d0]"
              />
          </div>

          {/* Layer 3: Accent Color */}
          <div className="bg-gradient-to-br from-slate-900 to-[#070808] p-3 rounded-lg border border-slate-700/50 shadow-inner space-y-3 relative overflow-hidden">
            {/* Metallic shine effect */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            
            <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="uppercase flex items-center gap-1 font-bold tracking-wider text-[#00b7d0]"><Palette className="w-3 h-3" /> 金属点缀 (Metallic Accent)</span>
                <span>{config.materials[2].ratio}%</span>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
                {predefinedAccents.map(col => {
                    const isSelected = config.accentColor.toLowerCase() === col.value.toLowerCase();
                    return (
                    <button
                        key={col.value}
                        onClick={() => handleAccentChange(col.value)}
                        className={`group relative h-8 rounded-md border transition-all duration-300 ${isSelected ? 'border-white scale-105 shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'border-slate-700 opacity-80 hover:opacity-100 hover:border-slate-500'}`}
                        title={col.label}
                    >
                         <div className={`absolute inset-0 rounded-md ${col.bg} opacity-80`}></div>
                         {/* Metallic gloss overlay */}
                         <div className="absolute inset-0 rounded-md bg-gradient-to-br from-white/40 to-black/20 pointer-events-none"></div>
                         
                         {isSelected && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full border border-black shadow-sm z-10"></div>}
                    </button>
                    )
                })}
                
                {/* Custom Color Button - Styled as "Add Option" */}
                <div className="relative h-8">
                     <button
                        onClick={() => colorInputRef.current?.click()}
                        className={`w-full h-full rounded-md border border-dashed border-slate-500 bg-slate-800/50 flex items-center justify-center hover:bg-slate-700 hover:border-[#00b7d0] text-slate-400 hover:text-[#00b7d0] transition-all`}
                        title="自定义颜色 / 增加点缀色"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                    <input 
                        ref={colorInputRef}
                        type="color" 
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={(e) => handleAccentChange(e.target.value)}
                        value={config.accentColor.startsWith('#') ? config.accentColor : '#000000'}
                    />
                </div>
            </div>

            <input
                type="range"
                min="0"
                max="100"
                step="5"
                disabled={isGenerating}
                value={config.materials[2].ratio}
                onChange={(e) => updateMaterial(2, 'ratio', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00b7d0]"
              />
          </div>
        </div>
      </div>

      {/* Viewpoint */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
         <label className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-3 h-3" /> 视角 (Viewpoint)
         </label>
         <div className="grid grid-cols-2 gap-2">
            {Object.values(Viewpoint).map((vp) => (
                <button
                    key={vp}
                    disabled={isGenerating}
                    onClick={() => updateConfig('viewpoint', vp)}
                    className={`text-[10px] py-2 px-2 rounded-md border text-center whitespace-nowrap overflow-hidden text-ellipsis transition-all ${
                        config.viewpoint === vp
                        ? activeMetalBtnClass
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                    }`}
                >
                    {vp.split('/')[0]}
                </button>
            ))}
         </div>
      </div>

      {/* Background Selection */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <label className="text-slate-500 text-xs font-bold uppercase tracking-wider">背景颜色</label>
        <div className="flex p-1 bg-slate-900 rounded-lg border border-slate-800 gap-1">
          <button
            disabled={isGenerating}
            onClick={() => updateConfig('background', BackgroundColor.Black)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm transition-all ${
              config.background === BackgroundColor.Black
                ? 'bg-gradient-to-b from-slate-700 to-black text-white shadow border border-slate-600'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Moon className="w-4 h-4" /> 纯黑
          </button>
          <button
            disabled={isGenerating}
            onClick={() => updateConfig('background', BackgroundColor.White)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm transition-all ${
              config.background === BackgroundColor.White
                ? 'bg-gradient-to-b from-white to-slate-200 text-black shadow border border-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Sun className="w-4 h-4" /> 纯白
          </button>
          <button
            disabled={isGenerating}
            onClick={() => updateConfig('background', BackgroundColor.Transparent)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm transition-all relative overflow-hidden ${
              config.background === BackgroundColor.Transparent
                ? 'bg-slate-700 text-white shadow-sm border border-slate-500 ring-1 ring-white/20'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
             {/* Checkerboard hint */}
             {config.background === BackgroundColor.Transparent && (
                 <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
                    backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)',
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                 }}></div>
             )}
            <Grid className="w-4 h-4 relative z-10" /> <span className="relative z-10">透明</span>
          </button>
        </div>
      </div>

      {/* Aspect Ratio & Image Count */}
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-3">
            <label className="text-slate-500 text-xs font-bold uppercase tracking-wider">画面比例</label>
            <div className="grid grid-cols-3 gap-2">
            {[
                { r: AspectRatio.Square, icon: Square, label: '1:1' },
                { r: AspectRatio.Wide, icon: Monitor, label: '16:9' },
                { r: AspectRatio.Portrait, icon: Smartphone, label: '9:16' },
            ].map((ratio) => (
                <button
                key={ratio.r}
                disabled={isGenerating}
                onClick={() => updateConfig('aspectRatio', ratio.r)}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border text-xs transition-all ${
                    config.aspectRatio === ratio.r
                    ? activeMetalBtnClass
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
                }`}
                >
                <ratio.icon className="w-4 h-4" />
                {ratio.label}
                </button>
            ))}
            </div>
        </div>

        <div className="space-y-3">
             <div className="flex justify-between items-center">
                <label className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <Copy className="w-3 h-3" /> 生成数量
                </label>
                <span className="text-[#00b7d0] text-xs font-mono bg-[#00b7d0]/10 px-2 py-0.5 rounded border border-[#00b7d0]/20">
                    {config.imageCount} 张
                </span>
             </div>
             <input
                type="range"
                min="1"
                max="10"
                step="1"
                disabled={isGenerating}
                value={config.imageCount}
                onChange={(e) => updateConfig('imageCount', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-[#00b7d0]"
                />
        </div>
      </div>

    </div>
  );
};