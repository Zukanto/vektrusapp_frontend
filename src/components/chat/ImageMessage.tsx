import React from 'react';
import { Download, Image as ImageIcon, Sparkles } from 'lucide-react';
import { MediaFile } from './types';

interface ImageMessageProps {
  imageData: MediaFile;
  isAnimating?: boolean;
}

const ImageMessage: React.FC<ImageMessageProps> = ({ imageData, isAnimating }) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(imageData.public_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vektrus-${imageData.id || 'image'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download fehlgeschlagen:', error);
      window.open(imageData.public_url, '_blank');
    }
  };

  return (
    <div className={`space-y-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
      <div className="flex items-center space-x-2 text-sm text-white/90">
        <Sparkles className="w-4 h-4" />
        <span className="font-medium">Dein Bild ist fertig!</span>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#49D69E]/20 to-[#49B7E3]/20 rounded-[var(--vektrus-radius-md)] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div className="relative bg-white/10 backdrop-blur-sm rounded-[var(--vektrus-radius-md)] overflow-hidden border border-white/20 shadow-modal">
          <img
            src={imageData.public_url}
            alt={imageData.generation_prompt}
            className="w-full h-auto max-w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement?.insertAdjacentHTML('beforeend',
                '<div class="flex items-center justify-center h-64 bg-[#F4FCFE] text-gray-400"><svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>'
              );
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>

      <div className="space-y-2">
        {imageData.generation_prompt && (
          <p className="text-xs text-white/70 italic line-clamp-2">
            "{imageData.generation_prompt}"
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50">
            {new Date(imageData.created_at).toLocaleString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>

          <button
            onClick={handleDownload}
            className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-[var(--vektrus-radius-sm)] transition-all duration-200 hover:scale-105 active:scale-95 border border-white/20"
            title="Bild herunterladen"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageMessage;
