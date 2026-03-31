import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useModuleColors } from '../../hooks/useModuleColors';

interface ModuleButtonProps {
  /** Target module for color theming */
  module: 'chat' | 'planner' | 'insights' | 'studio' | 'vision' | 'media' | 'profile';
  /** Button text */
  children: React.ReactNode;
  /** Button icon */
  icon?: LucideIcon;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Click handler */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * ModuleButton - Intelligent button that adapts colors based on target module
 * Perfect for cross-module actions like "Transfer to Planner" in Chat
 */
const ModuleButton: React.FC<ModuleButtonProps> = ({
  module,
  children,
  icon: Icon,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  fullWidth = false,
  className = '',
}) => {
  const colors = useModuleColors(module);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const baseClasses = `
    inline-flex items-center justify-center space-x-2 rounded-[var(--vektrus-radius-md)] font-semibold
    transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50
    ${fullWidth ? 'w-full' : ''}
    ${sizeClasses[size]}
    ${className}
  `;

  const getVariantStyles = () => {
    if (disabled) {
      return {
        backgroundColor: '#E5E7EB',
        color: '#9CA3AF',
        border: 'none',
      };
    }

    switch (variant) {
      case 'primary':
        return {
          background: colors.gradient,
          color: 'white',
          border: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        };

      case 'secondary':
        return {
          backgroundColor: colors.primaryVeryLight,
          color: colors.primary,
          border: `2px solid ${colors.borderLight}`,
        };

      case 'outline':
        return {
          backgroundColor: 'white',
          color: colors.primary,
          border: `2px solid ${colors.border}`,
        };

      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: colors.primary,
          border: 'none',
        };

      default:
        return {};
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    switch (variant) {
      case 'primary':
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
        break;
      case 'secondary':
        e.currentTarget.style.borderColor = colors.border;
        e.currentTarget.style.backgroundColor = colors.accentLight + '40';
        break;
      case 'outline':
        e.currentTarget.style.backgroundColor = colors.primaryVeryLight;
        e.currentTarget.style.borderColor = colors.primary;
        break;
      case 'ghost':
        e.currentTarget.style.backgroundColor = colors.primaryVeryLight;
        break;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    const originalStyles = getVariantStyles();
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = originalStyles.boxShadow || '';
    e.currentTarget.style.backgroundColor = originalStyles.backgroundColor || '';
    e.currentTarget.style.borderColor = (originalStyles.border as string)?.split(' ')[2] || '';
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
      style={getVariantStyles()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span>{children}</span>
    </button>
  );
};

export default ModuleButton;
