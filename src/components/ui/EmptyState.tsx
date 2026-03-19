import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  headline: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ai';
  };
  compact?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, headline, description, action, compact = false }) => {
  const buttonStyles = {
    primary: 'bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111]',
    secondary: 'border border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] text-[#7A7A7A] hover:text-[#111111]',
    ai: 'bg-[var(--vektrus-ai-violet)] hover:opacity-90 text-white',
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8 px-4' : 'py-12 px-6'}`}>
      <div className={`${compact ? 'w-10 h-10' : 'w-14 h-14'} bg-[#F4FCFE] rounded-[var(--vektrus-radius-md)] flex items-center justify-center mb-4 text-[#49B7E3]`}>
        {icon}
      </div>
      <h3 className={`font-semibold text-[#111111] mb-1.5 font-manrope ${compact ? 'text-sm' : 'text-base'}`}>
        {headline}
      </h3>
      {description && (
        <p className={`text-[#7A7A7A] max-w-sm leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}>
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className={`mt-4 px-5 py-2.5 rounded-[var(--vektrus-radius-sm)] font-medium text-sm transition-all duration-200 ${buttonStyles[action.variant || 'primary']}`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
