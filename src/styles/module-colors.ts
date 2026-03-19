/**
 * Module Color System
 * Subtle accent colors for each Vektrus module based on Tool Hub colors
 * Maintains Vektrus blue/white dominance while providing visual navigation cues
 */

export interface ModuleColors {
  primary: string;
  primaryLight: string;
  primaryVeryLight: string;
  accent: string;
  accentLight: string;
  accentVeryLight: string;
  border: string;
  borderLight: string;
  hoverBg: string;
  focusRing: string;
  gradient: string;
  gradientSubtle: string;
}

export const moduleColors: Record<string, ModuleColors> = {
  /**
   * dashboard — Vektrus Blue as primary.
   * The central hub uses the core brand color directly.
   * Previously the sidebar was incorrectly using 'chat' colors here.
   */
  dashboard: {
    primary: '#49B7E3',
    primaryLight: '#6AC9EF',
    primaryVeryLight: '#E6F6FB',
    accent: '#3A9FD1',
    accentLight: '#B6EBF7',
    accentVeryLight: '#F0F9FD',
    border: '#6AC9EF',
    borderLight: '#B6EBF7',
    hoverBg: 'rgba(73, 183, 227, 0.06)',
    focusRing: 'rgba(73, 183, 227, 0.2)',
    gradient: 'linear-gradient(135deg, #49B7E3 0%, #3A9FD1 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(73, 183, 227, 0.04) 0%, rgba(58, 159, 209, 0.04) 100%)',
  },
  /**
   * toolhub — Vektrus Blue as primary.
   * The tool gateway uses the core brand color.
   * Previously the sidebar was using dashboard (chat) colors here.
   */
  toolhub: {
    primary: '#49B7E3',
    primaryLight: '#6AC9EF',
    primaryVeryLight: '#E6F6FB',
    accent: '#3A9FD1',
    accentLight: '#B6EBF7',
    accentVeryLight: '#F0F9FD',
    border: '#6AC9EF',
    borderLight: '#B6EBF7',
    hoverBg: 'rgba(73, 183, 227, 0.06)',
    focusRing: 'rgba(73, 183, 227, 0.2)',
    gradient: 'linear-gradient(135deg, #49B7E3 0%, #3A9FD1 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(73, 183, 227, 0.04) 0%, rgba(58, 159, 209, 0.04) 100%)',
  },
  /**
   * brand — Warm amber/sienna palette.
   * Brand Studio evokes creativity and identity — a warm, crafted tone
   * that connects to the Warm Peach end of the Vektrus Pulse Gradient.
   * Not aggressive orange — calm, refined.
   */
  brand: {
    primary: '#C08B5A',
    primaryLight: '#D0A878',
    primaryVeryLight: '#FAF4ED',
    accent: '#A87340',
    accentLight: '#EADCC8',
    accentVeryLight: '#FDF9F4',
    border: '#D0A878',
    borderLight: '#EADCC8',
    hoverBg: 'rgba(192, 139, 90, 0.05)',
    focusRing: 'rgba(192, 139, 90, 0.2)',
    gradient: 'linear-gradient(135deg, #C08B5A 0%, #A87340 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(192, 139, 90, 0.05) 0%, rgba(168, 115, 64, 0.05) 100%)',
  },
  /**
   * help — Calm steel blue.
   * Support / Help should feel approachable, neutral, clearly separate
   * from the primary Vektrus Blue to signal a different context.
   */
  help: {
    primary: '#5B8DB8',
    primaryLight: '#7EAAD0',
    primaryVeryLight: '#EBF3FA',
    accent: '#4477A1',
    accentLight: '#C2D9EB',
    accentVeryLight: '#F3F8FD',
    border: '#7EAAD0',
    borderLight: '#C2D9EB',
    hoverBg: 'rgba(91, 141, 184, 0.05)',
    focusRing: 'rgba(91, 141, 184, 0.2)',
    gradient: 'linear-gradient(135deg, #5B8DB8 0%, #4477A1 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(91, 141, 184, 0.05) 0%, rgba(68, 119, 161, 0.05) 100%)',
  },
  chat: {
    primary: '#00CED1',
    primaryLight: '#4DD8DB',
    primaryVeryLight: '#E0F7F8',
    accent: '#00BCD4',
    accentLight: '#B2EBF2',
    accentVeryLight: '#F0FBFC',
    border: '#4DD8DB',
    borderLight: '#B2EBF2',
    hoverBg: 'rgba(77, 216, 219, 0.05)',
    focusRing: 'rgba(0, 206, 209, 0.2)',
    gradient: 'linear-gradient(135deg, #00CED1 0%, #00BCD4 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(0, 206, 209, 0.05) 0%, rgba(0, 188, 212, 0.05) 100%)',
  },
  planner: {
    primary: '#4169E1',
    primaryLight: '#6A8BED',
    primaryVeryLight: '#E6EEFA',
    accent: '#1E90FF',
    accentLight: '#B3D1FF',
    accentVeryLight: '#F0F5FF',
    border: '#6A8BED',
    borderLight: '#B3D1FF',
    hoverBg: 'rgba(106, 139, 237, 0.05)',
    focusRing: 'rgba(65, 105, 225, 0.2)',
    gradient: 'linear-gradient(135deg, #4169E1 0%, #1E90FF 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(65, 105, 225, 0.05) 0%, rgba(30, 144, 255, 0.05) 100%)',
  },
  insights: {
    primary: '#9D4EDD',
    primaryLight: '#B87EE6',
    primaryVeryLight: '#F3E8FB',
    accent: '#7B2CBF',
    accentLight: '#D7B8F3',
    accentVeryLight: '#F9F2FE',
    border: '#B87EE6',
    borderLight: '#D7B8F3',
    hoverBg: 'rgba(184, 126, 230, 0.05)',
    focusRing: 'rgba(157, 78, 221, 0.2)',
    gradient: 'linear-gradient(135deg, #9D4EDD 0%, #7B2CBF 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(157, 78, 221, 0.05) 0%, rgba(123, 44, 191, 0.05) 100%)',
  },
  vision: {
    primary: '#EC4899',
    primaryLight: '#F472B6',
    primaryVeryLight: '#FCE7F3',
    accent: '#DB2777',
    accentLight: '#FBCFE8',
    accentVeryLight: '#FDF2F8',
    border: '#F472B6',
    borderLight: '#FBCFE8',
    hoverBg: 'rgba(244, 114, 182, 0.05)',
    focusRing: 'rgba(236, 72, 153, 0.2)',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(219, 39, 119, 0.05) 100%)',
  },
  media: {
    primary: '#FFB627',
    primaryLight: '#FFC857',
    primaryVeryLight: '#FFF5E0',
    accent: '#FF9E00',
    accentLight: '#FFE4B3',
    accentVeryLight: '#FFF9F0',
    border: '#FFC857',
    borderLight: '#FFE4B3',
    hoverBg: 'rgba(255, 200, 87, 0.05)',
    focusRing: 'rgba(255, 182, 39, 0.2)',
    gradient: 'linear-gradient(135deg, #FFB627 0%, #FF9E00 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(255, 182, 39, 0.05) 0%, rgba(255, 158, 0, 0.05) 100%)',
  },
  pulse: {
    primary: '#49B7E3',
    primaryLight: '#6AC9EF',
    primaryVeryLight: '#E6F6FB',
    accent: '#49B7E3',
    accentLight: '#B6EBF7',
    accentVeryLight: '#F0F9FD',
    border: '#6AC9EF',
    borderLight: '#B6EBF7',
    hoverBg: 'rgba(73, 183, 227, 0.08)',
    focusRing: 'rgba(73, 183, 227, 0.2)',
    gradient: 'linear-gradient(135deg, #49B7E3 0%, #3A9FD1 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(73, 183, 227, 0.05) 0%, rgba(58, 159, 209, 0.05) 100%)',
  },
  profile: {
    primary: '#6366F1',
    primaryLight: '#8B8DFF',
    primaryVeryLight: '#EDEDFF',
    accent: '#4F46E5',
    accentLight: '#C7C7FF',
    accentVeryLight: '#F5F5FF',
    border: '#8B8DFF',
    borderLight: '#C7C7FF',
    hoverBg: 'rgba(139, 141, 255, 0.05)',
    focusRing: 'rgba(99, 102, 241, 0.2)',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(79, 70, 229, 0.05) 100%)',
  },
};

/**
 * Get module colors with fallback to default Vektrus colors
 */
export const getModuleColors = (module: string): ModuleColors => {
  return moduleColors[module] || {
    primary: '#49B7E3',
    primaryLight: '#6AC9EF',
    primaryVeryLight: '#E6F6FB',
    accent: '#49D69E',
    accentLight: '#B4E8D5',
    accentVeryLight: '#F0FAF6',
    border: '#B6EBF7',
    borderLight: '#D9F4FB',
    hoverBg: 'rgba(73, 183, 227, 0.05)',
    focusRing: 'rgba(73, 183, 227, 0.2)',
    gradient: 'linear-gradient(135deg, #49B7E3 0%, #49D69E 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(73, 183, 227, 0.05) 0%, rgba(73, 214, 158, 0.05) 100%)',
  };
};
