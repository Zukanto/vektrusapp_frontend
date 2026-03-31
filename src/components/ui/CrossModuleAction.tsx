import React from 'react';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { useModuleColors } from '../../hooks/useModuleColors';
import ModuleBadge from './ModuleBadge';

interface CrossModuleActionProps {
  /** Source module (current) */
  sourceModule: 'chat' | 'planner' | 'insights' | 'studio' | 'vision' | 'media' | 'profile';
  /** Target module (destination) */
  targetModule: 'chat' | 'planner' | 'insights' | 'studio' | 'vision' | 'media' | 'profile';
  /** Action title */
  title: string;
  /** Action description */
  description?: string;
  /** Custom icon */
  icon?: LucideIcon;
  /** Click handler */
  onClick: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Show module flow (source → target) */
  showFlow?: boolean;
  className?: string;
}

/**
 * CrossModuleAction - Branded action card for cross-module workflows
 * Example: "Transfer to Planner" in Chat shows Chat → Planner with colors
 */
const CrossModuleAction: React.FC<CrossModuleActionProps> = ({
  sourceModule,
  targetModule,
  title,
  description,
  icon: CustomIcon,
  onClick,
  disabled = false,
  showFlow = true,
  className = '',
}) => {
  const sourceColors = useModuleColors(sourceModule);
  const targetColors = useModuleColors(targetModule);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full text-left p-4 rounded-[var(--vektrus-radius-md)] transition-all duration-200
        border-2 bg-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        borderColor: disabled ? '#E5E7EB' : targetColors.border,
        background: disabled
          ? '#F9FAFB'
          : `linear-gradient(135deg, ${sourceColors.primaryVeryLight} 0%, ${targetColors.primaryVeryLight} 100%)`,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = targetColors.primary;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = targetColors.border;
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          {/* Icon Box with Target Module Color */}
          <div
            className="w-12 h-12 rounded-[var(--vektrus-radius-md)] flex items-center justify-center shadow-sm flex-shrink-0"
            style={{
              background: targetColors.gradient,
            }}
          >
            {CustomIcon ? (
              <CustomIcon className="w-6 h-6 text-white" />
            ) : (
              <ArrowRight className="w-6 h-6 text-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4
              className="font-bold text-base mb-1"
              style={{ color: targetColors.primary }}
            >
              {title}
            </h4>
            {description && (
              <p className="text-sm text-[#7A7A7A] leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Module Flow Indicator */}
      {showFlow && (
        <div className="flex items-center space-x-2 mt-3 pt-3 border-t" style={{ borderColor: targetColors.borderLight }}>
          <ModuleBadge module={sourceModule} size="sm" variant="subtle" showLabel={true} />
          <ArrowRight className="w-4 h-4" style={{ color: targetColors.primary }} />
          <ModuleBadge module={targetModule} size="sm" variant="solid" showLabel={true} />
        </div>
      )}
    </button>
  );
};

export default CrossModuleAction;
