import React from 'react';
import { Sparkles } from 'lucide-react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-4 duration-500 group">
      <div className="flex items-start space-x-3 max-w-[80%]">
        <div className="relative w-10 h-10">
          <div className="relative w-10 h-10 bg-[#49B7E3] rounded-[var(--vektrus-radius-md)] flex items-center justify-center flex-shrink-0 shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <div className="mb-1">
            <span className="text-xs font-semibold text-[#111111]">Vektrus</span>
          </div>
          <div className="bg-[#49B7E3] text-white rounded-[var(--vektrus-radius-lg)] rounded-tl-[6px] px-5 py-4 shadow-md">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium">Vektrus denkt kurz nach</span>
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;