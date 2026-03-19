import { useMemo } from 'react';
import { getModuleColors, ModuleColors } from '../styles/module-colors';

/**
 * Hook to get module-specific colors for subtle branding
 * Maintains Vektrus blue/white dominance while providing navigation cues
 */
export const useModuleColors = (module: string): ModuleColors => {
  return useMemo(() => getModuleColors(module), [module]);
};

/**
 * Helper to generate inline styles with module colors
 */
export const useModuleStyle = (module: string) => {
  const colors = useModuleColors(module);

  return {
    accentBorder: {
      borderColor: colors.borderLight,
    },
    accentBackground: {
      background: colors.gradientSubtle,
    },
    accentButton: {
      background: colors.gradient,
    },
    subtleHighlight: {
      backgroundColor: colors.primaryVeryLight,
      borderColor: colors.borderLight,
    },
    focusRing: {
      boxShadow: `0 0 0 3px ${colors.focusRing}`,
    },
  };
};
