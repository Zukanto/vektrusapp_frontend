import React from 'react';

interface SocialIconProps {
  platform: string;
  size?: number;
  className?: string;
  branded?: boolean;
}

const icons: Record<string, (size: number, branded: boolean) => React.ReactNode> = {
  instagram: (size, branded) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {branded && (
        <defs>
          <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
            <stop offset="0%" stopColor="#ffd879" />
            <stop offset="20%" stopColor="#f9943b" />
            <stop offset="50%" stopColor="#e1306c" />
            <stop offset="80%" stopColor="#833ab4" />
            <stop offset="100%" stopColor="#405de6" />
          </radialGradient>
        </defs>
      )}
      <rect x="2" y="2" width="20" height="20" rx="6" fill={branded ? 'url(#ig-grad)' : 'currentColor'} />
      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="white" />
    </svg>
  ),
  linkedin: (size, branded) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="4" fill={branded ? '#0A66C2' : 'currentColor'} />
      <path d="M7 10h2v7H7v-7zm1-3a1.1 1.1 0 1 1 0 2.2A1.1 1.1 0 0 1 8 7zm4 3h1.9v.96h.03C14.28 10.57 15.16 10 16.3 10c2.07 0 2.45 1.36 2.45 3.13V17h-2v-3.45c0-.82-.01-1.88-1.14-1.88-1.15 0-1.32.9-1.32 1.82V17H12v-7z" fill="white" />
    </svg>
  ),
  facebook: (size, branded) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" fill={branded ? '#1877F2' : 'currentColor'} />
      <path d="M13.5 8.5H15V6.5h-1.6C11.9 6.5 11 7.4 11 8.8V10H9.5v2H11v5.5h2V12h1.5l.3-2H13v-.9c0-.4.2-.6.5-.6z" fill="white" />
    </svg>
  ),
  tiktok: (size, branded) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" fill={branded ? '#010101' : 'currentColor'} />
      <path d="M15.5 6.5c.4.9 1.1 1.6 2 1.9v1.9a4.8 4.8 0 0 1-2-.5v4.2a3.6 3.6 0 1 1-3.6-3.6h.4v2a1.6 1.6 0 1 0 1.2 1.6V6.5h2z" fill="white" />
    </svg>
  ),
  twitter: (size, branded) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" fill={branded ? '#000000' : 'currentColor'} />
      <path d="M13.3 10.7L17.5 6h-1l-3.6 4.2L10 6H6.5l4.4 6.4L6.5 18h1l3.9-4.5 3.1 4.5H18l-4.7-7.3zm-1.4 1.6l-.4-.6-3.5-5H9.6l2.8 4 .4.6 3.7 5.3h-1.6l-3-4.3z" fill="white" />
    </svg>
  ),
  youtube: (size, branded) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" fill={branded ? '#FF0000' : 'currentColor'} />
      <path d="M19 8.8s-.2-1.3-.8-1.8c-.7-.8-1.5-.8-1.9-.8C14.2 7 12 7 12 7s-2.2 0-4.3.2c-.4 0-1.2 0-1.9.8-.6.5-.8 1.8-.8 1.8S4.8 10.3 4.8 12v1.1c0 1.2.2 2.3.2 2.3s.2 1.3.8 1.8c.7.8 1.7.7 2.2.8C9.2 18 12 18 12 18s2.2 0 4.3-.2c.4 0 1.2 0 1.9-.8.6-.5.8-1.8.8-1.8s.2-1.1.2-2.3V12c0-1.2-.2-2.2-.2-2.2zM10.5 14.5v-5l5 2.5-5 2.5z" fill="white" />
    </svg>
  ),
  threads: (size, branded) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" fill={branded ? '#000000' : 'currentColor'} />
      <path d="M15.2 11.4c-.1-.1-.3-.1-.4-.2-1-.5-2.2-.4-3 .4-.5.5-.7 1.2-.6 1.9.2.9.9 1.5 1.8 1.6.6.1 1.1-.1 1.6-.5.8-.7.9-1.8.6-2.7v-.5zm-2.6-.8c.3 0 .6 0 .9.1-.3-.6-.8-1-1.4-1.2-1.2-.3-2.4.3-2.9 1.4-.5 1.1-.2 2.4.7 3.1.7.6 1.7.7 2.5.3.8-.4 1.3-1.2 1.3-2.1 0-.3 0-.5-.1-.8-.3.1-.6.2-1 .2-.6 0-1.2-.3-1.5-.8-.3-.5-.3-1.2 0-1.7.3-.4.7-.6 1.1-.6.5 0 1 .3 1.2.7.1.2.1.4.1.6.2.2.4.4.7.5.1 0 .2.1.4.1V12c0-1.8-1.5-3.3-3.3-3.3-1.2 0-2.3.7-2.9 1.7-.6 1-.6 2.3 0 3.3.6 1 1.7 1.7 2.9 1.7 1.8 0 3.3-1.5 3.3-3.3v-.2c-.4-.1-.7-.3-1-.5z" fill="white" />
    </svg>
  ),
  pinterest: (size, branded) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" fill={branded ? '#E60023' : 'currentColor'} />
      <path d="M12 5.5c-3.6 0-6.5 2.9-6.5 6.5 0 2.7 1.6 5 4 6-.1-.4-.1-.9 0-1.4l.8-3.3s-.2-.4-.2-1c0-1 .6-1.7 1.3-1.7.6 0 .9.5.9 1 0 .6-.4 1.5-.6 2.4-.2.7.3 1.3 1 1.3 1.2 0 2.2-1.3 2.2-3.1 0-1.6-1.2-2.8-2.9-2.8-2 0-3.1 1.5-3.1 3 0 .6.2 1.2.5 1.5.1.1.1.2.1.3l-.2.8c0 .2-.1.2-.3.1-.9-.4-1.4-1.6-1.4-2.6 0-2.2 1.6-4.1 4.5-4.1 2.4 0 4.2 1.7 4.2 3.9 0 2.3-1.5 4.2-3.5 4.2-.7 0-1.3-.4-1.5-.8l-.4 1.6c-.2.6-.5 1.2-.8 1.7.6.2 1.2.3 1.9.3 3.6 0 6.5-2.9 6.5-6.5S15.6 5.5 12 5.5z" fill="white" />
    </svg>
  ),
};

const SocialIcon: React.FC<SocialIconProps> = ({
  platform,
  size = 20,
  className = '',
  branded = true,
}) => {
  const normalizedPlatform = platform.toLowerCase();
  const iconFn = icons[normalizedPlatform];

  if (!iconFn) {
    return (
      <div
        className={`rounded flex items-center justify-center bg-gray-300 text-gray-600 text-[10px] font-bold ${className}`}
        style={{ width: size, height: size }}
      >
        {platform.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}>
      {iconFn(size, branded)}
    </span>
  );
};

export const getPlatformColor = (platform: string): string => {
  const colors: Record<string, string> = {
    instagram: 'bg-gradient-to-br from-[#f9943b] via-[#e1306c] to-[#833ab4]',
    linkedin: 'bg-[#0A66C2]',
    facebook: 'bg-[#1877F2]',
    tiktok: 'bg-[#010101]',
    twitter: 'bg-[#000000]',
    youtube: 'bg-[#FF0000]',
    threads: 'bg-[#000000]',
    pinterest: 'bg-[#E60023]',
  };
  return colors[platform.toLowerCase()] || 'bg-[#F4FCFE]0';
};

export const getPlatformLabel = (platform: string): string => {
  const labels: Record<string, string> = {
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    facebook: 'Facebook',
    tiktok: 'TikTok',
    twitter: 'X (Twitter)',
    youtube: 'YouTube',
    threads: 'Threads',
    pinterest: 'Pinterest',
  };
  return labels[platform.toLowerCase()] || platform.charAt(0).toUpperCase() + platform.slice(1);
};

export default SocialIcon;
