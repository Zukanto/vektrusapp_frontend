import React from 'react';

interface ChatIconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

/**
 * Custom Chat icon — two overlapping network nodes with a speech bubble tip.
 * Matches Lucide conventions: 24x24 viewBox, stroke-based, currentColor.
 */
export const ChatIcon: React.FC<ChatIconProps> = ({
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
    {/* Upper-left node */}
    <circle cx="9" cy="8" r="3.5" />
    {/* Lower-right node (overlapping) */}
    <circle cx="15" cy="13" r="3.5" />
    {/* Connection line between nodes */}
    <line x1="11.5" y1="10.5" x2="12.5" y2="11.5" />
    {/* Speech bubble tip */}
    <polyline points="17.5 15.5 19 18 16 16.5" />
  </svg>
);
