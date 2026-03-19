import React from 'react';
import { Sparkles } from 'lucide-react';

const DISMISSED_KEY = 'vektrus_brand_nudge_dismissed';

export function isBrandNudgeDismissed(): boolean {
  return localStorage.getItem(DISMISSED_KEY) === 'true';
}

export function dismissBrandNudge(): void {
  localStorage.setItem(DISMISSED_KEY, 'true');
}

interface BrandNudgeModalProps {
  onSetupStyle: () => void;
  onSkip: () => void;
}

const BrandNudgeModal: React.FC<BrandNudgeModalProps> = ({ onSetupStyle, onSkip }) => {
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onSkip}
    >
      <div
        className="bg-white rounded-[var(--vektrus-radius-lg)] shadow-modal w-full max-w-sm p-6 flex flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-10 rounded-[var(--vektrus-radius-sm)] bg-[#F4FCFE] flex items-center justify-center mb-4 flex-shrink-0">
          <Sparkles className="w-5 h-5 text-[#49B7E3]" />
        </div>

        <h2 className="font-manrope text-xl font-bold text-[#111111] mb-3 leading-tight">
          Zeig Vektrus deinen Stil
        </h2>

        <p className="text-[15px] text-[#7A7A7A] leading-relaxed mb-6 max-w-[380px]">
          Lade 1–3 Beispiel-Designs hoch — ein Instagram-Post, ein Werbebanner oder eine Produktgrafik. Vektrus erkennt deinen visuellen Stil und passt die KI-Bilder automatisch an.
        </p>

        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onSkip}
            className="flex-1 px-4 py-2.5 rounded-[10px] text-sm font-medium border border-[rgba(73,183,227,0.18)] text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] transition-colors"
          >
            Überspringen
          </button>
          <button
            onClick={onSetupStyle}
            className="flex-1 px-4 py-2.5 rounded-[10px] text-sm font-semibold bg-[#49B7E3] text-white shadow-card hover:shadow-elevated transition-all"
          >
            Stil einrichten
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandNudgeModal;
