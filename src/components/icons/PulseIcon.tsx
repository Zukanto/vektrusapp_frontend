import React from 'react';

interface PulseIconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

/**
 * Custom Pulse icon — a waveform that starts flat, peaks in the middle
 * (through a filled node), and flattens out again.
 * Matches Lucide conventions: 24x24 viewBox, stroke-based, currentColor.
 */
export const PulseIcon: React.FC<PulseIconProps> = ({
  className,
  size = 24,
  strokeWidth = 2,
  style,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    {/* Waveform: flat → rise → peak → fall → flat */}
    <path d="M2 12h3l2 -3 2 5 2 -7 2 9 2 -5 2 3h3" />
    {/* Center node */}
    <circle cx="12" cy="10" r="2.5" fill="currentColor" stroke="none" />
  </svg>
);
