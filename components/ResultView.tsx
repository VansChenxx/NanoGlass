
import React, { useState } from 'react';
import { GeneratedImage, BackgroundColor } from '../types';
import { Download, Share2, RefreshCw, X, Maximize2, Search, Trash2, Wand2, Grid, CheckCircle2 } from 'lucide-react';

interface ResultViewProps {
  images: GeneratedImage[];
  isGenerating: boolean;
  onRegenerate: () => void;
  onClear: () => void;
  onRemix: (image: GeneratedImage) => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ images, isGenerating, onRegenerate, onClear, onRemix }) => {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Local state to toggle background for transparent images in lightbox
  // Defaults to 'black' to show the glass effect nicely, but allows 'check' to see cut-out
  const [viewBg, setViewBg] = useState<'check' | 'black' | 'white'>('black');

  const filteredImages = images.filter(img => 
    img.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Advanced download handler that processes the image for transparency if needed
  const handleDownload = async (img: GeneratedImage, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    // If background was set to transparent, we need to remove the black background programmatically
    if (img.config.background === BackgroundColor.Transparent) {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const image = new Image();
            image.crossOrigin = "anonymous";
            image.src = img.url;
            
            await new Promise((resolve, reject) => {
                image.onload = resolve;
                image.onerror = reject;
            });
            
            canvas.width = image.width;
            canvas.height = image.height;
            if (!ctx) return;
            
            ctx.drawImage(image, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // "Screen" Mode removal + Thresholding for solid parts
            // We assume prompt created a PURE BLACK background (#000000)
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Max brightness determines opacity for glass on black (Screen Blend Mode Logic)
                const maxVal = Math.max(r, g, b);
                
                // If it's pure black, alpha is 0.
                // If it's bright, alpha is high.
                // However, for "Solid" parts (white plaster, silver), they are also bright.
                // This logic works well for Glass+Solid on Black because:
                // 1. Black bg -> Alpha 0
                // 2. White Plaster -> Alpha 255 (Keep White)
                // 3. Glass -> Alpha varies (Semi-transparent)
                
                // We apply a curve to ensure solid parts remain solid and very dark glass parts don't disappear completely if they have color
                
                // Simple Screen Alpha: Alpha = max(r,g,b). 
                // Color = Color / Alpha (unpremultiply) -- but since we want additive look, we can keep color values or normalize.
                // For standard PNG export, we often just set Alpha = maxVal.
                
                // Optimization: Ensure near-blacks are removed cleanly
                if (maxVal < 10) {
                     data[i + 3] = 0; // Transparent
                } else {
                     data[i + 3] = maxVal; // Set Alpha based on brightness
                     // To preserve color intensity when alpha is reduced:
                     // NewRGB = OldRGB * (255/Alpha) ... strictly speaking. 
                     // But for "Additive" glass look, keeping RGB is often safer visually than blowing it out.
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
            
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `nanoglass-transparent-${img.createdAt}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (err) {
            console.error("Failed to process transparency", err);
            // Fallback
            const link = document.createElement('a');
            link.href = img.url;
            link.download = `nanoglass-${img.createdAt}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } else {
        // Standard download for Solid backgrounds
        const link = document.createElement('a');
        link.href = img.url;
        link.download = `nanoglass-${img.createdAt}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const handleRemixClick = (img: GeneratedImage) => {
      onRemix(img);
      setSelectedImage(null); // Close lightbox
  };

  const getBackgroundClass = (bgConfig: BackgroundColor, isLightbox = false) => {
      if (bgConfig === BackgroundColor.White) return 'bg-white';
      if (bgConfig === BackgroundColor.Black) return 'bg-black';
      
      // Transparent handling
      if (isLightbox) {
          if (viewBg === 'white') return 'bg-white';
          if (viewBg === 'black') return 'bg-black';
      }
      return 'bg-slate-800'; // Default container for transparent thumbnails
  };
  
  const checkerboardStyle = {
      backgroundImage: 'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)',
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      backgroundColor: '#0f172a'
  };

  // Lightbox View
  if (selectedImage) {
    const isTransparentConfig = selectedImage.config.background === BackgroundColor.Transparent;

    return (
       <div className="flex flex-col gap-4 h-full">
         <div className="flex justify-between items-center px-2">
            <button onClick={() => setSelectedImage(null)} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm">
                <X className="w-4 h-4" /> 返回记录
            </button>
            <div className="flex gap-2">
                 {isTransparentConfig && (
                     <div className="flex bg-slate-800 rounded-lg p-1 mr-2 border border-slate-700">
                         <span className="text-[10px] text-slate-500 flex items-center px-2">预览背景:</span>
                         <button onClick={() => setViewBg('black')} className={`p-1.5 rounded transition-all ${viewBg === 'black' ? 'bg-black text-white ring-1 ring-slate-500' : 'text-slate-400 hover:text-white'}`} title="黑底 (推荐)"><div className="w-4 h-4 bg-black rounded-sm border border-slate-700"></div></button>
                         <button onClick={() => setViewBg('white')} className={`p-1.5 rounded transition-all ${viewBg === 'white' ? 'bg-white text-black ring-1 ring-slate-500' : 'text-slate-400 hover:text-white'}`} title="白底"><div className="w-4 h-4 bg-white rounded-sm"></div></button>
                         <button onClick={() => setViewBg('check')} className={`p-1.5 rounded transition-all ${viewBg === 'check' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`} title="透明网格"><Grid className="w-4 h-4" /></button>
                     </div>
                 )}
                 <button 
                  onClick={() => handleRemixClick(selectedImage)}
                  className="p-2 rounded-lg bg-[#00b7d0]/10 hover:bg-[#00b7d0]/20 text-[#00b7d0] border border-[#00b7d0]/30 flex items-center gap-2 px-4 transition-colors"
                  title="以此为基准修改"
                >
                  <Wand2 className="w-4 h-4" /> 
                  <span className="text-xs font-bold">以此修改 (Remix)</span>
                </button>
                 <button 
                  onClick={(e) => handleDownload(selectedImage, e)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-2 px-4 border border-slate-700 hover:border-slate-500 transition-colors"
                  title={isTransparentConfig ? "下载去背PNG" : "下载原图"}
                >
                  <Download className="w-4 h-4" /> {isTransparentConfig ? "下载去背PNG" : "下载"}
                </button>
            </div>
         </div>
         <div className={`relative rounded-xl overflow-hidden shadow-2xl border border-slate-700 flex-1 flex items-center justify-center bg-[#070808]`}>
            {/* Background Layer */}
            <div 
                className={`w-full h-full absolute inset-0 ${getBackgroundClass(selectedImage.config.background, true)}`}
                style={isTransparentConfig && viewBg === 'check' ? checkerboardStyle : {}}
            ></div>
            
            {/* 
                For transparent images in 'check' or 'white' view mode, we ideally use a CSS mix-blend-mode 
                to simulate the alpha removal visually, OR just show the raw black image if blend mode is tricky without canvas.
                For now, 'screen' blend mode works decently to simulate transparency on white/checkers for a black-bg image.
            */}
            <img 
              src={selectedImage.url} 
              alt={selectedImage.prompt} 
              className={`relative max-w-full max-h-full object-contain p-4 shadow-2xl z-10 transition-all duration-500 ${isTransparentConfig && viewBg !== 'black' ? 'mix-blend-screen' : ''}`} 
            />
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm max-w-[80%] text-center border border-white/10 z-20">
              {selectedImage.prompt}
            </div>
         </div>
       </div>
    )
  }

  // Empty State
  if (images.length === 0 && !isGenerating) {
    return (
      <div className="w-full h-full min-h-[400px] rounded-xl bg-slate-900/20 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600 p-8">
        <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4">
          <Share2 className="w-8 h-8 opacity-50 text-[#00b7d0]" />
        </div>
        <p className="text-lg font-medium text-slate-400">生成记录空空如也</p>
        <p className="text-sm opacity-50 mt-2 max-w-xs text-center">
          在左侧输入描述，生成的插画将自动保存在这里。
        </p>
      </div>
    );
  }

  // Grid View
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header Bar */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
        <div className="flex items-center gap-3">
          <h3 className="text-slate-300 font-medium text-sm uppercase tracking-wide px-2">历史记录 ({images.length})</h3>
          <div className="relative group">
            <Search className="w-4 h-4 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="查找描述..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/50 border border-slate-700 rounded-md py-1 pl-8 pr-2 text-xs text-white placeholder-slate-600 focus:border-[#00b7d0] outline-none w-32 focus:w-48 transition-all"
            />
          </div>
        </div>
        <div className="flex gap-2">
            <button 
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 px-3 py-1 rounded hover:bg-red-950/30 transition-colors"
            title="清空历史"
            >
            <Trash2 className="w-3 h-3" />
            清空
            </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto custom-scrollbar pr-2 pb-4 content-start flex-1">
        
        {/* Loading Placeholder Cards */}
        {isGenerating && (
           <>
             {[1, 2].map((i) => (
               <div key={`loading-${i}`} className="aspect-square rounded-lg bg-slate-900/50 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-tr from-[#00b7d0]/10 via-transparent to-purple-900/10 animate-pulse"></div>
                 <div className="w-8 h-8 border-2 border-[#00b7d0]/30 border-t-[#00b7d0] rounded-full animate-spin"></div>
                 <span className="text-xs text-[#00b7d0] mt-2 font-mono animate-pulse">GENERATING</span>
               </div>
             ))}
           </>
        )}

        {/* Image Grid */}
        {filteredImages.map((img) => (
          <div 
            key={img.id} 
            className={`group relative aspect-square rounded-lg overflow-hidden border border-slate-800 cursor-pointer transition-all hover:border-[#00b7d0]/50 hover:shadow-lg hover:shadow-[#00b7d0]/20 ${getBackgroundClass(img.config.background)}`}
            style={img.config.background === BackgroundColor.Transparent ? checkerboardStyle : {}}
            onClick={() => { setSelectedImage(img); setViewBg('black'); }} // Default to black view for best glass fidelity
          >
            <img 
              src={img.url} 
              alt={img.prompt} 
              loading="lazy"
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 relative z-10 ${img.config.background === BackgroundColor.Transparent ? 'mix-blend-screen' : ''}`}
            />
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px] z-20">
                <button 
                 onClick={(e) => { e.stopPropagation(); handleRemixClick(img); }}
                 className="p-2 bg-white/10 hover:bg-[#00b7d0] hover:text-white rounded-full text-white backdrop-blur-md transition-all hover:scale-110"
                 title="以此修改"
               >
                 <Wand2 className="w-4 h-4" />
               </button>
               <button 
                 onClick={(e) => handleDownload(img, e)}
                 className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-transform hover:scale-110"
                 title={img.config.background === BackgroundColor.Transparent ? "下载去背PNG" : "下载"}
               >
                 <Download className="w-4 h-4" />
               </button>
            </div>

            {/* Info Badge */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                <p className="text-[10px] text-slate-300 truncate font-mono">{img.prompt}</p>
            </div>
            
            {/* Corner Badge for Transparent */}
            {img.config.background === BackgroundColor.Transparent && (
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm p-1 rounded text-white z-20 border border-white/10">
                    <Grid className="w-3 h-3" />
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
