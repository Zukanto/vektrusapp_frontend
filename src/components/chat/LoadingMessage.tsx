import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface LoadingMessageProps {
  message?: string;
}

const LoadingMessage: React.FC<LoadingMessageProps> = ({
  message = 'Dein Bild wird generiert...'
}) => {
  return (
    <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#49B7E3] to-[var(--vektrus-ai-violet)] rounded-full blur-md opacity-30 animate-pulse"></div>
          <div className="relative w-10 h-10 bg-gradient-to-br from-[#49B7E3] to-[var(--vektrus-ai-violet)] rounded-full flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-2 text-sm text-[#111111] font-medium">
            <Sparkles className="w-4 h-4 text-[var(--vektrus-ai-violet)] animate-pulse" />
            <span>{message}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 ml-[52px]">
        <div className="h-1.5 bg-[rgba(73,183,227,0.18)] rounded-full overflow-hidden">
          <div className="h-full rounded-full animate-pulse"
               style={{ width: '60%', background: 'linear-gradient(90deg, #49B7E3 0%, #7C6CF2 50%, #E8A0D6 100%)' }}></div>
        </div>

        <p className="text-xs text-[#7A7A7A]">
          Das dauert normalerweise 10-30 Sekunden...
        </p>
      </div>

      <div className="flex space-x-1.5 ml-[52px]">
        <div className="w-1.5 h-1.5 bg-[#49B7E3]/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-1.5 h-1.5 bg-[var(--vektrus-ai-violet)]/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-1.5 h-1.5 bg-[#E8A0D6]/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default LoadingMessage;
