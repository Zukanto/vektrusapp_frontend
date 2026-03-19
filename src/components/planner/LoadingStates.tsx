import React from 'react';
import { Loader2 } from 'lucide-react';
import { useModuleColors } from '../../hooks/useModuleColors';

export const SkeletonCard: React.FC = () => {
  const plannerColors = useModuleColors('planner');

  return (
    <div className="bg-white rounded-[var(--vektrus-radius-md)] border p-4 animate-pulse" style={{ borderColor: plannerColors.borderLight }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-4 bg-[#B6EBF7]/20 rounded-[var(--vektrus-radius-sm)] w-3/4 mb-2"></div>
          <div className="h-3 bg-[#B6EBF7]/10 rounded-[var(--vektrus-radius-sm)] w-1/2"></div>
        </div>
        <div className="w-8 h-8 bg-[#B6EBF7]/20 rounded-[var(--vektrus-radius-sm)]"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-[#B6EBF7]/10 rounded-[var(--vektrus-radius-sm)] w-full"></div>
        <div className="h-3 bg-[#B6EBF7]/10 rounded-[var(--vektrus-radius-sm)] w-5/6"></div>
        <div className="h-3 bg-[#B6EBF7]/10 rounded-[var(--vektrus-radius-sm)] w-4/6"></div>
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <div className="h-6 w-16 bg-[#B6EBF7]/20 rounded-full"></div>
        <div className="h-6 w-16 bg-[#B6EBF7]/20 rounded-full"></div>
      </div>
    </div>
  );
};

export const SkeletonWeekView: React.FC = () => {
  const plannerColors = useModuleColors('planner');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 bg-[#B6EBF7]/20 rounded-[var(--vektrus-radius-sm)] w-48 animate-pulse"></div>
        <div className="h-10 w-32 bg-[#B6EBF7]/20 rounded-[var(--vektrus-radius-sm)] animate-pulse"></div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-6 bg-[#B6EBF7]/20 rounded-[var(--vektrus-radius-sm)] animate-pulse"></div>
            <SkeletonCard />
          </div>
        ))}
      </div>
    </div>
  );
};

export const LoadingSpinner: React.FC<{ message?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  message = 'Lädt...',
  size = 'md'
}) => {
  const plannerColors = useModuleColors('planner');

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2
        className={`${sizeClasses[size]} animate-spin mb-3`}
        style={{ color: plannerColors.primary }}
      />
      <p className={`${textSizes[size]} font-medium text-[#7A7A7A]`}>{message}</p>
    </div>
  );
};

export const ProcessingOverlay: React.FC<{
  isVisible: boolean;
  message?: string;
  progress?: number;
}> = ({ isVisible, message = 'Verarbeite...', progress }) => {
  const plannerColors = useModuleColors('planner');

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-[var(--vektrus-radius-lg)] shadow-modal p-8 max-w-sm w-full mx-4">
        <div className="text-center">
          <Loader2
            className="w-12 h-12 mx-auto mb-4 animate-spin"
            style={{ color: plannerColors.primary }}
          />
          <h3 className="text-lg font-bold font-manrope text-[#111111] mb-2">{message}</h3>
          {progress !== undefined && (
            <div className="mt-4">
              <div className="w-full h-2 bg-[#F4FCFE] rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: plannerColors.gradient,
                  }}
                ></div>
              </div>
              <p className="text-xs text-[#7A7A7A] mt-2">{progress}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ButtonLoading: React.FC<{ isLoading: boolean; children: React.ReactNode }> = ({
  isLoading,
  children
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Lädt...</span>
      </div>
    );
  }

  return <>{children}</>;
};
