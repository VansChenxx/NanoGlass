
import React, { useState } from 'react';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { ResultView } from './components/ResultView';
import { generateNanoBananaIllustration } from './services/geminiService';
import { GenerationConfig, BackgroundColor, ModelTier, AspectRatio, GeneratedImage, Viewpoint, GlassStyle, AccentColor, MetalTexture } from './types';
import { Sparkles, ArrowRight, Wand2 } from 'lucide-react';

const App: React.FC = () => {
  const [config, setConfig] = useState<GenerationConfig>({
    prompt: '',
    referenceImage: null,
    background: BackgroundColor.Black,
    model: ModelTier.Standard,
    aspectRatio: AspectRatio.Square,
    viewpoint: Viewpoint.Isometric,
    imageCount: 1,
    simplicityLevel: 3,
    secondaryMaterialType: 'silver',
    metalTexture: MetalTexture.Matte,
    glassStyle: GlassStyle.Clear,
    accentColor: '#070808', // Default to Dark Metal as requested
    materials: [
        { id: '1', name: '色散玻璃 (Colorless Glass)', ratio: 60 },
        { id: '2', name: '哑光银 (Matte Silver)', ratio: 30 },
        { id: '3', name: '暗夜黑金 (Black Metal)', ratio: 10 }
    ]
  });
  
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!config.prompt.trim() && !config.referenceImage) {
      setError("请输入插画主题或上传参考图。");
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const imageUrls = await generateNanoBananaIllustration(config);
      if (imageUrls.length > 0) {
        const newImages: GeneratedImage[] = imageUrls.map(url => ({
            id: Math.random().toString(36).substr(2, 9),
            url: url,
            prompt: config.prompt,
            createdAt: Date.now(),
            config: { ...config } // Clone config snapshot
        }));
        setGeneratedImages(prev => [...newImages, ...prev]);
      } else {
        setError("生成失败，模型未返回数据。请检查网络或减少数量。");
      }
    } catch (err: any) {
      setError(err.message || "生成过程中发生意外错误。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
      if (window.confirm("确定要清空所有生成历史记录吗？")) {
        setGeneratedImages([]);
        setConfig(prev => ({ ...prev, prompt: '' }));
      }
  }

  const handleRemix = (image: GeneratedImage) => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Set config based on the image, but use the image itself as the reference
    setConfig({
        ...image.config,
        referenceImage: image.url, // Crucial: Use the generated result as the base
        prompt: image.prompt // Keep the prompt so they can edit it
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleGenerate();
    }
  }

  return (
    <div className="min-h-screen bg-[#070808] text-slate-200 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
        
        {/* Left Column: Input & Controls */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full overflow-hidden">
          
          {/* Prompt Input Area */}
          <div className="bg-[#070808] rounded-xl border border-slate-800 p-4 shadow-lg shrink-0">
            <div className="flex justify-between items-center mb-2">
                <label className="block text-[#00b7d0] font-medium flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4" />
                主题 / 描述
                </label>
                {config.referenceImage && (
                    <span className="text-[10px] bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 flex items-center gap-1">
                        <Wand2 className="w-3 h-3" /> 修改模式
                    </span>
                )}
            </div>
            <textarea
              value={config.prompt}
              onChange={(e) => setConfig(prev => ({ ...prev, prompt: e.target.value }))}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder="例如：一个悬浮的几何球体，纯净..."
              className="w-full h-24 bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm text-white placeholder-slate-600 focus:ring-1 focus:ring-[#00b7d0] focus:border-[#00b7d0] outline-none resize-none transition-all"
            />
          </div>

          {/* Settings Panel - Scrollable */}
          <div className="flex-1 min-h-0">
            <Controls 
                config={config} 
                setConfig={setConfig} 
                isGenerating={isGenerating}
            />
          </div>

          {/* Generate Button - Fixed at bottom of column */}
          <div className="shrink-0">
            <button
                onClick={handleGenerate}
                disabled={isGenerating || (!config.prompt.trim() && !config.referenceImage)}
                className={`w-full py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-[0.98] ${
                isGenerating || (!config.prompt.trim() && !config.referenceImage)
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-[#00b7d0] to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black hover:shadow-[#00b7d0]/30 shadow-cyan-900/20'
                }`}
            >
                {isGenerating ? (
                <>处理中 ({config.imageCount}张)...</>
                ) : (
                <>
                    {config.referenceImage ? '基于参考图生成' : '生成插画'} <ArrowRight className="w-5 h-5" />
                </>
                )}
            </button>

            {error && (
                <div className="mt-2 p-2 bg-red-900/20 border border-red-800/50 rounded-lg text-red-300 text-xs text-center">
                {error}
                </div>
            )}
          </div>
        </div>

        {/* Right Column: Result */}
        <div className="lg:col-span-8 h-full min-h-[400px]">
          <ResultView 
            images={generatedImages} 
            isGenerating={isGenerating}
            onRegenerate={handleGenerate}
            onClear={handleClear}
            onRemix={handleRemix}
          />
        </div>
      </main>
      
      <footer className="hidden md:block py-4 text-center text-slate-700 text-xs border-t border-slate-900/50">
         Google Gemini 2.5 Flash & 3.0 Pro 驱动 • 极简主义材质生成器
      </footer>
    </div>
  );
};

export default App;