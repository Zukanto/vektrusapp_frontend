import React, { useEffect, useState } from 'react';
import { Loader2, Search, FileText, Image, Sparkles, Globe, Pencil, BarChart3 } from 'lucide-react';

export interface WorkflowStep {
  id: string;
  label: string;
  icon: 'search' | 'text' | 'image' | 'analytics' | 'pencil' | 'globe' | 'sparkles';
  status: 'pending' | 'active' | 'completed' | 'error';
  message?: string;
}

interface WorkflowStatusMessageProps {
  steps: WorkflowStep[];
  currentStepId?: string;
  overallMessage?: string;
}

const iconMap = {
  search: Search,
  text: FileText,
  image: Image,
  analytics: BarChart3,
  pencil: Pencil,
  globe: Globe,
  sparkles: Sparkles
};

const WorkflowStatusMessage: React.FC<WorkflowStatusMessageProps> = ({
  steps,
  currentStepId,
  overallMessage = 'Vektrus arbeitet für dich...'
}) => {
  const [dots, setDots] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [currentStepId]);

  const activeStep = steps.find(s => s.id === currentStepId) || steps.find(s => s.status === 'active');
  const ActiveIcon = activeStep ? iconMap[activeStep.icon] || Sparkles : Sparkles;
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <div className="flex items-start space-x-3">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#49D69E] to-[#49B7E3] rounded-full blur-md opacity-50 animate-pulse"></div>
          <div className="relative w-10 h-10 bg-gradient-to-br from-[#49D69E] to-[#49B7E3] rounded-full flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 text-sm text-[#111111] font-semibold mb-2">
            <Sparkles className="w-4 h-4 text-[#49B7E3] animate-pulse" />
            <span>{overallMessage}</span>
          </div>

          {activeStep && (
            <div
              className={`
                bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] p-4
                transition-all duration-300 ease-out
                ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
              `}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#49B7E3]/10 to-[#49D69E]/10 rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
                    <ActiveIcon className="w-5 h-5 text-[#49B7E3] animate-pulse" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-base font-medium text-[#111111] leading-relaxed">
                    {activeStep.message || activeStep.label}
                    <span className="inline-block w-4 text-[#49B7E3]">{dots}</span>
                  </div>
                </div>

                <div className="flex space-x-1 flex-shrink-0">
                  <div className="w-1.5 h-1.5 bg-[#49B7E3] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-[#49B7E3] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-[#49B7E3] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#7A7A7A]">
              <span className="font-medium">Fortschritt</span>
              <span>{completedCount} von {steps.length} Schritten</span>
            </div>

            <div className="h-1.5 bg-[#F4FCFE] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#49D69E] to-[#49B7E3] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowStatusMessage;
