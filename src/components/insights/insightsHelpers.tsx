import React from 'react';

export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

export const PLATFORM_CONFIG: Record<string, { label: string; color: string }> = {
  instagram: { label: 'Instagram', color: '#E1306C' },
  linkedin: { label: 'LinkedIn', color: '#0077B5' },
  facebook: { label: 'Facebook', color: '#1877F2' },
  tiktok: { label: 'TikTok', color: '#000000' },
  twitter: { label: 'Twitter', color: '#1DA1F2' },
  youtube: { label: 'YouTube', color: '#FF0000' },
};

export const FORMAT_LABELS: Record<string, string> = {
  text_only: 'Text',
  single_image: 'Image',
  carousel: 'Carousel',
  reel_video: 'Video',
};

export const TIER_CONFIG = {
  high: { dot: '#49D69E', text: '#2BA872', label: 'high' },
  medium: { dot: '#F4BE9D', text: '#C4854A', label: 'medium' },
  low: { dot: '#FA7E70', text: '#D4574A', label: 'low' },
};

export const InsightCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className = '', style }) => (
  <div
    className={`bg-white rounded-[var(--vektrus-radius-lg)] ${className}`}
    style={{ padding: 24, boxShadow: 'var(--vektrus-shadow-subtle)', ...style }}
  >
    {children}
  </div>
);

export const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="flex items-baseline justify-between mb-5">
    <h2
      className="font-semibold"
      style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontSize: 18, color: '#111111' }}
    >
      {title}
    </h2>
    {subtitle && (
      <span
        className="text-[13px]"
        style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#7A7A7A' }}
      >
        {subtitle}
      </span>
    )}
  </div>
);

export const PlatformDot: React.FC<{ platform: string; size?: number }> = ({ platform, size = 8 }) => {
  const color = PLATFORM_CONFIG[platform]?.color || '#7A7A7A';
  return (
    <span
      className="inline-block rounded-full flex-shrink-0"
      style={{ width: size, height: size, background: color }}
    />
  );
};
