import React, { useState, useEffect, useRef } from 'react';
import { Brain, Search, BookOpen, Sparkles, Zap } from 'lucide-react';
import { TextShimmer } from '../ui/text-shimmer';

const AnimatedDots: React.FC = () => (
  <span className="ai-typing-dots ml-1">
    <span className="dot" />
    <span className="dot" />
    <span className="dot" />
  </span>
);

const STATUS_ICONS: Record<string, React.ReactNode> = {
  brain: <Brain className="w-4 h-4 text-[var(--vektrus-ai-violet)]" />,
  search: <Search className="w-4 h-4 text-[var(--vektrus-ai-violet)]" />,
  book: <BookOpen className="w-4 h-4 text-[var(--vektrus-ai-violet)]" />,
  sparkles: <Sparkles className="w-4 h-4 text-[var(--vektrus-ai-violet)]" />,
  zap: <Zap className="w-4 h-4 text-[var(--vektrus-ai-violet)]" />,
};

const PulsingIcon: React.FC<{ iconKey: string }> = ({ iconKey }) => (
  <span style={{ animation: 'vektrus-pulse-icon 1.8s ease-in-out infinite' }}>
    {STATUS_ICONS[iconKey] || STATUS_ICONS.sparkles}
  </span>
);

const STATUS_MESSAGES = [
  { text: 'Vektrus denkt nach', iconKey: 'brain', delay: 0 },
  { text: 'Analysiere deine Anfrage', iconKey: 'search', delay: 2500 },
  { text: 'Durchsuche Wissensdatenbank', iconKey: 'book', delay: 5500 },
  { text: 'Generiere Antwort', iconKey: 'sparkles', delay: 9000 },
  { text: 'Fast fertig', iconKey: 'zap', delay: 14000 },
];

function useStatusRotation(isActive: boolean) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!isActive) {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setCurrentIndex(0);
      return;
    }

    STATUS_MESSAGES.forEach((msg, i) => {
      if (i === 0) return;
      const timer = setTimeout(() => setCurrentIndex(i), msg.delay);
      timers.current.push(timer);
    });

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [isActive]);

  return STATUS_MESSAGES[currentIndex];
}

interface VektrusLoadingBubbleProps {
  isVisible: boolean;
}

const VektrusLoadingBubble: React.FC<VektrusLoadingBubbleProps> = ({ isVisible }) => {
  const status = useStatusRotation(isVisible);

  if (!isVisible) return null;

  return (
    <>
      <div
        className="flex justify-start group"
        style={{ animation: 'vektrus-fade-slide-in 0.3s ease-out' }}
      >
        <div className="max-w-[85%]">
          <div className="flex flex-row gap-3 items-start">
            <div className="w-9 h-9 pulse-gradient-icon rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="rounded-[16px] p-5 chat-ai-card"
              >
                <div className="flex items-center gap-2.5">
                  <PulsingIcon iconKey={status.iconKey} />
                  <TextShimmer
                    duration={1.5}
                    className="text-sm font-medium [--base-color:theme(colors.gray.500)] [--base-gradient-color:#7C6CF2] dark:[--base-color:theme(colors.gray.400)] dark:[--base-gradient-color:#9B8BFF]"
                  >
                    {status.text}
                  </TextShimmer>
                  <AnimatedDots />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VektrusLoadingBubble;
