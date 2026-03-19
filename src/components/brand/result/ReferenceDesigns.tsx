import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ReferenceImage } from '../types';

interface ReferenceDesignsProps {
  images: ReferenceImage[];
}

const ReferenceDesigns: React.FC<ReferenceDesignsProps> = ({ images }) => {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="rounded-[var(--vektrus-radius-lg)] bg-white border border-[rgba(73,183,227,0.18)] p-6 shadow-card">
        <h3 className="text-base font-semibold text-[#111111] mb-5">
          Analysierte Designs ({images.length})
        </h3>
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setLightboxUrl(img.url)}
              className="group flex flex-col items-center gap-1.5 text-left"
            >
              <div className="w-16 h-16 rounded-[var(--vektrus-radius-md)] overflow-hidden border border-[rgba(73,183,227,0.18)] group-hover:border-[#49B7E3] transition-all">
                <img
                  src={img.url}
                  alt={`Design ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs text-[#7A7A7A]">{img.platform}</span>
            </button>
          ))}
        </div>
      </div>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxUrl}
              alt="Design preview"
              className="max-w-full max-h-[80vh] object-contain rounded-[var(--vektrus-radius-lg)]"
            />
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ReferenceDesigns;
