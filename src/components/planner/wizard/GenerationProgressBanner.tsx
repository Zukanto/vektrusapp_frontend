import React, { useEffect, useState } from 'react';
import { CircleCheck as CheckCircle } from 'lucide-react';

interface GenerationProgressBannerProps {
  status: 'processing' | 'completed' | 'timeout';
  currentPosts: number;
  totalPosts: number;
}

const GenerationProgressBanner: React.FC<GenerationProgressBannerProps> = ({
  status,
  currentPosts,
  totalPosts,
}) => {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (status === 'completed') {
      const timer = setTimeout(() => setFading(true), 3500);
      const hideTimer = setTimeout(() => setVisible(false), 5000);
      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, [status]);

  if (!visible) return null;

  if (status === 'processing') {
    return (
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--vektrus-radius-md)] mb-4 border"
        style={{
          backgroundColor: 'rgba(73, 183, 227, 0.08)',
          borderColor: 'rgba(73, 183, 227, 0.25)',
        }}
      >
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{
            backgroundColor: '#7C6CF2',
            animation: 'pulse-dot 2s ease-in-out infinite',
          }}
        />
        {/* Keyframe pulse-dot in index.css */}
        <span className="text-[13px] font-medium" style={{ color: '#49B7E3' }}>
          Inhalte werden generiert...
          {totalPosts > 0 && (
            <span className="font-normal ml-1" style={{ color: '#7A7A7A' }}>
              ({currentPosts} von {totalPosts} Posts fertig)
            </span>
          )}
        </span>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--vektrus-radius-md)] mb-4 border transition-opacity duration-700"
        style={{
          backgroundColor: 'rgba(73, 214, 158, 0.08)',
          borderColor: 'rgba(73, 214, 158, 0.3)',
          opacity: fading ? 0 : 1,
        }}
      >
        <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#49D69E' }} />
        <span className="text-[13px] font-medium" style={{ color: '#49D69E' }}>
          Alle Inhalte wurden generiert
        </span>
      </div>
    );
  }

  if (status === 'timeout') {
    return (
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--vektrus-radius-md)] mb-4 border"
        style={{
          backgroundColor: 'rgba(244, 190, 157, 0.1)',
          borderColor: 'rgba(244, 190, 157, 0.4)',
        }}
      >
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: '#F4BE9D' }}
        />
        <span className="text-[13px]" style={{ color: '#7A7A7A' }}>
          Die Generierung dauert länger als erwartet. Die bisher erstellten Inhalte werden angezeigt.
        </span>
      </div>
    );
  }

  return null;
};

export default GenerationProgressBanner;
