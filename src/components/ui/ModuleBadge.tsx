import React from 'react';
import { LucideIcon, MessageSquare, Calendar, BarChart3, Sparkles, Image as ImageIcon, User } from 'lucide-react';
import { useModuleColors } from '../../hooks/useModuleColors';

interface ModuleBadgeProps {
  module: 'chat' | 'planner' | 'insights' | 'vision' | 'media' | 'profile';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onClick?: () => void;
  variant?: 'solid' | 'outline' | 'subtle';
  className?: string;
}

const MODULE_CONFIG = {
  chat: {
    label: 'Chat',
    icon: MessageSquare,
  },
  planner: {
    label: 'Planner',
    icon: Calendar,
  },
  insights: {
    label: 'Insights',
    icon: BarChart3,
  },
  vision: {
    label: 'Vision',
    icon: Sparkles,
  },
  media: {
    label: 'Media',
    icon: ImageIcon,
  },
  profile: {
    label: 'Profil',
    icon: User,
  },
};

/**
 * ModuleBadge - Visual indicator for module identity
 * Shows module icon + color, perfect for "source" or "destination" indicators
 */
const ModuleBadge: React.FC<ModuleBadgeProps> = ({
  module,
  size = 'md',
  showLabel = true,
  onClick,
  variant = 'solid',
  className = '',
}) => {
  const colors = useModuleColors(module);
  const config = MODULE_CONFIG[module];
  const Icon = config.icon;

  const sizeConfig = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
      iconBox: 'w-5 h-5',
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      iconBox: 'w-6 h-6',
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      iconBox: 'w-8 h-8',
    },
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'solid':
        return {
          background: colors.gradient,
          color: 'white',
          border: 'none',
        };
      case 'outline':
        return {
          backgroundColor: 'white',
          color: colors.primary,
          border: `2px solid ${colors.border}`,
        };
      case 'subtle':
        return {
          backgroundColor: colors.primaryVeryLight,
          color: colors.primary,
          border: `1px solid ${colors.borderLight}`,
        };
      default:
        return {};
    }
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`
        inline-flex items-center space-x-2 rounded-[var(--vektrus-radius-sm)] font-medium
        transition-all duration-200
        ${sizeConfig[size].container}
        ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-md' : ''}
        ${className}
      `}
      style={getVariantStyles()}
    >
      {variant === 'solid' ? (
        <Icon className={sizeConfig[size].icon} />
      ) : (
        <div
          className={`${sizeConfig[size].iconBox} rounded-[var(--vektrus-radius-sm)] flex items-center justify-center`}
          style={{
            background: variant === 'outline' ? colors.gradient : colors.primaryLight + '30',
          }}
        >
          <Icon className={sizeConfig[size].icon} style={{ color: variant === 'outline' ? 'white' : colors.primary }} />
        </div>
      )}

      {showLabel && <span>{config.label}</span>}
    </Component>
  );
};

export default ModuleBadge;
