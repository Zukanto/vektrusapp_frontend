import React from 'react';
import { useModuleColors } from '../../hooks/useModuleColors';

interface ModuleWrapperProps {
  module: 'chat' | 'planner' | 'pulse' | 'insights' | 'vision' | 'media' | 'profile' | 'help';
  children: React.ReactNode;
  className?: string;
  showTopAccent?: boolean;
}

/**
 * ModuleWrapper Component
 * Wraps module content with subtle accent colors matching Tool Hub
 * Maintains Vektrus blue/white dominance while providing visual navigation cues
 */
const ModuleWrapper: React.FC<ModuleWrapperProps> = ({
  module,
  children,
  className = '',
  showTopAccent = true,
}) => {
  const colors = useModuleColors(module);

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Module content with CSS variables for consistent theming */}
      <div
        className="flex-1 overflow-auto"
        style={{
          // @ts-ignore - CSS variables
          '--module-primary': colors.primary,
          '--module-primary-light': colors.primaryLight,
          '--module-primary-very-light': colors.primaryVeryLight,
          '--module-accent': colors.accent,
          '--module-accent-light': colors.accentLight,
          '--module-border': colors.border,
          '--module-border-light': colors.borderLight,
          '--module-hover-bg': colors.hoverBg,
          '--module-focus-ring': colors.focusRing,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  );
};

export default ModuleWrapper;
