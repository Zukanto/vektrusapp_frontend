import React from 'react';
import { Video, Sparkles, FlaskConical } from 'lucide-react';

interface VisionHeaderProps {
  onStartCreator: () => void;
}

const VisionHeader: React.FC<VisionHeaderProps> = ({ onStartCreator }) => {
  return (
    <div className="px-8 pt-8 pb-0">
      <div className="max-w-[1240px] mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 rounded-[var(--vektrus-radius-md)] bg-[var(--vektrus-ai-violet)] flex items-center justify-center rotate-3 shadow-card">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-[#111111]">Vektrus Vision</h1>
                <span className="bg-amber-100 text-amber-700 text-xs font-semibold rounded-full px-2 py-0.5">
                  Demo
                </span>
              </div>
              <p className="text-[#7A7A7A] text-sm mt-0.5">
                Erstelle Bilder und Videos aus Referenzen &amp; Prompts &ndash; direkt in Vektrus
              </p>
            </div>
          </div>
          <button
            onClick={onStartCreator}
            className="flex items-center space-x-2 px-6 py-3 bg-[var(--vektrus-ai-violet)] text-white rounded-[var(--vektrus-radius-md)] font-semibold shadow-card hover:shadow-elevated transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Vision Creator starten</span>
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-[var(--vektrus-radius-md)] p-4 flex items-start space-x-3">
          <FlaskConical className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Vektrus Vision befindet sich aktuell in der Entwicklung. Dies ist eine fr&uuml;he
            Demo-Version &ndash; wir freuen uns &uuml;ber dein Feedback im Tool Hub!
          </p>
        </div>
      </div>
    </div>
  );
};

export default VisionHeader;
